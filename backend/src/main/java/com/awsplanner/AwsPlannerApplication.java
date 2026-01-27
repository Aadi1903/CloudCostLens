package com.awsplanner;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class AwsPlannerApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(AwsPlannerApplication.class, args);
        System.out.println("\n==============================================");
        System.out.println("AWS Recommendation System is running!");
        System.out.println("API available at: http://localhost:8080/api");
        System.out.println("==============================================\n");
    }
}
