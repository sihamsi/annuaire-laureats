package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.MultiPolygon;

import java.time.LocalDateTime;

@Entity
@Table(name = "province")
@Data
public class Province {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false, unique = true)
    private String nom;

    // PostGIS geometry(MULTIPOLYGON, 4326)
    @Column(name = "geom", columnDefinition = "geometry(MULTIPOLYGON,4326)")
    private MultiPolygon geom;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
