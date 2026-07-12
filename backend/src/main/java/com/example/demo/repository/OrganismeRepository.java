package com.example.demo.repository;

import com.example.demo.entity.Organisme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrganismeRepository extends JpaRepository<Organisme, Long> {

    boolean existsByNomIgnoreCase(String nom);

    @Query("""
        SELECT o FROM Organisme o
        WHERE (:secteur IS NULL OR LOWER(o.secteur) = LOWER(:secteur))
        ORDER BY o.nom ASC
    """)
    List<Organisme> findBySecteur(String secteur);
}
