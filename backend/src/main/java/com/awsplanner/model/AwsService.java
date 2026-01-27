package com.awsplanner.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Represents an AWS service with its metadata
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AwsService {
    
    private String id;
    private String name;
    private String category; // compute, storage, database, networking, messaging, monitoring, security
    private String costLevel; // low, medium, high
    private String scalability; // low, medium, high
    private String operationalEffort; // low, medium, high
    private List<String> useCases; // List of supported use cases
    private String description;
    private boolean mandatory; // Services like IAM that are always included
}
