package com.incidenthub.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Global Web and CORS Configuration for Spring Boot REST API.
 * Permite peticiones seguras desde el Frontend (React + Vite) tanto en desarrollo como en producción.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("X-User-Role", "X-User-Id", "Authorization")
                .allowCredentials(false)
                .maxAge(3600);
    }
}
