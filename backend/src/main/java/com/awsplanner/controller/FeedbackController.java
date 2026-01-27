package com.awsplanner.controller;

import com.awsplanner.model.Feedback;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for handling user feedback
 */
@RestController
@RequestMapping("/api")
public class FeedbackController {

    private static final Logger logger = LoggerFactory.getLogger(FeedbackController.class);

    @PostMapping("/feedback")
    public ResponseEntity<?> submitFeedback(@Valid @RequestBody Feedback feedback) {
        // In a real app, we would save this to a database
        // For now, we'll log it for admin review
        logger.info("New Feedback Received for CloudCostLens:");
        logger.info("Type: {}", feedback.getType());
        logger.info("From: {} ({})", feedback.getName(), feedback.getEmail());
        logger.info("Message: {}", feedback.getMessage());
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Thank you for your feedback!");
        
        return ResponseEntity.ok(response);
    }
}
