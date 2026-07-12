package com.example.demo.dto;

import java.time.LocalDateTime;

public class MessageResponse {
    private Long id;
    private String nom;
    private String email;
    private String sujet;
    private String message;
    private LocalDateTime createdAt;

    public MessageResponse(Long id, String nom, String email, String sujet, String message, LocalDateTime createdAt) {
        this.id = id;
        this.nom = nom;
        this.email = email;
        this.sujet = sujet;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public String getEmail() {
        return email;
    }

    public String getSujet() {
        return sujet;
    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
