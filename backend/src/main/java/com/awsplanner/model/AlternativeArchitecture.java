package com.awsplanner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents an alternative architecture option
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlternativeArchitecture {
    
    private String name; // e.g., "Budget-Optimized", "Performance-Optimized"
    private List<String> services;
    private double totalCost;
    private String description;
}
