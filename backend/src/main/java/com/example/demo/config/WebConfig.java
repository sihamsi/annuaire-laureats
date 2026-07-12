package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // Servir les photos depuis le dossier static/photos
        // Accessible via /photos/filename.png
        String userDir = System.getProperty("user.dir");
        
        registry.addResourceHandler("/photos/**")
                .addResourceLocations(
                    "classpath:/static/photos/",
                    "file:src/main/resources/static/photos/",
                    "file:" + userDir + "/src/main/resources/static/photos/",
                    "file:" + userDir + "/backend/src/main/resources/static/photos/"
                )
                .setCachePeriod(3600); // Cache 1 heure
    }
}
