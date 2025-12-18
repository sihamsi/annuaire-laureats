package com.example.demo.dto;

import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.SecteurType;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class LaureatUpdateDTO {
    
    @Size(max = 100)
    private String prenom;
    
    @Size(max = 100)
    private String nom;
    
    private GenreType genre;
    
    @Size(max = 30)
    private String telephone;
    
    @Email(message = "L'email doit être valide")
    @Size(max = 200)
    private String email;
    
    private String photoUrl;
    
    @Size(max = 10)
    private String promotion;
    
    private FiliereType filiere;
    
    private SecteurType secteur;
    
    private Integer organismeId;
    
    @Size(max = 300)
    private String autreOrganisme;
    
    @DecimalMin(value = "-90.0")
    @DecimalMax(value = "90.0")
    private Double latitude;
    
    @DecimalMin(value = "-180.0")
    @DecimalMax(value = "180.0")
    private Double longitude;
    
    private String description;
}

