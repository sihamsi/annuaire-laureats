package com.example.demo.dto;

import com.example.demo.model.enums.UserRole;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UtilisateurCreateDTO {
    
    @NotBlank(message = "Le nom d'utilisateur est obligatoire")
    @Size(min = 3, max = 150)
    private String username;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6)
    private String password;
    
    @NotNull(message = "Le rôle est obligatoire")
    private UserRole role;
    
    @Email(message = "L'email doit être valide")
    @Size(max = 255)
    private String email;
    
    private Integer laureatId;
}

