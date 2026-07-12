package com.example.demo.service;

import com.example.demo.entity.*;
import com.example.demo.repository.LaureatRepository;
import com.example.demo.repository.ProvinceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class LaureatService {

    private static final Logger logger = LoggerFactory.getLogger(LaureatService.class);
    private final LaureatRepository laureatRepository;
    private final ProvinceRepository provinceRepository;
    private final NotificationService notificationService;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final Path rootLocation = Paths.get("uploads");
    private final Path staticPhotosLocation = initializeStaticPhotosLocation();

    private static Path initializeStaticPhotosLocation() {
        Logger log = LoggerFactory.getLogger(LaureatService.class);
        try {
            String userDir = System.getProperty("user.dir");
            log.info("📂 Répertoire de travail actuel: {}", userDir);
            
            // Essayer plusieurs chemins possibles pour static/photos
            Path[] possiblePaths = {
                // Chemin absolu depuis le répertoire de travail
                Paths.get(userDir, "src/main/resources/static/photos"),
                // Si lancé depuis la racine du workspace
                Paths.get(userDir, "backend/src/main/resources/static/photos"),
                // Chemin relatif depuis la racine du projet
                Paths.get("src/main/resources/static/photos"),
                // Chemin relatif depuis la racine du workspace
                Paths.get("backend/src/main/resources/static/photos"),
            };
            
            Path selectedPath = null;
            for (Path path : possiblePaths) {
                try {
                    Path absolutePath = path.toAbsolutePath();
                    log.debug("🔍 Test chemin: {}", absolutePath);
                    
                    // Vérifier si le dossier existe ou peut être créé
                    if (!Files.exists(absolutePath)) {
                        Files.createDirectories(absolutePath);
                    }
                    
                    if (Files.exists(absolutePath) && Files.isWritable(absolutePath)) {
                        // Vérifier qu'il y a des fichiers dedans (pour confirmer que c'est le bon dossier)
                        boolean hasFiles = Files.list(absolutePath).findAny().isPresent();
                        if (hasFiles || selectedPath == null) {
                            selectedPath = absolutePath;
                            log.info("📁 Dossier photos sélectionné: {} (contient {} fichiers)", 
                                absolutePath, hasFiles ? "des" : "aucun");
                            if (hasFiles) break; // Préférer un dossier qui contient déjà des fichiers
                        }
                    }
                } catch (Exception e) {
                    log.debug("Chemin non disponible: {} - {}", path, e.getMessage());
                }
            }
            
            if (selectedPath == null) {
                // Utiliser le premier chemin par défaut
                selectedPath = possiblePaths[0].toAbsolutePath();
                Files.createDirectories(selectedPath);
                log.warn("⚠️ Utilisation du chemin par défaut: {}", selectedPath);
            }
            
            log.info("✅ Dossier photos initialisé: {}", selectedPath);
            return selectedPath;
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage", e);
        }
    }

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

        // Hasher le mot de passe si fourni
        if (laureat.getPassword() != null && !laureat.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(laureat.getPassword());
            laureat.setPassword(hashedPassword);
        }

        // ✅ Calculer automatiquement provinceId à partir des coordonnées
        if (laureat.getLatitude() != null && laureat.getLongitude() != null 
                && laureat.getProvinceId() == null) {
            try {
                Long provinceId = provinceRepository
                        .findProvinceIdContainingPoint(laureat.getLatitude(), laureat.getLongitude())
                        .orElseGet(() -> {
                            logger.debug("Aucune province ne contient le point (lat={}, lon={}), recherche de la province la plus proche", 
                                    laureat.getLatitude(), laureat.getLongitude());
                            return provinceRepository
                                    .findNearestProvinceId(laureat.getLatitude(), laureat.getLongitude())
                                    .orElse(null);
                        });
                
                if (provinceId != null) {
                    laureat.setProvinceId(provinceId);
                    logger.info("Province ID {} assignée au lauréat (lat={}, lon={})", 
                            provinceId, laureat.getLatitude(), laureat.getLongitude());
                } else {
                    logger.warn("Aucune province trouvée pour les coordonnées lat={}, lon={}", 
                            laureat.getLatitude(), laureat.getLongitude());
                }
            } catch (Exception e) {
                logger.error("Erreur lors de la recherche de la province pour lat={}, lon={}: {}", 
                        laureat.getLatitude(), laureat.getLongitude(), e.getMessage(), e);
                // Ne pas faire échouer l'inscription si la recherche de province échoue
            }
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

    // GET /api/laureats/by-email/{email} - Récupérer un lauréat par email
    @Transactional(readOnly = true)
    public Laureat getByEmail(String email) {
        return laureatRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Laureat non trouvé avec email: " + email));
    }

    // POST /api/laureats/login - Authentifier un lauréat avec email et mot de passe
    @Transactional(readOnly = true)
    public Laureat authenticate(String email, String password) {
        Laureat laureat = laureatRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Email ou mot de passe incorrect"));
        
        // Vérifier le statut
        if (laureat.getStatus() == InscriptionStatus.PENDING) {
            throw new IllegalArgumentException("Votre inscription est en cours de validation");
        }
        
        if (laureat.getStatus() == InscriptionStatus.REJECTED) {
            throw new IllegalArgumentException("Votre inscription a été rejetée");
        }
        
        // Vérifier le mot de passe
        if (laureat.getPassword() == null || laureat.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Aucun mot de passe défini pour ce compte");
        }
        
        if (!passwordEncoder.matches(password, laureat.getPassword())) {
            throw new IllegalArgumentException("Email ou mot de passe incorrect");
        }
        
        return laureat;
    }

    // PUT /api/laureats/{id} - Modifier les informations d'un lauréat (mise à jour partielle)
    public Laureat updateLaureat(Long id, Laureat updated) { // CHANGED: ID → Long
        Laureat existing = getById(id);

        // Vérifier l'email uniquement s'il est modifié
        if (updated.getEmail() != null && !updated.getEmail().equals(existing.getEmail()) &&
                laureatRepository.existsByEmail(updated.getEmail())) {
            throw new IllegalArgumentException("Un lauréat avec cet email existe déjà");
        }

        // ✅ Mise à jour partielle : ne mettre à jour que les champs fournis (non null)
        // Note: Pour les champs nullable, on ne met à jour que s'ils sont non-null dans le payload
        if (updated.getNom() != null) existing.setNom(updated.getNom());
        if (updated.getPrenom() != null) existing.setPrenom(updated.getPrenom());
        if (updated.getGenre() != null) existing.setGenre(updated.getGenre());
        if (updated.getEmail() != null) existing.setEmail(updated.getEmail());
        // telephone peut être null, donc on le met toujours à jour
        existing.setTelephone(updated.getTelephone());
        if (updated.getFiliere() != null) existing.setFiliere(updated.getFiliere());
        if (updated.getPromotion() != null) existing.setPromotion(updated.getPromotion());
        if (updated.getSecteur() != null) existing.setSecteur(updated.getSecteur());
        if (updated.getOrganismeId() != null) existing.setOrganismeId(updated.getOrganismeId());
        // autreOrganisme peut être null pour effacer
        existing.setAutreOrganisme(updated.getAutreOrganisme());
        boolean coordinatesChanged = false;
        if (updated.getLatitude() != null && !updated.getLatitude().equals(existing.getLatitude())) {
            existing.setLatitude(updated.getLatitude());
            coordinatesChanged = true;
        }
        if (updated.getLongitude() != null && !updated.getLongitude().equals(existing.getLongitude())) {
            existing.setLongitude(updated.getLongitude());
            coordinatesChanged = true;
        }
        
        // ✅ Recalculer provinceId si les coordonnées ont changé
        if (coordinatesChanged && existing.getLatitude() != null && existing.getLongitude() != null) {
            try {
                Long provinceId = provinceRepository
                        .findProvinceIdContainingPoint(existing.getLatitude(), existing.getLongitude())
                        .orElseGet(() -> {
                            logger.debug("Aucune province ne contient le point (lat={}, lon={}), recherche de la province la plus proche", 
                                    existing.getLatitude(), existing.getLongitude());
                            return provinceRepository
                                    .findNearestProvinceId(existing.getLatitude(), existing.getLongitude())
                                    .orElse(null);
                        });
                
                if (provinceId != null) {
                    existing.setProvinceId(provinceId);
                    logger.info("Province ID {} recalculée pour le lauréat {} (lat={}, lon={})", 
                            provinceId, existing.getId(), existing.getLatitude(), existing.getLongitude());
                }
            } catch (Exception e) {
                logger.error("Erreur lors de la recherche de la province pour lat={}, lon={}: {}", 
                        existing.getLatitude(), existing.getLongitude(), e.getMessage(), e);
                // Ne pas faire échouer la mise à jour si la recherche de province échoue
            }
        } else if (updated.getProvinceId() != null) {
            // Si provinceId est explicitement fourni, l'utiliser
            existing.setProvinceId(updated.getProvinceId());
        }
        // description peut être null, donc on le met toujours à jour
        existing.setDescription(updated.getDescription());
        
        // ✅ Mettre à jour le mot de passe si fourni
        if (updated.getPassword() != null && !updated.getPassword().isEmpty()) {
            String hashedPassword = passwordEncoder.encode(updated.getPassword());
            existing.setPassword(hashedPassword);
        }

        // Réinitialiser le statut à PENDING après modification pour réexamen
        existing.setStatus(InscriptionStatus.PENDING);

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
        
        // ✅ Si le compte n'a pas de mot de passe, générer un mot de passe temporaire par défaut
        // Le lauréat pourra le changer lors de sa première connexion
        if (existing.getPassword() == null || existing.getPassword().isEmpty()) {
            // Générer un mot de passe temporaire basé sur le prénom et nom (pour la première connexion)
            // Format: PrenomNom123! (ex: FatimaAhmed123!)
            String tempPassword = existing.getPrenom() + existing.getNom() + "123!";
            String hashedPassword = passwordEncoder.encode(tempPassword);
            existing.setPassword(hashedPassword);
            logger.info("Mot de passe temporaire généré pour le lauréat {} (email: {})", existing.getId(), existing.getEmail());
        }
        
        Laureat saved = laureatRepository.save(existing);
        
        // ✅ Envoyer une notification de validation
        try {
            notificationService.envoyer(
                id,
                "Votre inscription a été validée par l'administrateur. Vous faites maintenant partie de l'annuaire des lauréats.",
                "VALIDATION"
            );
        } catch (Exception e) {
            // Ne pas faire échouer la validation si la notification échoue
            System.err.println("Erreur lors de l'envoi de la notification de validation: " + e.getMessage());
        }
        
        return saved;
    }

    // PUT /api/laureats/{id}/password - Définir ou mettre à jour le mot de passe d'un lauréat
    public Laureat setPassword(Long id, String password) {
        Laureat existing = getById(id);
        
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Le mot de passe ne peut pas être vide");
        }
        
        if (password.length() < 6) {
            throw new IllegalArgumentException("Le mot de passe doit contenir au moins 6 caractères");
        }
        
        String hashedPassword = passwordEncoder.encode(password);
        existing.setPassword(hashedPassword);
        
        return laureatRepository.save(existing);
    }

    // POST /api/laureats/migrate-passwords - Migrer les mots de passe pour les comptes validés sans mot de passe
    public void migratePasswordsForValidatedAccounts() {
        List<Laureat> validatedAccountsWithoutPassword = laureatRepository.findAll().stream()
                .filter(laureat -> laureat.getStatus() == InscriptionStatus.PUBLISHED)
                .filter(laureat -> laureat.getPassword() == null || laureat.getPassword().isEmpty())
                .toList();

        if (validatedAccountsWithoutPassword.isEmpty()) {
            logger.info("✅ Aucun compte validé sans mot de passe trouvé.");
            return;
        }

        logger.info("🔄 Migration des mots de passe: {} compte(s) validé(s) sans mot de passe trouvé(s).", 
                validatedAccountsWithoutPassword.size());

        int count = 0;
        for (Laureat laureat : validatedAccountsWithoutPassword) {
            try {
                // Générer un mot de passe temporaire: PrenomNom123!
                String tempPassword = laureat.getPrenom() + laureat.getNom() + "123!";
                String hashedPassword = passwordEncoder.encode(tempPassword);
                laureat.setPassword(hashedPassword);
                laureatRepository.save(laureat);
                count++;
                logger.info("✅ Mot de passe temporaire généré pour le lauréat {} (email: {}). Mot de passe: {}", 
                        laureat.getId(), laureat.getEmail(), tempPassword);
            } catch (Exception e) {
                logger.error("❌ Erreur lors de la génération du mot de passe pour le lauréat {}: {}", 
                        laureat.getId(), e.getMessage());
            }
        }

        logger.info("✅ Migration terminée: {} mot(s) de passe généré(s) avec succès.", count);
    }

    // Générer un mot de passe pour un compte spécifique par email
    public String generatePasswordForEmail(String email) {
        Laureat laureat = laureatRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Lauréat non trouvé avec email: " + email));
        
        // Générer un mot de passe temporaire: PrenomNom123!
        String tempPassword = laureat.getPrenom() + laureat.getNom() + "123!";
        String hashedPassword = passwordEncoder.encode(tempPassword);
        laureat.setPassword(hashedPassword);
        laureatRepository.save(laureat);
        
        logger.info("✅ Mot de passe temporaire généré pour le lauréat {} (email: {}). Mot de passe: {}", 
                laureat.getId(), laureat.getEmail(), tempPassword);
        
        return tempPassword;
    }

    // PUT /api/laureats/{id}/rejeter - Rejeter une inscription (avec motif(s))
    // Accepte un seul motif ou plusieurs motifs séparés par "|"
    public Laureat rejeterInscription(Long id, String motif) { // CHANGED: ID → Long
        Laureat existing = getById(id);
        existing.setStatus(InscriptionStatus.REJECTED);
        
        // Valider que chaque motif est dans la liste des motifs autorisés
        // Les motifs peuvent être séparés par "|" pour permettre plusieurs motifs
        String[] motifs = motif.split("\\|");
        for (String m : motifs) {
            String trimmedMotif = m.trim();
            try {
                com.example.demo.entity.MotifRejet.fromLibelle(trimmedMotif);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Motif de rejet non valide: " + trimmedMotif);
            }
        }
        
        existing.setMotifRejet(motif);
        existing.setDateValidation(LocalDateTime.now());
        Laureat saved = laureatRepository.save(existing);
        
        // ✅ Envoyer une notification de rejet avec le(s) motif(s)
        try {
            String message = "Votre inscription a été rejetée.\n\nMotif(s): " + motif.replace("|", ", ") + "\n\nVous pouvez modifier votre profil et soumettre à nouveau votre inscription.";
            notificationService.envoyer(
                id,
                message,
                "REJET"
            );
        } catch (Exception e) {
            // Ne pas faire échouer le rejet si la notification échoue
            System.err.println("Erreur lors de l'envoi de la notification de rejet: " + e.getMessage());
        }
        
        return saved;
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

    // GET /api/laureats/{id}/similar - Trouver les personnes ayant la même filière (et optionnellement même promotion et entreprise)
    @Transactional(readOnly = true)
    public List<Laureat> findSimilarLaureats(Long id) {
        Laureat currentLaureat = getById(id);
        
        // Utiliser organismeId si disponible, sinon utiliser autreOrganisme
        Long organismeId = currentLaureat.getOrganismeId();
        String autreOrganisme = currentLaureat.getAutreOrganisme();
        
        // Chercher toutes les personnes ayant la même filière
        // Si organismeId ou autreOrganisme est défini, on cherche aussi ceux qui ont la même promotion et entreprise
        // Sinon, on cherche seulement ceux qui ont la même filière
        return laureatRepository.findSimilarLaureats(
                currentLaureat.getFiliere(),
                currentLaureat.getPromotion(),
                organismeId,
                autreOrganisme,
                InscriptionStatus.PUBLISHED,
                id
        );
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
            String filename = System.currentTimeMillis() + "_" + (int) (Math.random() * 1000) + extension;
            // Sauvegarder dans static/photos pour qu'elle soit accessible via le web
            Files.copy(file.getInputStream(), this.staticPhotosLocation.resolve(filename));
            return filename;
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors du téléchargement de la photo: " + e.getMessage());
        }
    }

    // POST /api/laureats/{id}/photo - Charger et associer une photo à un lauréat
    @Transactional
    public Laureat uploadAndSetPhoto(Long laureatId, MultipartFile file) {
        logger.info("📸 === DÉBUT uploadAndSetPhoto ===");
        logger.info("📸 LaureatId: {}", laureatId);
        logger.info("📸 Fichier reçu: {}", file != null ? "OUI" : "NON");
        
        try {
            if (file == null) {
                logger.error("❌ Fichier est null");
                throw new RuntimeException("Fichier est null");
            }
            
            if (file.isEmpty()) {
                logger.error("❌ Fichier est vide");
                throw new RuntimeException("Fichier vide");
            }
            
            logger.info("📸 Nom fichier original: {}", file.getOriginalFilename());
            logger.info("📸 Taille fichier: {} bytes", file.getSize());
            logger.info("📸 Type MIME: {}", file.getContentType());

            Laureat laureat = getById(laureatId);
            logger.info("📸 Lauréat trouvé: {} {}", laureat.getPrenom(), laureat.getNom());
            
            // Obtenir l'extension du fichier
            String originalFilename = file.getOriginalFilename();
            String extension = ".jpg"; // Par défaut
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                // Normaliser l'extension en minuscules
                extension = extension.toLowerCase();
                if (!extension.equals(".jpg") && !extension.equals(".jpeg") && !extension.equals(".png")) {
                    extension = ".jpg"; // Forcer jpg si extension non supportée
                }
            }
            
            // Construire le nom de fichier: Prenom_Nom.extension
            String prenom = laureat.getPrenom() != null ? laureat.getPrenom().trim() : "";
            String nom = laureat.getNom() != null ? laureat.getNom().trim() : "";
            
            // Nettoyer les noms (enlever accents, caractères spéciaux)
            String cleanPrenom = prenom
                .toLowerCase()
                .replaceAll("[àáâãäå]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõö]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]", "");
            
            String cleanNom = nom
                .toLowerCase()
                .replaceAll("[àáâãäå]", "a")
                .replaceAll("[èéêë]", "e")
                .replaceAll("[ìíîï]", "i")
                .replaceAll("[òóôõö]", "o")
                .replaceAll("[ùúûü]", "u")
                .replaceAll("[ç]", "c")
                .replaceAll("[^a-z0-9]", "");
            
            // Si les noms sont vides, utiliser un nom par défaut avec l'ID
            if (cleanPrenom.isEmpty() || cleanNom.isEmpty()) {
                cleanPrenom = "laureat";
                cleanNom = String.valueOf(laureatId);
            }
            
            // Capitaliser la première lettre
            if (!cleanPrenom.isEmpty()) {
                cleanPrenom = cleanPrenom.substring(0, 1).toUpperCase() + cleanPrenom.substring(1);
            }
            if (!cleanNom.isEmpty()) {
                cleanNom = cleanNom.substring(0, 1).toUpperCase() + cleanNom.substring(1);
            }
            
            String filename = cleanPrenom + "_" + cleanNom + extension;
            
            // S'assurer que le dossier existe
            Files.createDirectories(this.staticPhotosLocation);
            
            // Sauvegarder dans static/photos
            Path targetPath = this.staticPhotosLocation.resolve(filename);
            logger.info("📸 Sauvegarde photo: {} vers {}", filename, targetPath.toAbsolutePath());
            
            // Vérifier si le fichier existe déjà et le remplacer si nécessaire
            if (Files.exists(targetPath)) {
                logger.warn("⚠️ Le fichier {} existe déjà, il sera remplacé", filename);
                Files.delete(targetPath);
            }
            
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            logger.info("✅ Fichier copié avec succès: {}", targetPath.toAbsolutePath());
            
            // Enregistrer l'URL au format: photos/Prenom_Nom.extension
            String photoUrl = "photos/" + filename;
            logger.info("📸 URL à enregistrer: {}", photoUrl);
            
            laureat.setPhotoUrl(photoUrl);
            logger.info("📸 photoUrl défini sur le lauréat: {}", laureat.getPhotoUrl());
            
            Laureat saved = laureatRepository.save(laureat);
            logger.info("✅ Lauréat sauvegardé avec photoUrl: {}", saved.getPhotoUrl());
            logger.info("✅ Photo sauvegardée avec succès: {} pour le lauréat {} (URL: {})", 
                filename, laureatId, photoUrl);
            
            // Vérifier que la sauvegarde a bien fonctionné
            Laureat verify = laureatRepository.findById(laureatId).orElse(null);
            if (verify != null) {
                logger.info("✅ Vérification: photoUrl dans la BD = {}", verify.getPhotoUrl());
            } else {
                logger.error("❌ ERREUR: Lauréat non trouvé après sauvegarde!");
            }
            
            return saved;
        } catch (Exception e) {
            logger.error("❌ Erreur lors du téléchargement de la photo pour le lauréat {}: {}", laureatId, e.getMessage(), e);
            throw new RuntimeException("Erreur lors du téléchargement de la photo: " + e.getMessage());
        }
    }

    // GET /api/laureats/photo/{filename} - Télécharger une photo
    public byte[] loadPhoto(String filename) {
        try {
            logger.info("🔍 Recherche photo: {}", filename);
            
            // Nettoyer le filename (enlever les espaces, etc.)
            String cleanFilename = filename.trim();
            
            // Fonction helper pour chercher un fichier dans un chemin
            java.util.function.Function<Path, byte[]> tryLoadFile = (path) -> {
                try {
                    if (Files.exists(path)) {
                        logger.info("✅ Photo trouvée: {}", path.toAbsolutePath());
                        return Files.readAllBytes(path);
                    }
                } catch (Exception e) {
                    logger.debug("Erreur lecture fichier {}: {}", path, e.getMessage());
                }
                return null;
            };
            
            // Chercher d'abord avec le nom exact
            Path targetPath = staticPhotosLocation.resolve(cleanFilename);
            byte[] result = tryLoadFile.apply(targetPath);
            if (result != null) return result;
            
            // Si le fichier n'est pas trouvé, essayer avec une autre extension (.jpg <-> .png)
            String baseName = cleanFilename;
            String alternativeFilename = null;
            if (cleanFilename.toLowerCase().endsWith(".jpg")) {
                baseName = cleanFilename.substring(0, cleanFilename.length() - 4);
                alternativeFilename = baseName + ".png";
            } else if (cleanFilename.toLowerCase().endsWith(".png")) {
                baseName = cleanFilename.substring(0, cleanFilename.length() - 4);
                alternativeFilename = baseName + ".jpg";
            } else if (cleanFilename.toLowerCase().endsWith(".jpeg")) {
                baseName = cleanFilename.substring(0, cleanFilename.length() - 5);
                alternativeFilename = baseName + ".png";
            }
            
            // Essayer avec l'extension alternative
            if (alternativeFilename != null) {
                logger.debug("🔍 Essai avec extension alternative: {}", alternativeFilename);
                Path altPath = staticPhotosLocation.resolve(alternativeFilename);
                result = tryLoadFile.apply(altPath);
                if (result != null) return result;
            }
            
            // Chercher aussi dans plusieurs chemins possibles (avec le nom original)
            String userDir = System.getProperty("user.dir");
            Path[] possiblePaths = {
                Paths.get(userDir, "src/main/resources/static/photos", cleanFilename),
                Paths.get(userDir, "backend/src/main/resources/static/photos", cleanFilename),
                Paths.get("src/main/resources/static/photos", cleanFilename),
                Paths.get("backend/src/main/resources/static/photos", cleanFilename),
            };
            
            for (Path path : possiblePaths) {
                Path absolutePath = path.toAbsolutePath();
                result = tryLoadFile.apply(absolutePath);
                if (result != null) return result;
            }
            
            // Essayer aussi avec l'extension alternative dans les chemins possibles
            if (alternativeFilename != null) {
                Path[] altPossiblePaths = {
                    Paths.get(userDir, "src/main/resources/static/photos", alternativeFilename),
                    Paths.get(userDir, "backend/src/main/resources/static/photos", alternativeFilename),
                    Paths.get("src/main/resources/static/photos", alternativeFilename),
                    Paths.get("backend/src/main/resources/static/photos", alternativeFilename),
                };
                
                for (Path path : altPossiblePaths) {
                    Path absolutePath = path.toAbsolutePath();
                    result = tryLoadFile.apply(absolutePath);
                    if (result != null) return result;
                }
            }
            
            // Chercher aussi dans resources/static/photos (au runtime, dans le JAR)
            try {
                java.io.InputStream is = getClass().getClassLoader()
                    .getResourceAsStream("static/photos/" + cleanFilename);
                if (is != null) {
                    logger.info("✅ Photo trouvée dans classpath");
                    byte[] bytes = is.readAllBytes();
                    is.close();
                    return bytes;
                }
            } catch (Exception e) {
                logger.debug("Photo non trouvée dans classpath: {}", e.getMessage());
            }
            
            // Fallback: chercher dans uploads
            Path file = rootLocation.resolve(cleanFilename);
            logger.debug("🔍 Cherche dans uploads: {}", file.toAbsolutePath());
            if (Files.exists(file)) {
                logger.info("✅ Photo trouvée dans uploads: {}", file.toAbsolutePath());
                return Files.readAllBytes(file);
            }
            
            // Lister les fichiers disponibles pour debug
            try {
                if (Files.exists(staticPhotosLocation)) {
                    logger.warn("📂 Fichiers dans staticPhotosLocation ({}) :", staticPhotosLocation);
                    Files.list(staticPhotosLocation).limit(5).forEach(p -> 
                        logger.warn("   - {}", p.getFileName())
                    );
                }
            } catch (Exception e) {
                logger.debug("Impossible de lister les fichiers: {}", e.getMessage());
            }
            
            logger.error("❌ Photo non trouvée: {} - Cherché dans staticPhotosLocation: {}", 
                cleanFilename, staticPhotosLocation);
            throw new RuntimeException("Photo non trouvée: " + cleanFilename);
        } catch (IOException e) {
            logger.error("❌ Erreur lors de la lecture de la photo {}: {}", filename, e.getMessage(), e);
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