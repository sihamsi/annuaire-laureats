package com.example.demo.repository;

import com.example.demo.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProvinceRepository extends JpaRepository<Province, Long> {

    @Query(value = """
        SELECT nom
        FROM provinces
        WHERE ST_Contains(
            geom,
            ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)
        )
        LIMIT 1
        """, nativeQuery = true)
    String findProvinceNameByPoint(@Param("lat") double lat,
                                   @Param("lon") double lon);
}
