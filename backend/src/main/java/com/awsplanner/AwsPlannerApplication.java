package com.awsplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.io.File;
import java.nio.file.Files;
import java.util.List;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class AwsPlannerApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(AwsPlannerApplication.class, args);
        System.out.println("\n╔══════════════════════════════════════════════════╗");
        System.out.println("║   CloudCostLens — DevSecOps Platform v2.0        ║");
        System.out.println("║   API:      http://localhost:8080/api            ║");
        System.out.println("║   Health:   http://localhost:8080/api/health     ║");
        System.out.println("║   Deploy:   POST /api/deploy                     ║");
        System.out.println("║   History:  GET  /api/deployments                ║");
        System.out.println("╚══════════════════════════════════════════════════╝\n");
    }

    private static void loadDotEnv() {
        File[] possiblePaths = {
            new File("../.env"), // when running inside backend/
            new File(".env")     // fallback
        };
        
        for (File file : possiblePaths) {
            if (file.exists()) {
                try {
                    List<String> lines = Files.readAllLines(file.toPath());
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) continue;
                        String[] parts = line.split("=", 2);
                        if (parts.length == 2 && System.getProperty(parts[0]) == null) {
                            System.setProperty(parts[0].trim(), parts[1].trim());
                        }
                    }
                    System.out.println("[Bootstrap] Loaded environment variables from " + file.getAbsolutePath());
                    return;
                } catch (Exception e) {
                    System.err.println("[Bootstrap] Failed to read .env file: " + e.getMessage());
                }
            }
        }
        System.out.println("[Bootstrap] No .env file found. Relying on OS Environment Variables.");
    }
}
