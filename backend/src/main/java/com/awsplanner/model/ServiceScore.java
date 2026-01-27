package com.awsplanner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a scored AWS service during decision making
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceScore {
    
    private AwsService service;
    private double score; // 0-100 scale
    private String reason; // Explanation for the score
    
    // Individual score components for transparency
    private double costMatchScore;
    private double scalabilityMatchScore;
    private double operationalMatchScore;
    private double useCaseMatchScore;
}
