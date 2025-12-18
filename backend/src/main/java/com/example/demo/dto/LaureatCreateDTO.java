package com.example.demo.dto;

import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.SecteurType;
import com.fasterxml.jackson.annotation.JsonSetter;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LaureatCreateDTO {
    
    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100)
    private String prenom;
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100)
    private String nom;
    
    @NotNull(message = "Le genre est obligatoire")
    private GenreType genre;
    
    @Size(max = 30)
    private String telephone;
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    @Size(max = 200)
    private String email;
    
    private String photoUrl;
    
    @NotBlank(message = "La promotion est obligatoire")
    @Size(max = 10)
    private String promotion;
    
    @NotNull(message = "La filière est obligatoire")
    private FiliereType filiere;
    
    @NotNull(message = "Le secteur est obligatoire")
    private SecteurType secteur;
    
    // Setters personnalisés pour convertir les enums de manière insensible à la casse
    @JsonSetter("genre")
    public void setGenre(String value) {
        if (value != null) {
            try {
                this.genre = GenreType.valueOf(value.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Genre invalide: " + value + ". Valeurs acceptées: MASCULIN, FEMININ");
            }
        }
    }
    
    @JsonSetter("filiere")
    public void setFiliere(String value) {
        if (value != null) {
            try {
                this.filiere = FiliereType.valueOf(value.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Filière invalide: " + value);
            }
        }
    }
    
    @JsonSetter("secteur")
    public void setSecteur(String value) {
        if (value != null) {
            try {
                this.secteur = SecteurType.valueOf(value.toUpperCase().trim());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Secteur invalide: " + value + ". Valeurs acceptées: PUBLIC, PRIVE");
            }
        }
    }
    
    private Integer organismeId;
    
    @Size(max = 300)
    private String autreOrganisme;
    
    @NotNull(message = "La latitude est obligatoire")
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitude;
    
    @NotNull(message = "La longitude est obligatoire")
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitude;
    
    private String description;
    
    // Informations du device
    private String imei;
    private String deviceModel;
    private String osVersion;
    private String appVersion;
}

