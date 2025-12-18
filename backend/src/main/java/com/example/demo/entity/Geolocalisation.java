package com.example.demo.entity;

import lombok.Data;
import jakarta.persistence.*;

@Data
@Entity
@Table(name = "laureat") // Utilise la table laureat comme source de géolocalisation
public class Geolocalisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "province")
    private String province;

    @Column(name = "region")
    private String region;

    @Column(name = "laureat_id", insertable = false, updatable = false)
    private Long laureatId;

    // Jointure avec la table laureat
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id", referencedColumnName = "id")
    private Laureat laureat;

    @Column(name = "location", insertable = false, updatable = false)
    private String location; // Pour stocker la géométrie PostGIS

    public Geolocalisation() {
    }

    public Geolocalisation(Double latitude, Double longitude, String province) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.province = province;
    }
}