package com.example.demo.repository;

import com.example.demo.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;
import java.util.List;

public interface ProvinceRepository extends JpaRepository<Province, Long> {

    @Query(value = """
            SELECT nom
            FROM province
            WHERE ST_Contains(
                geom,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
            )
            LIMIT 1
            """, nativeQuery = true)
    Optional<String> findProvinceNameContainingPoint(@Param("lat") double lat, @Param("lon") double lon);

    @Query("SELECT p.nom FROM Province p ORDER BY p.nom ASC")
    List<String> findAllProvinceNames();

    @Query(value = """
            SELECT nom
            FROM province
            WHERE geom IS NOT NULL
            ORDER BY ST_DistanceSphere(
                geom,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
            )
            LIMIT 1
            """, nativeQuery = true)
    Optional<String> findNearestProvinceName(@Param("lat") double lat, @Param("lon") double lon);

    // ✅ Trouver l'ID de la province qui contient un point donné
    @Query(value = """
            SELECT id
            FROM province
            WHERE ST_Contains(
                geom,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
            )
            LIMIT 1
            """, nativeQuery = true)
    Optional<Long> findProvinceIdContainingPoint(@Param("lat") double lat, @Param("lon") double lon);

    // ✅ Trouver l'ID de la province la plus proche d'un point donné
    @Query(value = """
            SELECT id
            FROM province
            WHERE geom IS NOT NULL
            ORDER BY ST_DistanceSphere(
                geom,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
            )
            LIMIT 1
            """, nativeQuery = true)
    Optional<Long> findNearestProvinceId(@Param("lat") double lat, @Param("lon") double lon);

    // ✅ Récupérer toutes les provinces en GeoJSON
    @Query(value = """
            SELECT 
                json_build_object(
                    'type', 'FeatureCollection',
                    'features', json_agg(
                        json_build_object(
                            'type', 'Feature',
                            'id', id,
                            'properties', json_build_object(
                                'id', id,
                                'nom', nom
                            ),
                            'geometry', ST_AsGeoJSON(geom)::json
                        )
                    )
                ) as geojson
            FROM province
            WHERE geom IS NOT NULL
            """, nativeQuery = true)
    String findAllAsGeoJSON();
}
