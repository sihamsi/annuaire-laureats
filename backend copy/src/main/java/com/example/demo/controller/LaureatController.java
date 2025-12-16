package com.example.demo.controller;

import com.example.demo.entity.Laureat;
import com.example.demo.service.LaureatService;
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

    // ✅ POST /api/laureats/{id}/photo - Associer une photo
    @PostMapping("/{id}/photo")
    public ResponseEntity<Laureat> setPhoto(@PathVariable Long id, @RequestBody Map<String, String> request) {  // CHANGE: ID → Long
        try {
            String filename = request.get("filename");
            if (filename == null || filename.trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            Laureat laureat = laureatService.setPhoto(id, filename);
            return ResponseEntity.ok(laureat);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ GET /api/laureats/photo/{filename} - Télécharger une photo
    @GetMapping("/photo/{filename}")
    public ResponseEntity<byte[]> downloadPhoto(@PathVariable String filename) {
        try {
            byte[] photoBytes = laureatService.loadPhoto(filename);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentDispositionFormData("inline", filename);

            return new ResponseEntity<>(photoBytes, headers, HttpStatus.OK);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
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