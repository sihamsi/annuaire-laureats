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
            ORDER BY ST_Distance(
                geom::geography,
                ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
            )
            LIMIT 1
            """, nativeQuery = true)
    Optional<String> findNearestProvinceName(@Param("lat") double lat, @Param("lon") double lon);
}
