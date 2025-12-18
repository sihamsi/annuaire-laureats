package com.example.demo.repository;

import com.example.demo.model.Organisme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganismeRepository extends JpaRepository<Organisme, Integer> {
    Optional<Organisme> findByNom(String nom);
    List<Organisme> findBySecteur(String secteur);
    
    @Query("SELECT o FROM Organisme o LEFT JOIN FETCH o.province")
    List<Organisme> findAllWithProvince();
}

