package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "laureat")
@Data
@NoArgsConstructor
public class Laureat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    // NO @Enumerated annotation here
    @Column(name = "genre", nullable = false)
    private GenreType genre;

    @Column(name = "telephone", length = 30)
    private String telephone;

    @Column(name = "email", unique = true, nullable = false, length = 200)
    private String email;

    @JsonIgnore
    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "photo_url")
    private String photoUrl;

    @Column(name = "promotion", nullable = false, length = 10)
    private String promotion;

    // NO @Enumerated annotation here
    @Column(name = "filiere", nullable = false)
    private FiliereType filiere;

    // NO @Enumerated annotation here (CRITICAL - 'public' is Java keyword)
    @Column(name = "secteur", nullable = false)
    private SecteurType secteur;

    @Column(name = "organisme_id")
    private Long organismeId;

    @Column(name = "autre_organisme", length = 300)
    private String autreOrganisme;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "province_id")
    private Long provinceId;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "device_id", length = 255)
    private String deviceId;

    // NO @Enumerated annotation here
    @Column(name = "status", nullable = false)
    private InscriptionStatus status = InscriptionStatus.PENDING;

    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;

    @CreationTimestamp
    @Column(name = "date_inscription", updatable = false)
    private LocalDateTime dateInscription;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Laureat(String nom, String prenom, FiliereType filiere, String promotion) {
        this.nom = nom;
        this.prenom = prenom;
        this.filiere = filiere;
        this.promotion = promotion;
        this.status = InscriptionStatus.PENDING ;
    }
}