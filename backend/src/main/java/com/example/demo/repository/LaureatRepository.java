package com.example.demo.repository;

import com.example.demo.model.Laureat;
import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.model.enums.SecteurType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaureatRepository extends JpaRepository<Laureat, Integer> {
    
    Optional<Laureat> findByEmail(String email);
    
    Page<Laureat> findByStatus(InscriptionStatus status, Pageable pageable);
    
    @Query("SELECT l FROM Laureat l WHERE " +
           "(:filiere IS NULL OR l.filiere = :filiere) AND " +
           "(:promotion IS NULL OR l.promotion = :promotion) AND " +
           "(:secteur IS NULL OR l.secteur = :secteur) AND " +
           "(:genre IS NULL OR l.genre = :genre) AND " +
           "(:organismeId IS NULL OR l.organisme.id = :organismeId) AND " +
           "(:provinceId IS NULL OR l.province.id = :provinceId) AND " +
           "(:status IS NULL OR l.status = :status)")
    Page<Laureat> findWithFilters(
        @Param("filiere") FiliereType filiere,
        @Param("promotion") String promotion,
        @Param("secteur") SecteurType secteur,
        @Param("genre") GenreType genre,
        @Param("organismeId") Integer organismeId,
        @Param("provinceId") Integer provinceId,
        @Param("status") InscriptionStatus status,
        Pageable pageable
    );
    
    @Query("SELECT l FROM Laureat l WHERE " +
           "(:filiere IS NULL OR l.filiere = :filiere) AND " +
           "(:promotion IS NULL OR l.promotion = :promotion) AND " +
           "(:secteur IS NULL OR l.secteur = :secteur) AND " +
           "(:genre IS NULL OR l.genre = :genre) AND " +
           "(:organismeId IS NULL OR l.organisme.id = :organismeId) AND " +
           "(:provinceId IS NULL OR l.province.id = :provinceId) AND " +
           "(:status IS NULL OR l.status = :status)")
    List<Laureat> findWithFiltersList(
        @Param("filiere") FiliereType filiere,
        @Param("promotion") String promotion,
        @Param("secteur") SecteurType secteur,
        @Param("genre") GenreType genre,
        @Param("organismeId") Integer organismeId,
        @Param("provinceId") Integer provinceId,
        @Param("status") InscriptionStatus status
    );
    
    long countByStatus(InscriptionStatus status);
    
    long countBySecteur(SecteurType secteur);
    
    long countByFiliere(FiliereType filiere);
}

