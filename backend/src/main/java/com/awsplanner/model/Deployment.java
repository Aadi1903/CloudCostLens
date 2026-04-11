package com.awsplanner.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Represents a Terraform deployment record — persisted to SQLite.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "deployments")
public class Deployment {

    @Id
    private String id;

    @Column(nullable = false)
    private String applicationType;

    @Column(nullable = false)
    private String moduleType;  // web_app, scalable_app, storage_app

    @Column(nullable = false)
    private String awsRegion;

    @Column(nullable = false)
    private String instanceType;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private DeploymentStatus status;

    @Column(columnDefinition = "TEXT")
    @Convert(converter = StringListConverter.class)
    private List<String> logs = new ArrayList<>();

    private String publicIp;

    private String endpointUrl;

    @Column(columnDefinition = "TEXT")
    private String resourceSummary;

    private Double estimatedCost;

    private String projectName;

    private LocalDateTime createdAt;

    private LocalDateTime completedAt;

    // Workspace directory where terraform files are stored
    @Column(columnDefinition = "TEXT")
    private String workspaceDir;

    public enum DeploymentStatus {
        PENDING, INITIALIZING, PLANNING, APPLYING, COMPLETED, FAILED, DESTROYING, DESTROYED
    }
}
