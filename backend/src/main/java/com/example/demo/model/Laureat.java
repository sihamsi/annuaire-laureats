package com.example.demo.model;

import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.model.enums.SecteurType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "laureat")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Laureat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;
    
    @Column(name = "nom", nullable = false, length = 100)
    private String nom;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "genre", nullable = false, length = 255)
    private GenreType genre;
    
    @Column(name = "telephone", length = 30)
    private String telephone;
    
    @Column(name = "email", unique = true, nullable = false, length = 200)
    private String email;
    
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;
    
    @Column(name = "promotion", nullable = false, length = 10)
    private String promotion;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "filiere", nullable = false, length = 255)
    private FiliereType filiere;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "secteur", nullable = false, length = 255)
    private SecteurType secteur;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organisme_id")
    private Organisme organisme;
    
    @Column(name = "autre_organisme", length = 300)
    private String autreOrganisme;
    
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    // Colonne location générée automatiquement par PostgreSQL
    // Ne pas mapper cette colonne - elle sera générée automatiquement
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private Province province;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 255)
    private InscriptionStatus status = InscriptionStatus.PENDING;
    
    @Column(name = "motif_rejet", columnDefinition = "TEXT")
    private String motifRejet;
    
    @CreationTimestamp
    @Column(name = "date_inscription", updatable = false)
    private LocalDateTime dateInscription;
    
    @Column(name = "date_validation")
    private LocalDateTime dateValidation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by")
    private Utilisateur validatedBy;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

