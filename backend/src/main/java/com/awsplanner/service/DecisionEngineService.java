package com.awsplanner.service;

import com.awsplanner.model.AwsService;
import com.awsplanner.model.ServiceScore;
import com.awsplanner.model.UserRequirement;
import com.awsplanner.repository.ServiceKnowledgeBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Core decision engine service - implements deterministic, rule-based logic
 * for AWS service selection
 */
@Service
public class DecisionEngineService {
    
    @Autowired
    private ServiceKnowledgeBase knowledgeBase;
    
    @Autowired
    private RequirementService requirementService;
    
    /**
     * Main method to get recommended services based on user requirements
     */
    public List<AwsService> getRecommendedServices(UserRequirement req) {
        // Step 1: Filter services based on requirements
        List<AwsService> eligibleServices = filterServices(req);
        
        // Step 2: Score eligible services
        List<ServiceScore> scoredServices = scoreServices(eligibleServices, req);
        
        // Step 3: Rank and select top services per category
        List<AwsService> selectedServices = rankAndSelect(scoredServices);
        
        // Step 4: Add mandatory services
        selectedServices.addAll(knowledgeBase.getMandatoryServices());
        
        return selectedServices;
    }
    
    /**
     * Filter services based on use case and constraints
     */
    public List<AwsService> filterServices(UserRequirement req) {
        List<AwsService> allServices = knowledgeBase.getAllServices();
        
        return allServices.stream()
            .filter(service -> !service.isMandatory()) // Mandatory services added later
            .filter(service -> matchesUseCase(service, req.getApplicationType()))
            .filter(service -> matchesOperationalEffort(service, req.getOperationalEffort()))
            .filter(service -> matchesDatabaseRequirement(service, req))
            .collect(Collectors.toList());
    }
    
    /**
     * Score services based on how well they match requirements
     * Scoring formula: score = (costMatch * 0.4) + (scalabilityMatch * 0.3) + 
     *                          (operationalMatch * 0.2) + (useCaseMatch * 0.1)
     */
    public List<ServiceScore> scoreServices(List<AwsService> eligible, UserRequirement req) {
        List<ServiceScore> scored = new ArrayList<>();
        
        for (AwsService service : eligible) {
            double costMatchScore = calculateCostMatch(service, req);
            double scalabilityMatchScore = calculateScalabilityMatch(service, req);
            double operationalMatchScore = calculateOperationalMatch(service, req);
            double useCaseMatchScore = calculateUseCaseMatch(service, req);
            
            double totalScore = (costMatchScore * 0.4) + 
                               (scalabilityMatchScore * 0.3) + 
                               (operationalMatchScore * 0.2) + 
                               (useCaseMatchScore * 0.1);
            
            String reason = buildReason(service, costMatchScore, scalabilityMatchScore, 
                                       operationalMatchScore, useCaseMatchScore);
            
            ServiceScore score = new ServiceScore(
                service, totalScore, reason,
                costMatchScore, scalabilityMatchScore, 
                operationalMatchScore, useCaseMatchScore
            );
            
            scored.add(score);
        }
        
        return scored;
    }
    
    /**
     * Rank services and select top service per category
     */
    public List<AwsService> rankAndSelect(List<ServiceScore> scored) {
        // Sort by score descending
        scored.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        
        // Select top service per category
        Map<String, AwsService> selectedByCategory = new HashMap<>();
        
        for (ServiceScore score : scored) {
            String category = score.getService().getCategory();
            
            // Only select if we haven't selected a service for this category yet
            if (!selectedByCategory.containsKey(category)) {
                selectedByCategory.put(category, score.getService());
            }
        }
        
        return new ArrayList<>(selectedByCategory.values());
    }
    
    // ==================== Helper Methods ====================
    
    private boolean matchesUseCase(AwsService service, String applicationType) {
        return service.getUseCases().contains(applicationType);
    }
    
    private boolean matchesOperationalEffort(AwsService service, String operationalEffort) {
        // If user wants low operational effort, exclude high-effort services
        if (operationalEffort.equals("low")) {
            return !service.getOperationalEffort().equals("high");
        }
        // If user wants high operational effort (more control), allow all
        if (operationalEffort.equals("high")) {
            return true;
        }
        // Medium effort: exclude only high-effort services
        return !service.getOperationalEffort().equals("high");
    }
    
    private boolean matchesDatabaseRequirement(AwsService service, UserRequirement req) {
        // If database not needed, filter out database services
        if (!req.getDatabaseNeeded() && service.getCategory().equals("database")) {
            return false;
        }
        return true;
    }
    
    private double calculateCostMatch(AwsService service, UserRequirement req) {
        String costLevel = service.getCostLevel();
        double budget = req.getMonthlyBudget();
        
        // Budget-based scoring
        if (budget < 50) {
            // Low budget: prefer low-cost services
            return switch (costLevel) {
                case "low" -> 100.0;
                case "medium" -> 50.0;
                case "high" -> 20.0;
                default -> 50.0;
            };
        } else if (budget < 200) {
            // Medium budget: prefer medium-cost services
            return switch (costLevel) {
                case "low" -> 80.0;
                case "medium" -> 100.0;
                case "high" -> 60.0;
                default -> 70.0;
            };
        } else {
            // High budget: all services acceptable, slight preference for high-performance
            return switch (costLevel) {
                case "low" -> 70.0;
                case "medium" -> 90.0;
                case "high" -> 100.0;
                default -> 80.0;
            };
        }
    }
    
    private double calculateScalabilityMatch(AwsService service, UserRequirement req) {
        String scalability = service.getScalability();
        String traffic = req.getTraffic();
        
        // Match scalability to traffic needs
        if (traffic.equals("high")) {
            return switch (scalability) {
                case "high" -> 100.0;
                case "medium" -> 60.0;
                case "low" -> 30.0;
                default -> 50.0;
            };
        } else if (traffic.equals("medium")) {
            return switch (scalability) {
                case "high" -> 90.0;
                case "medium" -> 100.0;
                case "low" -> 50.0;
                default -> 70.0;
            };
        } else { // low traffic
            return switch (scalability) {
                case "high" -> 80.0; // Still good, might be over-engineered
                case "medium" -> 90.0;
                case "low" -> 100.0;
                default -> 80.0;
            };
        }
    }
    
    private double calculateOperationalMatch(AwsService service, UserRequirement req) {
        String serviceEffort = service.getOperationalEffort();
        String userPreference = req.getOperationalEffort();
        
        // Exact match gets highest score
        if (serviceEffort.equals(userPreference)) {
            return 100.0;
        }
        
        // Partial matches
        if (userPreference.equals("low")) {
            return switch (serviceEffort) {
                case "low" -> 100.0;
                case "medium" -> 60.0;
                case "high" -> 30.0;
                default -> 50.0;
            };
        } else if (userPreference.equals("medium")) {
            return switch (serviceEffort) {
                case "low" -> 80.0;
                case "medium" -> 100.0;
                case "high" -> 60.0;
                default -> 70.0;
            };
        } else { // high preference (user wants control)
            return switch (serviceEffort) {
                case "low" -> 50.0;
                case "medium" -> 80.0;
                case "high" -> 100.0;
                default -> 70.0;
            };
        }
    }
    
    private double calculateUseCaseMatch(AwsService service, UserRequirement req) {
        // If service is specifically optimized for this use case, give bonus
        List<String> useCases = service.getUseCases();
        
        if (useCases.contains(req.getApplicationType())) {
            // More specific services get higher scores
            if (useCases.size() <= 2) {
                return 100.0; // Specialized service
            } else if (useCases.size() <= 4) {
                return 80.0; // Moderately specialized
            } else {
                return 60.0; // General purpose
            }
        }
        
        return 50.0; // Shouldn't happen due to filtering, but safe default
    }
    
    private String buildReason(AwsService service, double costScore, double scalabilityScore,
                               double operationalScore, double useCaseScore) {
        List<String> reasons = new ArrayList<>();
        
        if (costScore >= 80) {
            reasons.add("cost-effective");
        }
        if (scalabilityScore >= 80) {
            reasons.add("scales well");
        }
        if (operationalScore >= 80) {
            reasons.add("matches operational preference");
        }
        if (useCaseScore >= 80) {
            reasons.add("optimized for use case");
        }
        
        if (reasons.isEmpty()) {
            return "Suitable for requirements";
        }
        
        return String.join(", ", reasons);
    }
}
