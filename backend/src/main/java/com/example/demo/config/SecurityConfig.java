package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Autoriser l'accès public à tous les endpoints GET de l'API
                .requestMatchers(HttpMethod.GET, "/api/laureats/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/filtres/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/organismes/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/geolocalisation/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/stats/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/notifications/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/messages/**").permitAll() // Messages - lecture
                .requestMatchers(HttpMethod.POST, "/api/messages").permitAll() // Messages - envoi depuis contact
                .requestMatchers(HttpMethod.GET, "/photos/**").permitAll() // Photos publiques
                .requestMatchers(HttpMethod.GET, "/api/laureats/photo/**").permitAll() // Photos des lauréats
                // Autoriser POST pour géolocalisation (identification de province)
                .requestMatchers(HttpMethod.POST, "/api/geolocalisation/**").permitAll()
                // Autoriser tous les endpoints d'authentification (GET, POST, etc.)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/auth/**").permitAll() // Alternative endpoint sans /api
                // Autoriser GeoServer
                .requestMatchers("/geoserver/**").permitAll()
                // Autoriser l'inscription (POST /api/laureats)
                .requestMatchers(HttpMethod.POST, "/api/laureats").permitAll()
                // Autoriser la connexion (POST /api/laureats/login)
                .requestMatchers(HttpMethod.POST, "/api/laureats/login").permitAll()
                // Autoriser la migration des mots de passe (POST /api/laureats/migrate-passwords)
                .requestMatchers(HttpMethod.POST, "/api/laureats/migrate-passwords").permitAll()
                // Autoriser la génération de mot de passe (POST /api/laureats/generate-password)
                .requestMatchers(HttpMethod.POST, "/api/laureats/generate-password").permitAll()
                // Autoriser l'upload de photos (POST pour upload direct et association)
                .requestMatchers(HttpMethod.POST, "/api/laureats/photo").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/laureats/*/photo").permitAll()
                // Autoriser la validation et le rejet d'inscriptions (PUT)
                .requestMatchers(HttpMethod.PUT, "/api/laureats/*/valider").permitAll()
                .requestMatchers(HttpMethod.PUT, "/api/laureats/*/rejeter").permitAll()
                // Autoriser la mise à jour d'inscription (PUT /api/laureats/{id})
                .requestMatchers(HttpMethod.PUT, "/api/laureats/**").permitAll()
                // Tout le reste nécessite une authentification
                .anyRequest().authenticated()
            );

        return http.build();
    }
}
