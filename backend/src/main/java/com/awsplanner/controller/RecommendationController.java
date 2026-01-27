package com.awsplanner.controller;

import com.awsplanner.model.*;
import com.awsplanner.repository.ServiceKnowledgeBase;
import com.awsplanner.service.CostEstimationService;
import com.awsplanner.service.DecisionEngineService;
import com.awsplanner.service.RequirementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST API Controller for AWS recommendation system
 */
@RestController
@RequestMapping("/api")
public class RecommendationController {
    
    @Autowired
    private RequirementService requirementService;
    
    @Autowired
    private DecisionEngineService decisionEngine;
    
    @Autowired
    private CostEstimationService costEstimation;
    
    @Autowired
    private ServiceKnowledgeBase knowledgeBase;
    
    /**
     * Main endpoint: Get AWS service recommendations
     * POST /api/recommend
     */
    @PostMapping("/recommend")
    public ResponseEntity<?> getRecommendation(@Valid @RequestBody UserRequirement requirement) {
        try {
            // Step 1: Validate requirements
            requirementService.validateRequirements(requirement);
            
            // Step 2: Get recommended services from decision engine
            List<AwsService> selectedServices = decisionEngine.getRecommendedServices(requirement);
            
            // Step 3: Calculate costs
            List<RecommendedService> recommendedServices = 
                costEstimation.createRecommendedServices(selectedServices, requirement);
            
            double totalCost = costEstimation.calculateMonthlyCost(selectedServices, requirement);
            boolean withinBudget = costEstimation.validateBudget(totalCost, requirement.getMonthlyBudget());
            
            // Step 4: Generate alternatives
            List<AlternativeArchitecture> alternatives = 
                costEstimation.suggestAlternatives(selectedServices, requirement);
             
            // Step 5: Generate optional upgrades
            List<String> optionalUpgrades = 
                costEstimation.generateUpgrades(totalCost, requirement.getMonthlyBudget(), requirement);
            
            // Step 6: Build response
            Recommendation recommendation = new Recommendation();
            recommendation.setArchitecture(recommendedServices);
            recommendation.setTotalCost(totalCost);
            recommendation.setBudget(requirement.getMonthlyBudget());
            recommendation.setWithinBudget(withinBudget);
            recommendation.setAlternatives(alternatives);
            recommendation.setOptionalUpgrades(optionalUpgrades);
            
            if (!withinBudget) {
                recommendation.setMessage(
                    "Warning: Recommended architecture exceeds budget by $" + 
                    Math.round((totalCost - requirement.getMonthlyBudget()) * 100.0) / 100.0 + 
                    ". Consider the budget-optimized alternative."
                );
            } else {
                recommendation.setMessage("Architecture fits within your budget!");
            }
            
            return ResponseEntity.ok(recommendation);
            
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    /**
     * Get all supported AWS services
     * GET /api/services
     */
    @GetMapping("/services")
    public ResponseEntity<List<AwsService>> getAllServices() {
        List<AwsService> services = knowledgeBase.getAllServices();
        return ResponseEntity.ok(services);
    }
    
    /**
     * Get supported use cases
     * GET /api/use-cases
     */
    @GetMapping("/use-cases")
    public ResponseEntity<Map<String, String>> getUseCases() {
        Map<String, String> useCases = new HashMap<>();
        useCases.put("static-website", "Static Website");
        useCases.put("backend-api", "Backend API");
        useCases.put("full-stack", "Full-Stack Web Application");
        useCases.put("file-storage", "File Storage System");
        useCases.put("event-driven", "Event-Driven Application");
        
        return ResponseEntity.ok(useCases);
    }
    
    /**
     * Health check endpoint
     * GET /api/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "AWS Recommendation System");
        health.put("version", "1.0.0");
        
        return ResponseEntity.ok(health);
    }
}
