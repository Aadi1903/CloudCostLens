package com.awsplanner.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class DebugFilter implements Filter {
    private static final Logger logger = LoggerFactory.getLogger(DebugFilter.class);

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) 
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        logger.info("DEBUG: Request {} [Auth: {}]", req.getRequestURI(), 
                (auth != null ? auth.getName() + " " + auth.getAuthorities() : "NULL"));
        
        chain.doFilter(request, response);
    }
}
