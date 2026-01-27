package com.awsplanner.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents user feedback submission
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {
    
    private String name;
    private String email;
    
    @NotBlank(message = "Message is required")
    private String message;
    
    @NotBlank(message = "Feedback type is required")
    private String type; // missing-use-case, wrong-recommendation, feature-request
}
