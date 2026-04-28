package com.awsplanner.recommendation;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class DecisionEngineServiceTest {

    @Mock
    private ServiceKnowledgeBase knowledgeBase;

    @Mock
    private RequirementService requirementService;

    @InjectMocks
    private DecisionEngineService decisionEngine;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFilterServices_DatabaseNotNeeded() {
        // Mock data
        AwsService compute = new AwsService("ec2", "EC2", "Compute", "low", "high", "low", Arrays.asList("backend-api"), "Compute desc", false);
        AwsService database = new AwsService("rds", "RDS", "database", "medium", "medium", "medium", Arrays.asList("backend-api"), "DB desc", false);
        
        when(knowledgeBase.getAllServices()).thenReturn(Arrays.asList(compute, database));

        // Requirement: Database NOT needed
        UserRequirement req = new UserRequirement("backend-api", "low", 0, false, "low", 100.0);

        List<AwsService> result = decisionEngine.filterServices(req);

        // Assert: RDS (database category) should be filtered out
        assertTrue(result.contains(compute));
        assertFalse(result.contains(database));
    }

    @Test
    void testFilterServices_UseCaseMatch() {
        AwsService web = new AwsService("s3", "S3", "Storage", "low", "low", "low", Arrays.asList("static-website"), "Static desc", false);
        AwsService api = new AwsService("lambda", "Lambda", "Compute", "low", "high", "low", Arrays.asList("backend-api"), "API desc", false);
        
        when(knowledgeBase.getAllServices()).thenReturn(Arrays.asList(web, api));

        // Requirement: static-website
        UserRequirement req = new UserRequirement("static-website", "low", 0, false, "low", 100.0);

        List<AwsService> result = decisionEngine.filterServices(req);

        // Assert: Only S3 should be returned
        assertTrue(result.contains(web));
        assertFalse(result.contains(api));
    }

    @Test
    void testScoringWeights() {
        // This test verifies that different preferences lead to different rankings
        AwsService cheapService = new AwsService("s3-cheap", "S3", "Storage", "low", "low", "low", Arrays.asList("file-storage"), "Cheap", false);
        AwsService highPerfService = new AwsService("efs-perf", "EFS", "Storage", "high", "high", "medium", Arrays.asList("file-storage"), "Perf", false);
        
        when(knowledgeBase.getAllServices()).thenReturn(Arrays.asList(cheapService, highPerfService));
        
        UserRequirement lowBudgetReq = new UserRequirement("file-storage", "low", 0, false, "low", 10.0);
        
        // Calculate scores manually or via method
        var lowBudgetScores = decisionEngine.scoreServices(Arrays.asList(cheapService, highPerfService), lowBudgetReq);
        
        // Sort results
        lowBudgetScores.sort((a, b) -> Double.compare(b.getScore(), a.getScore()));
        
        // Assert: S3 should be top for low budget
        assertEquals("s3-cheap", lowBudgetScores.get(0).getService().getId());
    }
}
