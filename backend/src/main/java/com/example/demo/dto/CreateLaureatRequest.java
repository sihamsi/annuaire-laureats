package com.example.demo.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateLaureatRequest {

    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @NotBlank(message = "Le genre est obligatoire")
    @Pattern(regexp = "^(HOMME|FEMME)$", message = "Genre doit être 'HOMME' ou 'FEMME'") // CHANGED: uppercase
    private String genre;

    private String telephone;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @NotBlank(message = "La promotion est obligatoire")
    private String promotion;

    @NotBlank(message = "La filière est obligatoire")
    private String filiere; // REMOVED: regex pattern, will be validated in service

    @NotBlank(message = "Le secteur est obligatoire")
    @Pattern(regexp = "^(PUBLIC|PRIVE)$", message = "Secteur doit être 'PUBLIC' ou 'PRIVE'") // CHANGED: uppercase
    private String secteur;

    private Long organismeId; // CHANGED: ID → Long
    private String autreOrganisme;
    private Double latitude;
    private Double longitude;
    private Long provinceId; // CHANGED: ID → Long
    private String description;
    private String deviceId;
}