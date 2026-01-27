package com.awsplanner.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents user requirements for AWS service recommendation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequirement {
    
    @NotBlank(message = "Application type is required")
    private String applicationType; // static-website, backend-api, full-stack, file-storage, event-driven
    
    @NotBlank(message = "Traffic level is required")
    private String traffic; // low, medium, high
    
    @NotNull(message = "Storage is required")
    @Min(value = 0, message = "Storage must be non-negative")
    private Integer storageGB;
    
    @NotNull(message = "Database requirement is required")
    private Boolean databaseNeeded;
    
    @NotBlank(message = "Operational effort is required")
    private String operationalEffort; // low, medium, high
    
    @NotNull(message = "Monthly budget is required")
    @Min(value = 1, message = "Budget must be at least $1")
    private Double monthlyBudget;
}
