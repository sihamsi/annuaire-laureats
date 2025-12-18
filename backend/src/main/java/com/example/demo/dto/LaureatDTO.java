package com.example.demo.dto;

import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.model.enums.SecteurType;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LaureatDTO {
    private Integer id;
    private String prenom;
    private String nom;
    private GenreType genre;
    private String telephone;
    private String email;
    private String photoUrl;
    private String promotion;
    private FiliereType filiere;
    private SecteurType secteur;
    private Integer organismeId;
    private String organismeNom;
    private String autreOrganisme;
    private Double latitude;
    private Double longitude;
    private Integer provinceId;
    private String provinceNom;
    private String description;
    private InscriptionStatus status;
    private String motifRejet;
    private LocalDateTime dateInscription;
    private LocalDateTime dateValidation;
    private LocalDateTime updatedAt;
}

