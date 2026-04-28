package com.awsplanner.deployment;

import com.awsplanner.deployment.Deployment.DeploymentStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for infrastructure deployment operations.
 */
@RestController
@RequestMapping("/api")
public class DeploymentController {

    @Autowired
    private TerraformService terraformService;

    @Autowired
    private DeploymentRepository deploymentRepository;

    /**
     * POST /api/deploy
     * Starts a new Terraform deployment asynchronously.
     */
    @PostMapping("/deploy")
    public ResponseEntity<?> startDeployment(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> requirements = (Map<String, Object>) body.get("requirements");
            @SuppressWarnings("unchecked")
            Map<String, Object> recommendation = (Map<String, Object>) body.get("recommendation");

            if (requirements == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "requirements field is required"));
            }

            String applicationType = (String) requirements.getOrDefault("applicationType", "backend-api");
            String traffic = (String) requirements.getOrDefault("traffic", "low");
            String region = (String) requirements.getOrDefault("awsRegion", "us-east-1");
            double estimatedCost = recommendation != null
                    ? ((Number) recommendation.getOrDefault("totalCost", 0.0)).doubleValue()
                    : 0.0;

            String moduleType = terraformService.resolveModuleType(applicationType);
            String instanceType = terraformService.resolveInstanceType(traffic, moduleType);

            String deploymentId = UUID.randomUUID().toString();
            Deployment deployment = new Deployment();
            deployment.setId(deploymentId);
            deployment.setApplicationType(applicationType);
            deployment.setModuleType(moduleType);
            deployment.setAwsRegion(region);
            deployment.setInstanceType(instanceType);
            deployment.setStatus(DeploymentStatus.PENDING);
            deployment.setProjectName("ccl-" + deploymentId.substring(0, 8));
            deployment.setEstimatedCost(estimatedCost);
            deployment.setCreatedAt(LocalDateTime.now());
            deployment.getLogs().add("[" + java.time.LocalTime.now().toString().substring(0, 8) + "] \uD83C\uDFC1 Deployment queued: " + deploymentId);

            deploymentRepository.save(deployment);
            terraformService.runDeployment(deploymentId);

            Map<String, Object> response = new HashMap<>();
            response.put("deploymentId", deploymentId);
            response.put("status", DeploymentStatus.PENDING.name());
            response.put("moduleType", moduleType);
            response.put("instanceType", instanceType);
            response.put("message", "Deployment started. Poll /api/deploy/" + deploymentId + "/status for updates.");

            return ResponseEntity.accepted().body(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start deployment: " + e.getMessage()));
        }
    }

    @GetMapping("/deploy/{id}/status")
    public ResponseEntity<?> getDeploymentStatus(@PathVariable String id) {
        return deploymentRepository.findById(id)
                .map(d -> {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("id", d.getId());
                    resp.put("status", d.getStatus().name());
                    resp.put("applicationType", d.getApplicationType());
                    resp.put("moduleType", d.getModuleType());
                    resp.put("awsRegion", d.getAwsRegion());
                    resp.put("instanceType", d.getInstanceType());
                    resp.put("logs", d.getLogs());
                    resp.put("publicIp", d.getPublicIp());
                    resp.put("endpointUrl", d.getEndpointUrl());
                    resp.put("resourceSummary", d.getResourceSummary());
                    resp.put("estimatedCost", d.getEstimatedCost());
                    resp.put("projectName", d.getProjectName());
                    resp.put("createdAt", d.getCreatedAt() != null ? d.getCreatedAt().toString() : null);
                    resp.put("completedAt", d.getCompletedAt() != null ? d.getCompletedAt().toString() : null);
                    return ResponseEntity.ok(resp);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/deploy/{id}/plan")
    public ResponseEntity<?> getTerraformPlan(@PathVariable String id) {
        return deploymentRepository.findById(id)
                .map(d -> {
                    String planOutput = terraformService.runPlan(id);
                    return ResponseEntity.ok(Map.of("deploymentId", id, "planOutput", planOutput));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/deploy/plan-preview")
    public ResponseEntity<?> createPlanPreview(@RequestBody Map<String, Object> body) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> requirements = (Map<String, Object>) body.get("requirements");
            if (requirements == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "requirements field is required"));
            }

            String applicationType = (String) requirements.getOrDefault("applicationType", "backend-api");
            String traffic = (String) requirements.getOrDefault("traffic", "low");
            String region = (String) requirements.getOrDefault("awsRegion", "us-east-1");

            String moduleType = terraformService.resolveModuleType(applicationType);
            String instanceType = terraformService.resolveInstanceType(traffic, moduleType);

            String deploymentId = UUID.randomUUID().toString();
            Deployment deployment = new Deployment();
            deployment.setId(deploymentId);
            deployment.setApplicationType(applicationType);
            deployment.setModuleType(moduleType);
            deployment.setAwsRegion(region);
            deployment.setInstanceType(instanceType);
            deployment.setStatus(DeploymentStatus.PLANNING);
            deployment.setProjectName("ccl-plan-" + deploymentId.substring(0, 8));
            deployment.setCreatedAt(LocalDateTime.now());
            deploymentRepository.save(deployment);

            String planOutput = terraformService.runPlan(deploymentId);

            return ResponseEntity.ok(Map.of(
                    "deploymentId", deploymentId,
                    "moduleType", moduleType,
                    "instanceType", instanceType,
                    "planOutput", planOutput
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Plan preview failed: " + e.getMessage()));
        }
    }

    @PostMapping("/deploy/{id}/destroy")
    public ResponseEntity<?> destroyDeployment(@PathVariable String id) {
        return deploymentRepository.findById(id)
                .map(d -> {
                    if (d.getStatus() != DeploymentStatus.COMPLETED &&
                        d.getStatus() != DeploymentStatus.FAILED) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Can only destroy COMPLETED or FAILED deployments"));
                    }
                    terraformService.runDestroy(id);
                    return ResponseEntity.accepted()
                            .body(Map.of("message", "Destroy initiated", "deploymentId", id));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/deploy/{id}/stop")
    public ResponseEntity<?> stopDeployment(@PathVariable String id) {
        return deploymentRepository.findById(id)
                .map(d -> {
                    String status = d.getStatus().name();
                    if (!status.equals("INITIALIZING") && !status.equals("PLANNING") && !status.equals("APPLYING")) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Can only stop active deployments (current status: " + status + ")"));
                    }
                    terraformService.stopDeployment(id);
                    return ResponseEntity.ok(Map.of("message", "Termination signal sent", "deploymentId", id));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/deployments")
    public ResponseEntity<List<Deployment>> getAllDeployments() {
        return ResponseEntity.ok(deploymentRepository.findAllByOrderByCreatedAtDesc());
    }

    @GetMapping("/deploy/module-info")
    public ResponseEntity<?> getModuleInfo(
            @RequestParam String applicationType,
            @RequestParam(defaultValue = "low") String traffic) {
        String moduleType = terraformService.resolveModuleType(applicationType);
        String instanceType = terraformService.resolveInstanceType(traffic, moduleType);
        return ResponseEntity.ok(Map.of(
                "moduleType", moduleType,
                "instanceType", instanceType,
                "description", describeModule(moduleType)
        ));
    }

    private String describeModule(String moduleType) {
        return switch (moduleType) {
            case "web_app"      -> "EC2 instance + Security Group with HTTP/HTTPS access";
            case "scalable_app" -> "Application Load Balancer + Auto Scaling Group (1–4 instances)";
            case "storage_app"  -> "S3 Bucket (versioned, encrypted) + optional CloudFront CDN";
            default             -> "Standard web application module";
        };
    }

    @GetMapping("/deploy/{deploymentId}/resources")
    public ResponseEntity<?> getDeploymentResources(@PathVariable String deploymentId) {
        try {
            List<String> resources = terraformService.getDeploymentResources(deploymentId);
            return ResponseEntity.ok(resources);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
