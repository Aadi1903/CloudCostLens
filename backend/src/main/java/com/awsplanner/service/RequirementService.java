package com.awsplanner.service;

import com.awsplanner.model.UserRequirement;
import org.springframework.stereotype.Service;

/**
 * Service for validating and normalizing user requirements
 */
@Service
public class RequirementService {
    
    /**
     * Validates user requirements
     * Note: Basic validation is handled by @Valid annotation in controller
     * This method performs additional business logic validation
     */
    public void validateRequirements(UserRequirement req) {
        // Validate application type
        if (!isValidApplicationType(req.getApplicationType())) {
            throw new IllegalArgumentException(
                "Invalid application type. Must be one of: static-website, backend-api, full-stack, file-storage, event-driven"
            );
        }
        
        // Validate traffic level
        if (!isValidLevel(req.getTraffic())) {
            throw new IllegalArgumentException(
                "Invalid traffic level. Must be one of: low, medium, high"
            );
        }
        
        // Validate operational effort
        if (!isValidLevel(req.getOperationalEffort())) {
            throw new IllegalArgumentException(
                "Invalid operational effort. Must be one of: low, medium, high"
            );
        }
    }
    
    /**
     * Normalizes traffic level to numeric value for calculations
     * low: 10,000 requests/month
     * medium: 50,000 requests/month
     * high: 200,000 requests/month
     */
    public int normalizeTraffic(String traffic) {
        return switch (traffic.toLowerCase()) {
            case "low" -> 10000;
            case "medium" -> 50000;
            case "high" -> 200000;
            default -> 10000;
        };
    }
    
    /**
     * Categorizes storage needs
     */
    public String normalizeStorage(int storageGB) {
        if (storageGB < 100) {
            return "small";
        } else if (storageGB < 1000) {
            return "medium";
        } else {
            return "large";
        }
    }
    
    /**
     * Maps operational effort to maintenance level
     */
    public String normalizeOperationalEffort(String effort) {
        return effort.toLowerCase(); // Already in correct format
    }
    
    private boolean isValidApplicationType(String type) {
        return type != null && type.matches("static-website|backend-api|full-stack|file-storage|event-driven");
    }
    
    private boolean isValidLevel(String level) {
        return level != null && level.matches("low|medium|high");
    }
}
