package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.locationtech.jts.geom.MultiPolygon;

import java.time.LocalDateTime;

@Entity
@Table(name = "province")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Province {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "nom", unique = true, nullable = false, length = 200)
    private String nom;
    
    @Column(name = "geom", columnDefinition = "geometry(MULTIPOLYGON, 4326)")
    private MultiPolygon geom;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

