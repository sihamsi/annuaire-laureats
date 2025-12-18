package com.example.demo.dto;

import com.example.demo.model.enums.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UtilisateurDTO {
    private Integer id;
    private String username;
    private UserRole role;
    private String email;
    private Integer laureatId;
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
}

