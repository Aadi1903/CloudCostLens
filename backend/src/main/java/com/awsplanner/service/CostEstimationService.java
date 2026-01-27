package com.awsplanner.service;

import com.awsplanner.model.*;
import com.awsplanner.repository.ServiceKnowledgeBase;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Service for calculating AWS service costs and validating budgets
 */
@Service
public class CostEstimationService {
    
    @Autowired
    private ServiceKnowledgeBase knowledgeBase;
    
    @Autowired
    private RequirementService requirementService;
    
    /**
     * Calculate monthly cost for selected services
     */
    public double calculateMonthlyCost(List<AwsService> services, UserRequirement req) {
        double totalCost = 0.0;
        
        for (AwsService service : services) {
            double serviceCost = calculateServiceCost(service, req);
            totalCost += serviceCost;
        }
        
        return Math.round(totalCost * 100.0) / 100.0; // Round to 2 decimal places
    }
    
    /**
     * Calculate cost for individual service
     */
    public double calculateServiceCost(AwsService service, UserRequirement req) {
        Map<String, Double> pricing = knowledgeBase.getPricingForService(service.getId());
        
        if (pricing == null) {
            return 0.0;
        }
        
        double cost = pricing.getOrDefault("baseCost", 0.0);
        
        // Add traffic-based costs
        int trafficRequests = requirementService.normalizeTraffic(req.getTraffic());
        
        if (pricing.containsKey("perTrafficUnit")) {
            // Traffic unit = 10k requests
            int trafficUnits = trafficRequests / 10000;
            cost += pricing.get("perTrafficUnit") * trafficUnits;
        }
        
        if (pricing.containsKey("perMillionRequests")) {
            double millionRequests = trafficRequests / 1000000.0;
            cost += pricing.get("perMillionRequests") * millionRequests;
        }
        
        // Add storage-based costs
        if (pricing.containsKey("perGB") || pricing.containsKey("perStorageGB")) {
            double perGB = pricing.getOrDefault("perGB", 
                                               pricing.getOrDefault("perStorageGB", 0.0));
            cost += perGB * req.getStorageGB();
        }
        
        if (pricing.containsKey("perGBStorage")) {
            cost += pricing.get("perGBStorage") * req.getStorageGB();
        }
        
        return Math.round(cost * 100.0) / 100.0;
    }
    
    /**
     * Validate if total cost is within budget
     */
    public boolean validateBudget(double totalCost, double budget) {
        return totalCost <= budget;
    }
    
    /**
     * Create list of recommended services with costs
     */
    public List<RecommendedService> createRecommendedServices(
            List<AwsService> services, UserRequirement req) {
        
        List<RecommendedService> recommended = new ArrayList<>();
        
        for (AwsService service : services) {
            double cost = calculateServiceCost(service, req);
            String reason = generateReason(service, req);
            
            RecommendedService recService = new RecommendedService(
                service.getName(),
                service.getCategory(),
                reason,
                cost
            );
            
            recommended.add(recService);
        }
        
        return recommended;
    }
    
    /**
     * Suggest alternative architectures if over budget or for optimization
     */
    public List<AlternativeArchitecture> suggestAlternatives(
            List<AwsService> currentServices, UserRequirement req) {
        
        List<AlternativeArchitecture> alternatives = new ArrayList<>();
        
        // Budget-optimized alternative
        AlternativeArchitecture budgetOptimized = createBudgetOptimizedArchitecture(req);
        if (budgetOptimized != null) {
            alternatives.add(budgetOptimized);
        }
        
        // Performance-optimized alternative (if budget allows)
        if (req.getMonthlyBudget() > 100) {
            AlternativeArchitecture performanceOptimized = 
                createPerformanceOptimizedArchitecture(req);
            if (performanceOptimized != null) {
                alternatives.add(performanceOptimized);
            }
        }
        
        return alternatives;
    }
    
    // ==================== Helper Methods ====================
    
    private String generateReason(AwsService service, UserRequirement req) {
        List<String> reasons = new ArrayList<>();
        
        // Add specific reasons based on service and requirements
        if (service.getOperationalEffort().equals("low") && 
            req.getOperationalEffort().equals("low")) {
            reasons.add("Fully managed, minimal maintenance");
        }
        
        if (service.getCostLevel().equals("low")) {
            reasons.add("Cost-effective");
        }
        
        if (service.getScalability().equals("high") && 
            req.getTraffic().equals("high")) {
            reasons.add("Scales automatically to handle high traffic");
        }
        
        if (service.getUseCases().contains(req.getApplicationType())) {
            reasons.add("Optimized for " + req.getApplicationType().replace("-", " "));
        }
        
        if (reasons.isEmpty()) {
            return service.getDescription();
        }
        
        return String.join(", ", reasons);
    }
    
    private AlternativeArchitecture createBudgetOptimizedArchitecture(UserRequirement req) {
        List<String> services = new ArrayList<>();
        double totalCost = 0.0;
        
        switch (req.getApplicationType()) {
            case "static-website":
                services.add("Amazon S3");
                services.add("Amazon CloudFront");
                services.add("AWS IAM");
                totalCost = 5.0; // Approximate
                break;
                
            case "backend-api":
                services.add("AWS Lambda");
                services.add("Amazon API Gateway");
                if (req.getDatabaseNeeded()) {
                    services.add("Amazon DynamoDB");
                    totalCost = 15.0;
                } else {
                    totalCost = 8.0;
                }
                services.add("Amazon CloudWatch");
                services.add("AWS IAM");
                break;
                
            case "full-stack":
                services.add("AWS Lambda");
                services.add("Amazon S3");
                services.add("Amazon CloudFront");
                if (req.getDatabaseNeeded()) {
                    services.add("Amazon DynamoDB");
                }
                services.add("Amazon CloudWatch");
                services.add("AWS IAM");
                totalCost = req.getDatabaseNeeded() ? 25.0 : 15.0;
                break;
                
            case "file-storage":
                services.add("Amazon S3");
                services.add("AWS IAM");
                totalCost = 10.0;
                break;
                
            case "event-driven":
                services.add("AWS Lambda");
                services.add("Amazon SQS");
                services.add("Amazon SNS");
                services.add("Amazon CloudWatch");
                services.add("AWS IAM");
                totalCost = 12.0;
                break;
                
            default:
                return null;
        }
        
        return new AlternativeArchitecture(
            "Budget-Optimized",
            services,
            totalCost,
            "Serverless and managed services for minimal cost"
        );
    }
    
    private AlternativeArchitecture createPerformanceOptimizedArchitecture(UserRequirement req) {
        List<String> services = new ArrayList<>();
        double totalCost = 0.0;
        
        switch (req.getApplicationType()) {
            case "backend-api":
                services.add("Amazon ECS");
                services.add("Amazon Aurora");
                services.add("Amazon CloudFront");
                services.add("Amazon CloudWatch");
                services.add("AWS IAM");
                totalCost = 120.0;
                break;
                
            case "full-stack":
                services.add("Amazon ECS");
                services.add("Amazon Aurora");
                services.add("Amazon S3");
                services.add("Amazon CloudFront");
                services.add("Amazon CloudWatch");
                services.add("AWS IAM");
                totalCost = 150.0;
                break;
                
            default:
                return null; // Performance optimization not applicable
        }
        
        return new AlternativeArchitecture(
            "Performance-Optimized",
            services,
            totalCost,
            "High-performance managed services for demanding workloads"
        );
    }
}
