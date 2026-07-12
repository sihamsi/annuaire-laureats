package com.example.demo.repository;

import com.example.demo.entity.Laureat; // adapte le package + nom exact
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface StatsRepository extends JpaRepository<Laureat, Long> {

    @Query(value = """
                SELECT filiere AS label, COUNT(*) AS value
                FROM laureat
                WHERE LOWER(status) = 'published'
                GROUP BY filiere
                ORDER BY value DESC
            """, nativeQuery = true)
    List<Map<String, Object>> statsByFiliere();

    @Query(value = """
                SELECT promotion AS label, COUNT(*) AS value
                FROM laureat
                WHERE LOWER(status) = 'published'
                GROUP BY promotion
                ORDER BY promotion DESC
            """, nativeQuery = true)
    List<Map<String, Object>> statsByPromotion();

    @Query(value = """
                SELECT secteur AS label, COUNT(*) AS value
                FROM laureat
                WHERE LOWER(status) = 'published'
                GROUP BY secteur
            """, nativeQuery = true)
    List<Map<String, Object>> statsBySecteur();

    @Query(value = """
                SELECT genre AS label, COUNT(*) AS value
                FROM laureat
                WHERE LOWER(status) = 'published'
                GROUP BY genre
            """, nativeQuery = true)
    List<Map<String, Object>> statsByGenre();

    @Query(value = """
                SELECT p.nom AS label, COUNT(l.id) AS value
                FROM laureat l
                LEFT JOIN province p ON p.id = l.province_id
                WHERE LOWER(l.status) = 'published'
                GROUP BY p.nom
                ORDER BY value DESC
            """, nativeQuery = true)
    List<Map<String, Object>> statsByProvince();
}
