package com.example.demo.repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.RepositoryDefinition;

import java.util.List;
import java.util.Map;

@Repository
public interface StatsRepository {

    // 📊 Par filière
    @Query(value = """
        SELECT filiere AS label, COUNT(*) AS value
        FROM laureat
        WHERE LOWER(status) = 'published'
        GROUP BY filiere
        ORDER BY value DESC
    """, nativeQuery = true)
    List<Map<String, Object>> statsByFiliere();

    // 📊 Par promotion
    @Query(value = """
        SELECT promotion AS label, COUNT(*) AS value
        FROM laureat
        WHERE LOWER(status) = 'published'
        GROUP BY promotion
        ORDER BY promotion DESC
    """, nativeQuery = true)
    List<Map<String, Object>> statsByPromotion();

    // 📊 Par secteur
    @Query(value = """
        SELECT secteur AS label, COUNT(*) AS value
        FROM laureat
        WHERE LOWER(status) = 'published'
        GROUP BY secteur
    """, nativeQuery = true)
    List<Map<String, Object>> statsBySecteur();

    // 📊 Par genre
    @Query(value = """
        SELECT genre AS label, COUNT(*) AS value
        FROM laureat
        WHERE LOWER(status) = 'published'
        GROUP BY genre
    """, nativeQuery = true)
    List<Map<String, Object>> statsByGenre();

    // 📊 Par province
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
