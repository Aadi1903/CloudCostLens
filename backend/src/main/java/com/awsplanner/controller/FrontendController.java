package com.awsplanner.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class FrontendController {

    /**
     * Forward all React routes to index.html for client-side routing.
     * Static resources and API endpoints are handled automatically by Spring Boot.
     */
    
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }
    
    @GetMapping("/how-it-works")
    public String howItWorks() {
        return "forward:/index.html";
    }
    
    @GetMapping("/requirements")
    public String requirements() {
        return "forward:/index.html";
    }
    
    @GetMapping("/recommendation")
    public String recommendation() {
        return "forward:/index.html";
    }
    
    @GetMapping("/abou//t")
    public String about() {
        return "forward:/index.html";
    }
}
