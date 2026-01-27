package com.awsplanner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents the complete recommendation response
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Recommendation {
    
    private List<RecommendedService> architecture;
    private double totalCost;
    private double budget;
    private boolean withinBudget;
    private List<AlternativeArchitecture> alternatives;
    private List<String> optionalUpgrades;
    private String message; // Additional information or warnings
}
