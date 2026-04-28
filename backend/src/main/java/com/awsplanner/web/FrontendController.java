package com.awsplanner.web;

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
    
    @GetMapping({"/login", "/how-it-works", "/requirements", "/recommendation", "/deployments", "/history", "/about"})
    public String forward() {
        return "forward:/index.html";
    }
}
