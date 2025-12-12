package com.example.demo.repository;

import com.example.demo.entity.Geolocalisation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface GeolocalisationRepository extends JpaRepository<Geolocalisation, Long> {

    // Trouver par laureatId
    List<Geolocalisation> findByLaureatId(Long laureatId);

    // Trouver les lauréats avec géolocalisation (latitude et longitude non nulles)
    @Query("SELECT g FROM Geolocalisation g WHERE g.latitude IS NOT NULL AND g.longitude IS NOT NULL")
    List<Geolocalisation> findWithCoordinates();

    // Trouver la province par coordonnées (en utilisant la fonction PostGIS)
    @Query(value = "SELECT p.nom as province FROM province p " +
            "WHERE ST_Contains(p.geom, ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)) " +
            "LIMIT 1", nativeQuery = true)
    String findProvinceByCoordinates(@Param("latitude") Double latitude,
            @Param("longitude") Double longitude);

    // Statistiques par province
    @Query(value = "SELECT p.nom as province, COUNT(l.id) as nombreLaureats " +
            "FROM laureat l " +
            "LEFT JOIN province p ON l.province_id = p.id " +
            "WHERE l.latitude IS NOT NULL AND l.longitude IS NOT NULL " +
            "AND l.status = 'published' " +
            "GROUP BY p.nom " +
            "ORDER BY nombreLaureats DESC", nativeQuery = true)
    List<Map<String, Object>> getStatsByProvince();

    // Trouver les lauréats dans un rayon donné
    @Query(value = "SELECT * FROM laureat " +
            "WHERE ST_DWithin(location::geometry, " +
            "ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326), :radiusInMeters) " +
            "AND status = 'published'", nativeQuery = true)
    List<Geolocalisation> findWithinRadius(@Param("latitude") Double latitude,
            @Param("longitude") Double longitude,
            @Param("radiusInMeters") Double radiusInMeters);
}