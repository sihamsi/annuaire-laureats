package com.example.demo.repository;

import com.example.demo.entity.Laureat;
import com.example.demo.entity.InscriptionStatus;
import com.example.demo.entity.FiliereType;
import com.example.demo.entity.SecteurType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LaureatRepository extends JpaRepository<Laureat, Long> { // CHANGED: ID → Long

       @Query(value = "SELECT * FROM laureat WHERE CAST(status AS VARCHAR) = LOWER(:status) ORDER BY date_inscription DESC", nativeQuery = true)
       List<Laureat> findByStatusNative(@Param("status") String status);

       @Query("SELECT l FROM Laureat l WHERE l.filiere = :filiere")
       List<Laureat> findByFiliere(@Param("filiere") FiliereType filiere);

       @Query("SELECT l FROM Laureat l WHERE l.secteur = :secteur")
       List<Laureat> findBySecteur(@Param("secteur") SecteurType secteur);

       Optional<Laureat> findByEmail(String email);

       boolean existsByEmail(String email);

       @Query("SELECT l FROM Laureat l WHERE " +
                     "(:filiere IS NULL OR l.filiere = :filiere) AND " +
                     "(:promotion IS NULL OR l.promotion = :promotion) AND " +
                     "(:secteur IS NULL OR l.secteur = :secteur) AND " +
                     "(:status IS NULL OR l.status = :status)")
       List<Laureat> searchLaureats(
                     @Param("filiere") FiliereType filiere,
                     @Param("promotion") String promotion,
                     @Param("secteur") SecteurType secteur,
                     @Param("status") InscriptionStatus status);

       @Query("SELECT l FROM Laureat l WHERE " +
                     "LOWER(l.nom) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                     "LOWER(l.prenom) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
       List<Laureat> searchByName(@Param("searchTerm") String searchTerm);

       @Query("SELECT COUNT(l) FROM Laureat l WHERE l.status = :status")
       long countByStatus(@Param("status") InscriptionStatus status);

       @Query(value = "SELECT DISTINCT filiere FROM laureat WHERE filiere IS NOT NULL ORDER BY filiere", nativeQuery = true)
       List<String> findDistinctFilieres();

       @Query(value = "SELECT DISTINCT promotion FROM laureat WHERE promotion IS NOT NULL ORDER BY promotion DESC", nativeQuery = true)
       List<String> findDistinctPromotions();

       @Query(value = "SELECT DISTINCT secteur FROM laureat WHERE secteur IS NOT NULL ORDER BY secteur", nativeQuery = true)
       List<String> findDistinctSecteurs();

       // Trouver toutes les personnes ayant la même filière (triées par priorité : même promotion+entreprise, puis même promotion, puis les autres)
       @Query("SELECT l FROM Laureat l WHERE " +
                     "l.filiere = :filiere AND " +
                     "l.status = :status AND " +
                     "l.id != :excludeId " +
                     "ORDER BY " +
                     "CASE WHEN l.promotion = :promotion AND ((:organismeId IS NOT NULL AND l.organismeId = :organismeId) OR (:autreOrganisme IS NOT NULL AND :autreOrganisme != '' AND LOWER(l.autreOrganisme) = LOWER(:autreOrganisme))) THEN 1 " +
                     "WHEN l.promotion = :promotion THEN 2 " +
                     "ELSE 3 END, " +
                     "l.nom ASC, l.prenom ASC")
       List<Laureat> findSimilarLaureats(
                     @Param("filiere") FiliereType filiere,
                     @Param("promotion") String promotion,
                     @Param("organismeId") Long organismeId,
                     @Param("autreOrganisme") String autreOrganisme,
                     @Param("status") InscriptionStatus status,
                     @Param("excludeId") Long excludeId);

}