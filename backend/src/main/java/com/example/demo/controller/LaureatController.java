package com.example.demo.controller;

import com.example.demo.entity.Laureat;
import com.example.demo.service.LaureatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/laureats")
@CrossOrigin(origins = "*")
public class LaureatController {

    private static final Logger logger = LoggerFactory.getLogger(LaureatController.class);
    private final LaureatService laureatService;

    public LaureatController(LaureatService laureatService) {
        this.laureatService = laureatService;
    }

    // ✅ POST /api/laureats - Ajouter un nouveau lauréat
    @PostMapping
    public ResponseEntity<?> addLaureat(@RequestBody Laureat laureat) {
        try {
            Laureat savedLaureat = laureatService.addLaureat(laureat);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedLaureat);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erreur lors de la création du lauréat"));
        }
    }

    // ✅ GET /api/laureats - Lister tous les lauréats
    @GetMapping
    public ResponseEntity<List<Laureat>> getAllLaureats() {
        List<Laureat> laureats = laureatService.getAllLaureats();
        return ResponseEntity.ok(laureats);
    }

    // ✅ GET /api/laureats/{id} - Consulter les détails d'un lauréat
    @GetMapping("/{id}")
    public ResponseEntity<Laureat> getLaureatById(@PathVariable Long id) {  // CHANGE: ID → Long
        try {
            Laureat laureat = laureatService.getById(id);
            return ResponseEntity.ok(laureat);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ GET /api/laureats/{id}/similar - Trouver les personnes ayant la même filière, promotion et entreprise
    @GetMapping("/{id}/similar")
    public ResponseEntity<List<Laureat>> getSimilarLaureats(@PathVariable Long id) {
        try {
            List<Laureat> similarLaureats = laureatService.findSimilarLaureats(id);
            return ResponseEntity.ok(similarLaureats);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ GET /api/laureats/by-email/{email} - Récupérer un lauréat par email (pour connexion)
    @GetMapping("/by-email/{email}")
    public ResponseEntity<Laureat> getLaureatByEmail(@PathVariable String email) {
        try {
            Laureat laureat = laureatService.getByEmail(email);
            return ResponseEntity.ok(laureat);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ POST /api/laureats/login - Connexion avec email et mot de passe
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            if (email == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email et mot de passe requis"));
            }
            
            Laureat laureat = laureatService.authenticate(email, password);
            return ResponseEntity.ok(laureat);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Email ou mot de passe incorrect"));
        }
    }

    // ✅ PUT /api/laureats/{id} - Modifier les informations d'un lauréat
    @PutMapping("/{id}")
    public ResponseEntity<?> updateLaureat(@PathVariable Long id, @RequestBody Laureat laureat) {  // CHANGE: ID → Long
        try {
            Laureat updatedLaureat = laureatService.updateLaureat(id, laureat);
            return ResponseEntity.ok(updatedLaureat);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ DELETE /api/laureats/{id} - Supprimer un lauréat
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLaureat(@PathVariable Long id) {  // CHANGE: ID → Long
        try {
            laureatService.deleteLaureat(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ PUT /api/laureats/{id}/valider - Valider une inscription
    @PutMapping("/{id}/valider")
    public ResponseEntity<Laureat> validerInscription(@PathVariable Long id) {  // CHANGE: ID → Long
        try {
            Laureat laureat = laureatService.validerInscription(id);
            return ResponseEntity.ok(laureat);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ PUT /api/laureats/{id}/rejeter - Rejeter une inscription
    @PutMapping("/{id}/rejeter")
    public ResponseEntity<Laureat> rejeterInscription(@PathVariable Long id, @RequestBody Map<String, String> request) {  // CHANGE: ID → Long
        try {
            String motif = request.get("motif");
            if (motif == null || motif.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            Laureat laureat = laureatService.rejeterInscription(id, motif);
            return ResponseEntity.ok(laureat);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ PUT /api/laureats/{id}/password - Définir ou mettre à jour le mot de passe
    @PutMapping("/{id}/password")
    public ResponseEntity<?> setPassword(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            String password = request.get("password");
            if (password == null || password.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le mot de passe est requis"));
            }
            
            Laureat laureat = laureatService.setPassword(id, password);
            return ResponseEntity.ok(laureat);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ POST /api/laureats/migrate-passwords - Déclencher manuellement la migration des mots de passe
    @PostMapping("/migrate-passwords")
    public ResponseEntity<?> migratePasswords() {
        try {
            laureatService.migratePasswordsForValidatedAccounts();
            return ResponseEntity.ok(Map.of("message", "Migration des mots de passe terminée avec succès"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la migration: " + e.getMessage()));
        }
    }

    // ✅ POST /api/laureats/generate-password - Générer un mot de passe pour un compte spécifique par email
    @PostMapping("/generate-password")
    public ResponseEntity<?> generatePassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            if (email == null || email.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "L'email est requis"));
            }
            
            String tempPassword = laureatService.generatePasswordForEmail(email);
            return ResponseEntity.ok(Map.of(
                    "message", "Mot de passe généré avec succès",
                    "password", tempPassword,
                    "email", email
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de la génération du mot de passe: " + e.getMessage()));
        }
    }

    // ✅ GET /api/laureats/statut/{statut} - Filtrer par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<Laureat>> getByStatut(@PathVariable String statut) {
        try {
            List<Laureat> laureats = laureatService.getByStatut(statut);
            return ResponseEntity.ok(laureats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ✅ GET /api/laureats/recherche - Recherche multi-filtres
    @GetMapping("/recherche")
    public ResponseEntity<List<Laureat>> rechercherMultiFiltres(
            @RequestParam(required = false) String filiere,
            @RequestParam(required = false) String promotion,
            @RequestParam(required = false) String secteur,
            @RequestParam(required = false) String nom) {

        List<Laureat> laureats = laureatService.rechercherMultiFiltres(filiere, promotion, secteur, nom);
        return ResponseEntity.ok(laureats);
    }

    // ✅ GET /api/laureats/statistiques - Obtenir les statistiques
    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("total", laureatService.countTotal());
        stats.put("pending", laureatService.countByStatus("pending"));
        stats.put("published", laureatService.countByStatus("published"));
        stats.put("rejected", laureatService.countByStatus("rejected"));

        return ResponseEntity.ok(stats);
    }

    // ✅ POST /api/laureats/photo - Charger une photo
    @PostMapping("/photo")
    public ResponseEntity<Map<String, String>> uploadPhoto(@RequestParam("file") MultipartFile file) {
        try {
            String filename = laureatService.savePhoto(file);
            return ResponseEntity.ok(Map.of(
                    "filename", filename,
                    "message", "Photo téléchargée avec succès"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ POST /api/laureats/{id}/photo - Upload et associer une photo
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            System.out.println("📸 === UPLOAD PHOTO REÇU ===");
            System.out.println("Lauréat ID: " + id);
            System.out.println("Fichier reçu: " + (file != null ? "OUI" : "NON"));
            System.out.println("Nom fichier: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("Taille fichier: " + (file != null ? file.getSize() + " bytes" : "null"));
            System.out.println("Type MIME: " + (file != null ? file.getContentType() : "null"));
            System.out.println("Fichier vide: " + (file != null ? file.isEmpty() : "null"));
            
            Laureat laureat = laureatService.uploadAndSetPhoto(id, file);
            System.out.println("✅ Photo uploadée avec succès pour le lauréat " + id);
            System.out.println("Photo URL: " + laureat.getPhotoUrl());
            return ResponseEntity.ok(laureat);
        } catch (RuntimeException e) {
            System.err.println("❌ Erreur RuntimeException: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ Erreur Exception: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Erreur lors de l'upload de la photo: " + e.getMessage()));
        }
    }

    // ✅ GET /api/laureats/photo/{filename} - Télécharger une photo
    @GetMapping("/photo/{filename}")
    public ResponseEntity<byte[]> downloadPhoto(@PathVariable String filename) {
        logger.info("📸 === REQUÊTE PHOTO REÇUE ===");
        logger.info("📸 Filename reçu: {}", filename);
        try {
            byte[] photoBytes = laureatService.loadPhoto(filename);
            logger.info("✅ Photo chargée avec succès, taille: {} bytes", photoBytes.length);

            HttpHeaders headers = new HttpHeaders();
            
            // Déterminer le type MIME en fonction de l'extension
            String lowerFilename = filename.toLowerCase();
            if (lowerFilename.endsWith(".png")) {
                headers.setContentType(MediaType.IMAGE_PNG);
            } else if (lowerFilename.endsWith(".gif")) {
                headers.setContentType(MediaType.IMAGE_GIF);
            } else {
                headers.setContentType(MediaType.IMAGE_JPEG);
            }
            
            headers.setContentDispositionFormData("inline", filename);
            headers.setCacheControl("public, max-age=3600"); // Cache 1 heure
            headers.set("Access-Control-Allow-Origin", "*"); // CORS

            logger.info("✅ Photo envoyée avec succès");
            return new ResponseEntity<>(photoBytes, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            logger.error("❌ Erreur lors du chargement de la photo {}: {}", filename, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            logger.error("❌ Exception lors du chargement de la photo {}: {}", filename, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // ✅ ENDPOINT DE TEST SIMPLE
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        return ResponseEntity.ok(Map.of(
                "status", "OK",
                "message", "API Laureat est fonctionnelle",
                "timestamp", java.time.LocalDateTime.now().toString()));
    }

    // ✅ ENDPOINT POUR DÉBOGUER LE FILTRE PAR STATUT
    @GetMapping("/debug/status/{status}")
    public ResponseEntity<Map<String, Object>> debugStatus(@PathVariable String status) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            List<Laureat> results = laureatService.getByStatut(status);
            response.put("success", true);
            response.put("status_param", status);
            response.put("count", results.size());
            response.put("results", results);
        } catch (Exception e) {
            response.put("success", false);
            response.put("error", e.getMessage());
            response.put("status_param", status);
        }
        
        return ResponseEntity.ok(response);
    }
}