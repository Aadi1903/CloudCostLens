package com.awsplanner.recommendation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class CostEstimationServiceTest {

    @Mock
    private ServiceKnowledgeBase knowledgeBase;

    @Mock
    private RequirementService requirementService;

    @InjectMocks
    private CostEstimationService costEstimationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCalculateMonthlyCost() {
        AwsService s3 = new AwsService("s3", "S3", "Storage", "low", "low", "low", Arrays.asList("static-website"), "S3", false);
        UserRequirement req = new UserRequirement("static-website", "low", 50, false, "low", 100.0);
        
        Map<String, Double> s3Pricing = new HashMap<>();
        s3Pricing.put("baseCost", 5.0);
        s3Pricing.put("perGB", 0.023);
        
        when(knowledgeBase.getPricingForService("s3")).thenReturn(s3Pricing);
        when(requirementService.normalizeTraffic("low")).thenReturn(1000);
        
        double cost = costEstimationService.calculateMonthlyCost(Arrays.asList(s3), req);
        
        // Assert: S3 base(5) + 50GB * 0.023(1.15) = 6.15
        assertEquals(6.15, cost, 0.01);
    }

    @Test
    void testValidateBudget_Exceeded() {
        // Total cost 50, Budget 1
        boolean withinBudget = costEstimationService.validateBudget(50.0, 1.0);
        assertFalse(withinBudget, "Budget of $1 should be exceeded by $50 cost");
    }

    @Test
    void testValidateBudget_Within() {
        // Total cost 50, Budget 100
        boolean withinBudget = costEstimationService.validateBudget(50.0, 100.0);
        assertTrue(withinBudget, "Budget of $100 should accommodate $50 cost");
    }

    @Test
    void testZeroBudgetEdgeCase() {
        // What if user inputs $0? UserRequirement has @Min(1) but let's test logic
        boolean withinBudget = costEstimationService.validateBudget(1.0, 0.0);
        assertFalse(withinBudget);
    }
}
