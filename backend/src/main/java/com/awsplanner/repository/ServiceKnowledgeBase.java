package com.awsplanner.repository;

import com.awsplanner.model.AwsService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Repository for AWS service metadata and pricing information
 */
@Repository
public class ServiceKnowledgeBase {
    
    private List<AwsService> allServices;
    private Map<String, Map<String, Double>> pricingTable;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostConstruct
    public void init() throws IOException {
        loadServices();
        loadPricing();
        System.out.println("Loaded " + allServices.size() + " AWS services");
    }
    
    private void loadServices() throws IOException {
        ClassPathResource resource = new ClassPathResource("data/aws-services.json");
        allServices = objectMapper.readValue(
            resource.getInputStream(),
            new TypeReference<List<AwsService>>() {}
        );
    }
    
    private void loadPricing() throws IOException {
        ClassPathResource resource = new ClassPathResource("data/pricing-table.json");
        pricingTable = objectMapper.readValue(
            resource.getInputStream(),
            new TypeReference<Map<String, Map<String, Double>>>() {}
        );
    }
    
    public List<AwsService> getAllServices() {
        return new ArrayList<>(allServices);
    }
    
    public AwsService getServiceById(String id) {
        return allServices.stream()
            .filter(s -> s.getId().equals(id))
            .findFirst()
            .orElse(null);
    }
    
    public List<AwsService> getServicesByCategory(String category) {
        return allServices.stream()
            .filter(s -> s.getCategory().equals(category))
            .collect(Collectors.toList());
    }
    
    public List<AwsService> getMandatoryServices() {
        return allServices.stream()
            .filter(AwsService::isMandatory)
            .collect(Collectors.toList());
    }
    
    public Map<String, Double> getPricingForService(String serviceId) {
        return pricingTable.get(serviceId);
    }
    
    public Map<String, Map<String, Double>> getAllPricing() {
        return pricingTable;
    }
}
