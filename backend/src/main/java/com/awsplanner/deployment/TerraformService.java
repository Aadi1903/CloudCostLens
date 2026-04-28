package com.awsplanner.deployment;

import com.awsplanner.deployment.Deployment.DeploymentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.*;
import java.nio.file.*;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Core Terraform automation engine.
 * Manages the full lifecycle: init → plan → apply → destroy
 *
 * AWS Credential resolution order:
 *   1. System environment variables (set by start-backend.bat via .env)
 *   2. Spring application properties (aws.access.key.id, aws.secret.access.key)
 *   3. If neither found, deployment is rejected with a clear error message
 */
@Service
public class TerraformService {

    private static final Logger log = LoggerFactory.getLogger(TerraformService.class);

    @Autowired
    private DeploymentRepository deploymentRepository;

    @Autowired
    private TaskScheduler taskScheduler;

    @Value("${terraform.workspace.base:../terraform/workspaces}")
    private String workspaceBase;

    @Value("${terraform.environment.path:../terraform/environments/dynamic}")
    private String terraformEnvPath;

    @Value("${terraform.binary:terraform}")
    private String terraformBinary;

    @Value("${aws.access.key.id:}")
    private String awsAccessKeyId;

    @Value("${aws.secret.access.key:}")
    private String awsSecretAccessKey;

    @Value("${aws.region:us-east-1}")
    private String awsRegion;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final Map<String, Process> activeProcesses = new ConcurrentHashMap<>();

    // ===== Credential Helpers =====

    private String resolveCredential(String envVarName, String springValue) {
        String fromEnv = System.getenv(envVarName);
        if (fromEnv != null && !fromEnv.isBlank()) return fromEnv;
        if (springValue != null && !springValue.isBlank()) return springValue;
        return null;
    }

    public boolean hasAwsCredentials() {
        String keyId     = resolveCredential("AWS_ACCESS_KEY_ID", awsAccessKeyId);
        String secretKey = resolveCredential("AWS_SECRET_ACCESS_KEY", awsSecretAccessKey);
        return keyId != null && secretKey != null;
    }

    public String credentialStatus() {
        String keyId = resolveCredential("AWS_ACCESS_KEY_ID", awsAccessKeyId);
        if (keyId == null) return "MISSING";
        return "CONFIGURED (KEY: " + keyId.substring(0, Math.min(8, keyId.length())) + "...)";
    }

    // ===== Module selection =====

    public String resolveModuleType(String applicationType) {
        return switch (applicationType.toLowerCase()) {
            case "static-website", "file-storage"  -> "storage_app";
            case "backend-api", "full-stack"        -> "web_app";
            case "event-driven"                     -> "scalable_app";
            default                                 -> "web_app";
        };
    }

    public String resolveInstanceType(String traffic, String moduleType) {
        if ("storage_app".equals(moduleType)) return "N/A";
        return switch (traffic.toLowerCase()) {
            case "low"    -> "t3.micro";
            case "medium" -> "t3.small";
            case "high"   -> "t3.medium";
            default       -> "t3.micro";
        };
    }

    // ===== Async Deployment =====

    @Async
    public void runDeployment(String deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new IllegalArgumentException("Deployment not found: " + deploymentId));
        try {
            checkTerraformInstallation();

            if (!hasAwsCredentials()) {
                handleFailure(deployment,
                    "❌ AWS credentials are not configured.\n" +
                    "   Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file\n" +
                    "   and restart the backend using start-backend.bat");
                return;
            }

            appendLog(deployment, "🔑 AWS credentials verified: " + credentialStatus());
            appendLog(deployment, "⚙️  Preparing Terraform workspace...");
            updateStatus(deployment, DeploymentStatus.INITIALIZING);

            Path workspaceDir = prepareWorkspace(deployment);
            deployment.setWorkspaceDir(workspaceDir.toAbsolutePath().toString());
            deploymentRepository.save(deployment);

            writeTfvars(deployment, workspaceDir);
            appendLog(deployment, "✅ terraform.tfvars written successfully");

            appendLog(deployment, "🔧 Running: terraform init");
            runTerraformCommand(deployment, workspaceDir, "init", "-no-color", "-input=false");
            appendLog(deployment, "✅ Terraform initialized");

            appendLog(deployment, "📋 Running: terraform plan");
            updateStatus(deployment, DeploymentStatus.PLANNING);
            runTerraformCommand(deployment, workspaceDir, "plan", "-no-color", "-input=false",
                    "-var-file=terraform.tfvars");
            appendLog(deployment, "✅ Terraform plan completed");

            appendLog(deployment, "🚀 Running: terraform apply -auto-approve");
            updateStatus(deployment, DeploymentStatus.APPLYING);
            runTerraformCommand(deployment, workspaceDir, "apply",
                    "-auto-approve", "-no-color", "-input=false", "-var-file=terraform.tfvars");
            appendLog(deployment, "✅ Terraform apply completed!");

            appendLog(deployment, "📤 Extracting outputs...");
            parseAndSaveOutputs(deployment, workspaceDir);

            deployment.setStatus(DeploymentStatus.COMPLETED);
            deployment.setCompletedAt(LocalDateTime.now());
            appendLog(deployment, "🎉 Deployment COMPLETED successfully!");
            
            appendLog(deployment, "⏱ Auto-destroy scheduled in 2 hours to manage costs.");
            taskScheduler.schedule(() -> {
                log.info("Starting scheduled auto-destroy for deployment {}", deploymentId);
                runDestroy(deploymentId);
            }, Instant.now().plus(Duration.ofHours(2)));

            deploymentRepository.save(deployment);

        } catch (TerraformNotFoundException e) {
            handleFailure(deployment,
                "❌ Terraform binary not found.\n" +
                "   Install from https://developer.hashicorp.com/terraform/downloads\n" +
                "   and ensure 'terraform' is in your system PATH.");
        } catch (Exception e) {
            log.error("Deployment {} failed", deploymentId, e);
            handleFailure(deployment, "❌ Deployment failed: " + e.getMessage());
        }
    }

    public String runPlan(String deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new IllegalArgumentException("Deployment not found: " + deploymentId));

        if (!hasAwsCredentials()) {
            return "ERROR: AWS credentials are not configured. " +
                   "Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in your .env file " +
                   "and restart the backend using start-backend.bat";
        }

        try {
            checkTerraformInstallation();
            Path workspaceDir;
            if (deployment.getWorkspaceDir() != null && !deployment.getWorkspaceDir().isBlank()) {
                workspaceDir = Paths.get(deployment.getWorkspaceDir());
            } else {
                workspaceDir = prepareWorkspace(deployment);
                deployment.setWorkspaceDir(workspaceDir.toAbsolutePath().toString());
                deploymentRepository.save(deployment);
                writeTfvars(deployment, workspaceDir);
                runTerraformCommand(deployment, workspaceDir, "init", "-no-color", "-input=false");
            }
            StringBuilder planOutput = new StringBuilder();
            runTerraformCommandWithCapture(workspaceDir, planOutput,
                    "plan", "-no-color", "-input=false", "-var-file=terraform.tfvars");
            return planOutput.toString();
        } catch (TerraformNotFoundException e) {
            return "ERROR: Terraform not found. Please install Terraform CLI.";
        } catch (Exception e) {
            return "ERROR: " + e.getMessage();
        }
    }

    @Async
    public void runDestroy(String deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new IllegalArgumentException("Deployment not found: " + deploymentId));
        try {
            if (!hasAwsCredentials()) {
                handleFailure(deployment, "❌ AWS credentials are not configured. Cannot destroy.");
                return;
            }
            updateStatus(deployment, DeploymentStatus.DESTROYING);
            appendLog(deployment, "💣 Running: terraform destroy -auto-approve");
            Path workspaceDir = Paths.get(deployment.getWorkspaceDir());
            if (!Files.exists(workspaceDir)) {
                throw new IllegalStateException("Workspace directory not found: " + workspaceDir);
            }
            runTerraformCommand(deployment, workspaceDir,
                    "destroy", "-auto-approve", "-no-color", "-input=false", "-var-file=terraform.tfvars");
            deployment.setStatus(DeploymentStatus.DESTROYED);
            deployment.setPublicIp(null);
            deployment.setEndpointUrl(null);
            deployment.setCompletedAt(LocalDateTime.now());
            appendLog(deployment, "✅ Infrastructure destroyed successfully");
            deploymentRepository.save(deployment);
        } catch (Exception e) {
            log.error("Destroy {} failed", deploymentId, e);
            handleFailure(deployment, "❌ Destroy failed: " + e.getMessage());
        }
    }

    public void stopDeployment(String deploymentId) {
        Process process = activeProcesses.get(deploymentId);
        if (process != null && process.isAlive()) {
            log.info("Stopping deployment {} on user request", deploymentId);
            process.destroyForcibly();
            activeProcesses.remove(deploymentId);
            Deployment deployment = deploymentRepository.findById(deploymentId).orElse(null);
            if (deployment != null) {
                handleFailure(deployment, "🛑 Deployment cancelled by user.");
            }
        } else {
            log.warn("Attempted to stop deployment {} but no active process found", deploymentId);
        }
    }

    // ===== Active Resources Discovery =====

    public List<String> getDeploymentResources(String deploymentId) {
        Deployment deployment = deploymentRepository.findById(deploymentId)
                .orElseThrow(() -> new IllegalArgumentException("Deployment not found: " + deploymentId));
        if (deployment.getWorkspaceDir() == null || deployment.getWorkspaceDir().isBlank()) {
            return Collections.emptyList();
        }
        try {
            Path workspaceDir = Paths.get(deployment.getWorkspaceDir());
            if (!Files.exists(workspaceDir.resolve("terraform.tfstate"))) {
                return Collections.emptyList();
            }
            List<String> command = buildCommand("state", "list");
            ProcessBuilder pb = buildProcess(command, workspaceDir);
            Process process = pb.start();
            List<String> resources = new ArrayList<>();
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    if (line.isBlank() || line.startsWith("Warning:")) continue;
                    String cleanName = humanizeResourceName(line.trim());
                    if (cleanName != null) resources.add(cleanName);
                }
            }
            process.waitFor(30, TimeUnit.SECONDS);
            Map<String, Integer> counts = new HashMap<>();
            for (String r : resources) counts.put(r, counts.getOrDefault(r, 0) + 1);
            List<String> formatted = new ArrayList<>();
            for (Map.Entry<String, Integer> entry : counts.entrySet()) {
                formatted.add(entry.getValue() > 1 ? entry.getKey() + " (" + entry.getValue() + ")" : entry.getKey());
            }
            Collections.sort(formatted);
            return formatted;
        } catch (Exception e) {
            log.warn("Failed to retrieve resources for {}: {}", deploymentId, e.getMessage());
            return Collections.emptyList();
        }
    }

    private String humanizeResourceName(String terraformName) {
        if (terraformName.startsWith("aws_instance.")) return "AWS EC2 Compute Instance";
        if (terraformName.startsWith("aws_security_group.")) return "AWS Security Group";
        if (terraformName.startsWith("aws_lb.")) return "AWS Application Load Balancer";
        if (terraformName.startsWith("aws_lb_target_group.")) return "AWS Target Group";
        if (terraformName.startsWith("aws_lb_listener.")) return "AWS Load Balancer Listener";
        if (terraformName.startsWith("aws_autoscaling_group.")) return "AWS Auto Scaling Group";
        if (terraformName.startsWith("aws_launch_template.")) return "AWS EC2 Launch Template";
        if (terraformName.startsWith("aws_s3_bucket.")) return "AWS S3 Storage Bucket";
        if (terraformName.startsWith("aws_cloudfront_distribution.")) return "AWS CloudFront CDN";
        if (terraformName.startsWith("aws_cloudfront_origin_access_control.")) return "AWS CloudFront OAC";
        if (terraformName.startsWith("data.") || terraformName.startsWith("random_")) return null;
        return terraformName;
    }

    // ===== Private helpers =====

    private Path prepareWorkspace(Deployment deployment) throws IOException {
        Path base = Paths.get(workspaceBase).toAbsolutePath();
        Path workspace = base.resolve(deployment.getId());
        Files.createDirectories(workspace);
        Path templateDirInitial = Paths.get(terraformEnvPath).toAbsolutePath();
        final Path templateDir = Files.exists(templateDirInitial)
                ? templateDirInitial
                : Paths.get(System.getProperty("user.dir")).resolve(terraformEnvPath);
        if (Files.exists(templateDir)) {
            try (var stream = Files.walk(templateDir)) {
                stream.forEach(source -> {
                    try {
                        Path dest = workspace.resolve(templateDir.relativize(source));
                        if (Files.isDirectory(source)) Files.createDirectories(dest);
                        else Files.copy(source, dest, StandardCopyOption.REPLACE_EXISTING);
                    } catch (IOException e) { throw new UncheckedIOException(e); }
                });
            }
            appendLog(deployment, "📂 Workspace populated from: " + templateDir);
        } else {
            appendLog(deployment, "⚠️  Terraform template directory not found at: " + templateDir);
            log.warn("Terraform template not found at {}", templateDir);
        }
        return workspace;
    }

    private void writeTfvars(Deployment deployment, Path workspaceDir) throws IOException {
        StringBuilder tfvars = new StringBuilder();
        tfvars.append("# Auto-generated by CloudCostLens — DO NOT EDIT MANUALLY\n\n");
        tfvars.append("aws_region       = \"").append(deployment.getAwsRegion()).append("\"\n");
        tfvars.append("module_type      = \"").append(deployment.getModuleType()).append("\"\n");
        tfvars.append("project_name     = \"").append(sanitize(deployment.getProjectName())).append("\"\n");
        tfvars.append("environment      = \"production\"\n");
        tfvars.append("instance_type    = \"").append(deployment.getInstanceType()).append("\"\n");
        String amiId = getAmiForRegion(deployment.getAwsRegion());
        tfvars.append("ami_id           = \"").append(amiId).append("\"\n");
        if ("scalable_app".equals(deployment.getModuleType())) {
            tfvars.append("min_instances    = 1\n");
            tfvars.append("max_instances    = 4\n");
            tfvars.append("desired_instances = 2\n");
        }
        tfvars.append("enable_cloudfront = false\n");
        Files.writeString(workspaceDir.resolve("terraform.tfvars"), tfvars.toString());
    }

    private void runTerraformCommand(Deployment deployment, Path workspaceDir, String... args)
            throws IOException, InterruptedException {
        List<String> command = buildCommand(args);
        ProcessBuilder pb = buildProcess(command, workspaceDir);
        appendLog(deployment, "$ " + String.join(" ", command));
        Process process = pb.start();
        activeProcesses.put(deployment.getId(), process);
        try {
            Thread outputThread = captureOutputAsync(process, deployment);
            boolean finished = process.waitFor(10, TimeUnit.MINUTES);
            outputThread.join(5000);
            if (!finished) {
                process.destroyForcibly();
                throw new RuntimeException("Terraform command timed out after 10 minutes");
            }
            int exitCode = process.exitValue();
            if (exitCode != 0) {
                throw new RuntimeException("Terraform exited with code " + exitCode +
                    " — check the logs above for details");
            }
        } finally {
            activeProcesses.remove(deployment.getId());
        }
    }

    private void checkTerraformInstallation() {
        String binary = getBinaryName();
        boolean found = false;
        String pathEnv = System.getenv("PATH");
        if (pathEnv != null) {
            for (String dir : pathEnv.split(File.pathSeparator)) {
                File file = new File(dir, binary);
                if (file.exists() && file.canExecute()) { found = true; break; }
            }
        }
        if (!found) {
            try {
                Process p = new ProcessBuilder(binary, "-version").start();
                p.waitFor(2, TimeUnit.SECONDS);
                if (p.exitValue() == 0) found = true;
            } catch (Exception ignored) {}
        }
        if (!found) {
            log.error("Terraform binary '{}' not found in system PATH", binary);
            throw new TerraformNotFoundException("Terraform is NOT installed or NOT in your system PATH.");
        }
    }

    private String getBinaryName() {
        return System.getProperty("os.name", "").toLowerCase().contains("win")
                && !terraformBinary.endsWith(".exe")
                ? terraformBinary + ".exe"
                : terraformBinary;
    }

    private void runTerraformCommandWithCapture(Path workspaceDir, StringBuilder output, String... args)
            throws IOException, InterruptedException {
        List<String> command = buildCommand(args);
        ProcessBuilder pb = buildProcess(command, workspaceDir);
        Process process = pb.start();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) output.append(line).append("\n");
        }
        process.waitFor(5, TimeUnit.MINUTES);
    }

    private List<String> buildCommand(String... args) {
        String binary = System.getProperty("os.name", "").toLowerCase().contains("win")
                && !terraformBinary.endsWith(".exe")
                ? terraformBinary + ".exe" : terraformBinary;
        boolean found = false;
        for (String dir : System.getenv("PATH").split(File.pathSeparator)) {
            if (new File(dir, binary).exists() || new File(dir, "terraform").exists()) { found = true; break; }
        }
        if (!found) binary = terraformBinary;
        List<String> command = new ArrayList<>();
        command.add(binary);
        command.addAll(Arrays.asList(args));
        return command;
    }

    private ProcessBuilder buildProcess(List<String> command, Path workspaceDir) {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(workspaceDir.toFile());
        pb.redirectErrorStream(true);
        Map<String, String> env = pb.environment();
        injectEnvVar(env, "AWS_ACCESS_KEY_ID",     awsAccessKeyId);
        injectEnvVar(env, "AWS_SECRET_ACCESS_KEY", awsSecretAccessKey);
        injectEnvVar(env, "AWS_DEFAULT_REGION",    awsRegion);
        String sessionToken = System.getenv("AWS_SESSION_TOKEN");
        if (sessionToken != null && !sessionToken.isBlank()) env.put("AWS_SESSION_TOKEN", sessionToken);
        env.put("CHECKPOINT_DISABLE", "1");
        env.put("TF_IN_AUTOMATION", "1");
        return pb;
    }

    private void injectEnvVar(Map<String, String> env, String key, String springFallback) {
        String fromEnv = System.getenv(key);
        if (fromEnv != null && !fromEnv.isBlank()) { env.put(key, fromEnv); }
        else if (springFallback != null && !springFallback.isBlank()) {
            env.put(key, springFallback);
            log.debug("Using Spring property fallback for {}", key);
        }
    }

    private Thread captureOutputAsync(Process process, Deployment deployment) {
        Thread t = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream()))) {
                String line;
                while ((line = reader.readLine()) != null) appendLog(deployment, line);
            } catch (IOException e) { log.warn("Output capture interrupted: {}", e.getMessage()); }
        }, "terraform-output-" + deployment.getId().substring(0, 8));
        t.setDaemon(true);
        t.start();
        return t;
    }

    private void parseAndSaveOutputs(Deployment deployment, Path workspaceDir)
            throws IOException, InterruptedException {
        List<String> command = buildCommand("output", "-json");
        ProcessBuilder pb = buildProcess(command, workspaceDir);
        Process process = pb.start();
        StringBuilder outputJson = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) outputJson.append(line);
        }
        process.waitFor(30, TimeUnit.SECONDS);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> outputs = objectMapper.readValue(outputJson.toString(), Map.class);
            deployment.setPublicIp(extractStringOutput(outputs, "public_ip"));
            deployment.setEndpointUrl(extractStringOutput(outputs, "endpoint_url"));
            deployment.setResourceSummary(buildResourceSummary(deployment));
        } catch (Exception e) {
            log.warn("Could not parse terraform outputs: {}", e.getMessage());
            deployment.setResourceSummary(
                "Deployment completed. Run 'terraform output' in the workspace directory to see details.");
        }
        deploymentRepository.save(deployment);
    }

    @SuppressWarnings("unchecked")
    private String extractStringOutput(Map<String, Object> outputs, String key) {
        if (outputs.containsKey(key)) {
            Object val = outputs.get(key);
            if (val instanceof Map) {
                Object v = ((Map<?, ?>) val).get("value");
                return v != null ? v.toString() : "";
            }
        }
        return "";
    }

    private String buildResourceSummary(Deployment deployment) {
        return String.format("Module: %s | Region: %s | Instance: %s | Provisioned via Terraform",
            deployment.getModuleType(), deployment.getAwsRegion(), deployment.getInstanceType());
    }

    private void appendLog(Deployment deployment, String message) {
        String timestamp = java.time.LocalTime.now().toString().substring(0, 8);
        deployment.getLogs().add("[" + timestamp + "] " + message);
        deploymentRepository.save(deployment);
    }

    private void updateStatus(Deployment deployment, DeploymentStatus status) {
        deployment.setStatus(status);
        deploymentRepository.save(deployment);
    }

    private void handleFailure(Deployment deployment, String message) {
        deployment.setStatus(DeploymentStatus.FAILED);
        deployment.setCompletedAt(LocalDateTime.now());
        appendLog(deployment, message);
        deploymentRepository.save(deployment);
    }

    private String getAmiForRegion(String region) {
        return switch (region) {
            case "us-east-1"      -> "ami-0c02fb55956c7d316";
            case "us-east-2"      -> "ami-0103f211a154d64a6";
            case "us-west-1"      -> "ami-05655c267c89566dd";
            case "us-west-2"      -> "ami-098e42ae54c764c35";
            case "eu-west-1"      -> "ami-0d71ea30463e0ff8d";
            case "eu-west-2"      -> "ami-0bdcc6c49a3bffa96";
            case "eu-central-1"   -> "ami-09d95fab7fff3776c";
            case "ap-south-1"     -> "ami-0851b76e8b1bce90b";
            case "ap-southeast-1" -> "ami-0b825ad86ddcfb907";
            case "ap-southeast-2" -> "ami-0a58e22c727337c51";
            case "ap-northeast-1" -> "ami-0404778e217f54308";
            default               -> "ami-0c02fb55956c7d316";
        };
    }

    private String sanitize(String input) {
        if (input == null) return "cloudcostlens";
        return input.replaceAll("[^a-zA-Z0-9-]", "-").toLowerCase();
    }

    // Custom exception so frontend can show a friendly message
    public static class TerraformNotFoundException extends RuntimeException {
        public TerraformNotFoundException(String msg) { super(msg); }
    }
}
