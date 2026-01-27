package com.awsplanner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a recommended service with cost and explanation
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedService {
    
    private String service;
    private String category;
    private String reason;
    private double estimatedCost;
}
