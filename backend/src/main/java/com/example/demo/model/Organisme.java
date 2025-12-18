package com.example.demo.model;

import com.example.demo.model.enums.SecteurType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "organisme")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Organisme {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "nom", nullable = false, length = 300)
    private String nom;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "secteur", nullable = false, length = 255)
    private SecteurType secteur;
    
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;
    
    @Column(name = "latitude")
    private Double latitude;
    
    @Column(name = "longitude")
    private Double longitude;
    
    // Colonne location générée automatiquement par PostgreSQL
    // Ne pas mapper cette colonne - elle sera générée automatiquement
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "province_id")
    private Province province;
    
    @Column(name = "external_source", length = 50)
    private String externalSource;
    
    @Column(name = "external_id", length = 200)
    private String externalId;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

