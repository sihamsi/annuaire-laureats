package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.LaureatRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class LaureatService {

    private final LaureatRepository laureatRepository;
    private final Path rootLocation = Paths.get("uploads");

    {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

    // POST /api/laureats - Ajouter un nouveau lauréat
    public Laureat addLaureat(Laureat laureat) {
        if (laureat.getStatus() == null) {
            laureat.setStatus(InscriptionStatus.PENDING);
        }

        if (laureatRepository.existsByEmail(laureat.getEmail())) {
            throw new IllegalArgumentException("Un lauréat avec cet email existe déjà");
        }

        return laureatRepository.save(laureat);
    }

    // GET /api/laureats - Lister tous les lauréats
    @Transactional(readOnly = true)
    public List<Laureat> getAllLaureats() {
        return laureatRepository.findAll();
    }

    // GET /api/laureats/{id} - Consulter les détails d'un lauréat
    @Transactional(readOnly = true)
    public Laureat getById(Long id) { // CHANGED: ID → Long
        return laureatRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Laureat non trouvé avec id: " + id));
    }

    // PUT /api/laureats/{id} - Modifier les informations d'un lauréat
    public Laureat updateLaureat(Long id, Laureat updated) { // CHANGED: ID → Long
        Laureat existing = getById(id);

        if (!existing.getEmail().equals(updated.getEmail()) &&
                laureatRepository.existsByEmail(updated.getEmail())) {
            throw new IllegalArgumentException("Un lauréat avec cet email existe déjà");
        }

        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setGenre(updated.getGenre());
        existing.setEmail(updated.getEmail());
        existing.setTelephone(updated.getTelephone());
        existing.setFiliere(updated.getFiliere());
        existing.setPromotion(updated.getPromotion());
        existing.setSecteur(updated.getSecteur());
        existing.setOrganismeId(updated.getOrganismeId());
        existing.setAutreOrganisme(updated.getAutreOrganisme());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setProvinceId(updated.getProvinceId());
        existing.setDescription(updated.getDescription());

        return laureatRepository.save(existing);
    }

    // DELETE /api/laureats/{id} - Supprimer un lauréat
    public void deleteLaureat(Long id) { // CHANGED: ID → Long
        if (!laureatRepository.existsById(id)) {
            throw new EntityNotFoundException("Laureat non trouvé avec id: " + id);
        }
        laureatRepository.deleteById(id);
    }

    // PUT /api/laureats/{id}/valider - Valider une inscription
    public Laureat validerInscription(Long id) { // CHANGED: ID → Long
        Laureat existing = getById(id);
        existing.setStatus(InscriptionStatus.PUBLISHED);
        existing.setMotifRejet(null);
        existing.setDateValidation(LocalDateTime.now());
        return laureatRepository.save(existing);
    }

    // PUT /api/laureats/{id}/rejeter - Rejeter une inscription (avec motif)
    public Laureat rejeterInscription(Long id, String motif) { // CHANGED: ID → Long
        Laureat existing = getById(id);
        existing.setStatus(InscriptionStatus.REJECTED);
        existing.setMotifRejet(motif);
        existing.setDateValidation(LocalDateTime.now());
        return laureatRepository.save(existing);
    }

    // GET /api/laureats/statut/{statut} - Filtrer par statut (FONCTIONNEL)
    @Transactional(readOnly = true)
    public List<Laureat> getByStatut(String statut) {
        String normalizedStatus = statut.trim().toLowerCase();
        return laureatRepository.findByStatusNative(normalizedStatus);
    }

    // GET /api/laureats/recherche - Recherche multi-filtres
    @Transactional(readOnly = true)
    public List<Laureat> rechercherMultiFiltres(String filiere, String promotion,
            String secteur, String nom) {
        if (nom != null && !nom.trim().isEmpty()) {
            return laureatRepository.searchByName(nom);
        } else {
            FiliereType filiereEnum = null;
            SecteurType secteurEnum = null;

            try {
                filiereEnum = filiere != null ? FiliereType.fromDbValue(filiere) : null;
                secteurEnum = secteur != null ? SecteurType.fromDbValue(secteur) : null;
            } catch (IllegalArgumentException e) {
                // Si conversion échoue, on ignore le filtre
                System.err.println("Erreur de conversion: " + e.getMessage());
            }

            return laureatRepository.searchLaureats(filiereEnum, promotion, secteurEnum, null);
        }
    }

    // STATISTIQUES
    @Transactional(readOnly = true)
    public long countByStatus(String statut) {
        try {
            InscriptionStatus status = convertToInscriptionStatus(statut);
            return laureatRepository.countByStatus(status);
        } catch (IllegalArgumentException e) {
            return 0;
        }
    }

    @Transactional(readOnly = true)
    public long countTotal() {
        return laureatRepository.count();
    }

    // POST /api/laureats/photo - Charger une photo de profil
    public String savePhoto(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Fichier vide");
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = System.currentTimeMillis() + "_" + (int) (Math.random() * 1000) + extension; // CHANGED:
                                                                                                           // removed
                                                                                                           // ID.randomID()
            Files.copy(file.getInputStream(), this.rootLocation.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du téléchargement de la photo: " + e.getMessage());
        }
    }

    // GET /api/laureats/photo/{filename} - Télécharger une photo
    public byte[] loadPhoto(String filename) {
        try {
            Path file = rootLocation.resolve(filename);
            if (!Files.exists(file)) {
                throw new RuntimeException("Photo non trouvée: " + filename);
            }
            return Files.readAllBytes(file);
        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de la lecture de la photo: " + filename);
        }
    }

    // Associer une photo à un lauréat
    public Laureat setPhoto(Long laureatId, String filename) { // CHANGED: ID → Long
        Laureat laureat = getById(laureatId);
        laureat.setPhotoUrl("/api/laureats/photo/" + filename);
        return laureatRepository.save(laureat);
    }

    // MÉTHODE UTILITAIRE POUR CONVERTIR STRING VERS ENUM
    private InscriptionStatus convertToInscriptionStatus(String statut) {
        if (statut == null) {
            return InscriptionStatus.PENDING;
        }

        String lowerStatut = statut.trim().toLowerCase();

        switch (lowerStatut) {
            case "pending":
            case "en_attente":
            case "en attente":
                return InscriptionStatus.PENDING;

            case "published":
            case "valide":
            case "validé":
            case "publié":
                return InscriptionStatus.PUBLISHED;

            case "rejected":
            case "rejete":
            case "rejeté":
                return InscriptionStatus.REJECTED;

            default:
                throw new IllegalArgumentException("Statut invalide: " + statut);
        }
    }
}