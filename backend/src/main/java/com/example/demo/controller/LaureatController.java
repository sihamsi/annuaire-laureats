package com.example.demo.controller;

import com.example.demo.dto.LaureatRequest;
import com.example.demo.entity.Laureat;
import com.example.demo.repository.LaureatRepository;
import com.example.demo.service.ProvinceService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;


@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/laureats")
public class LaureatController {

    private final LaureatRepository laureatRepository;
    private final ProvinceService provinceService;

    public LaureatController(LaureatRepository laureatRepository,
                             ProvinceService provinceService) {
        this.laureatRepository = laureatRepository;
        this.provinceService = provinceService;
    }

    // ✅ INSCRIPTION (déjà OK chez toi)
    @PostMapping
    public ResponseEntity<?> createLaureat(@RequestBody LaureatRequest req) {

        Laureat l = new Laureat();
        l.setNom(req.nom);
        l.setPrenom(req.prenom);
        l.setGenre(req.genre);
        l.setTelephone(req.telephone);
        l.setEmail(req.email);
        l.setPromotion(req.promotion);
        l.setFiliere(req.filiere);
        l.setFiliereId(req.filiereId);
        l.setSecteur(req.secteur);
        l.setOrganisme(req.organisme);
        l.setAutreOrganisme(req.autreOrganisme);
        l.setLatitude(req.latitude);
        l.setLongitude(req.longitude);

        // ✅ province calculée via PostGIS
        String provinceName = provinceService.findProvinceNameByLatLon(req.latitude, req.longitude);
        l.setProvince(provinceName);

        l.setDescription(req.description);
        l.setPhotoUri(req.photoUri);
        l.setDeviceId(req.deviceId);

        if (req.dateInscription != null) {
            l.setDateInscription(OffsetDateTime.parse(req.dateInscription));
        } else {
            l.setDateInscription(OffsetDateTime.now());
        }

        l.setStatut("EN_ATTENTE");
        l.setMotifRejet(null);

        Laureat saved = laureatRepository.save(l);
        return ResponseEntity.ok(saved);
    }

    // ✅ Détails lauréat
    @GetMapping("/{id}")
    public Laureat getById(@PathVariable Long id) {
        return laureatRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lauréat introuvable"));
    }

    // ✅ Annuaire: VALIDÉS + filtres + pagination
    @GetMapping("/validated/filter/multi-paginated")
    public Page<Laureat> getValidatedFiltered(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) String prenom,
            @RequestParam(required = false) String filiere,
            @RequestParam(required = false) String promotion,
            @RequestParam(required = false) String organisme,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String secteur,
            @RequestParam(required = false) String province,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Specification<Laureat> spec = (root, q, cb) ->
                cb.equal(root.get("statut"), "VALIDE");

        spec = spec.and(likeIfPresent("nom", nom));
        spec = spec.and(likeIfPresent("prenom", prenom));
        spec = spec.and(eqIfPresent("filiere", filiere));
        spec = spec.and(eqIfPresent("promotion", promotion));
        spec = spec.and(eqIfPresent("organisme", organisme));
        spec = spec.and(eqIfPresent("genre", genre));
        spec = spec.and(eqIfPresent("secteur", secteur));
        spec = spec.and(eqIfPresent("province", province));

        return laureatRepository.findAll(spec, PageRequest.of(page, size));
    }

    // ✅ Route rapide pour valider un lauréat (test + futur admin)
    @PutMapping("/{id}/validate")
    public Laureat validate(@PathVariable Long id) {
        Laureat l = laureatRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lauréat introuvable"));
        l.setStatut("VALIDE");
        l.setMotifRejet(null);
        return laureatRepository.save(l);
    }

    // ---------------- HELPERS (Specs) ----------------
    private Specification<Laureat> likeIfPresent(String field, String val) {
        return (root, q, cb) -> {
            if (val == null || val.isBlank()) return cb.conjunction();
            return cb.like(cb.lower(root.get(field)), "%" + val.toLowerCase() + "%");
        };
    }

    private Specification<Laureat> eqIfPresent(String field, String val) {
        return (root, q, cb) -> {
            if (val == null || val.isBlank()) return cb.conjunction();
            return cb.equal(root.get(field), val);
        };
    }

    @GetMapping("/validated/map-points")
public java.util.List<java.util.Map<String, Object>> getValidatedMapPoints() {
    return laureatRepository.findAll((root, q, cb) -> cb.equal(root.get("statut"), "VALIDE"))
            .stream()
            .filter(l -> l.getLatitude() != null && l.getLongitude() != null)
            .map(l -> java.util.Map.<String, Object>of(
                    "id", l.getId(),
                    "nom", l.getNom(),
                    "prenom", l.getPrenom(),
                    "latitude", l.getLatitude(),
                    "longitude", l.getLongitude(),
                    "province", l.getProvince(),
                    "filiere", l.getFiliere(),
                    "promotion", l.getPromotion()
            ))
            .toList();
}

// ✅ Upload photo du lauréat (multipart/form-data)
@PostMapping("/{id}/photo")
public ResponseEntity<?> uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {

    Laureat l = laureatRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lauréat introuvable"));

    if (file == null || file.isEmpty()) {
        return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide"));
    }

    try {
        // 1) dossier uploads/
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 2) extension
        String originalName = file.getOriginalFilename();
        String ext = ".jpg";
        if (originalName != null && originalName.contains(".")) {
            ext = originalName.substring(originalName.lastIndexOf("."));
        }

        // 3) nom unique
        String filename = UUID.randomUUID() + ext;

        // 4) sauver le fichier
        Path target = uploadDir.resolve(filename);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        // 5) construire URL publique
        String url = "http://172.19.1.57:8081/uploads/" + filename;

        // 6) enregistrer dans DB
        l.setPhotoUri(url);
        laureatRepository.save(l);

        return ResponseEntity.ok(Map.of("photoUri", url));

    } catch (Exception e) {
        return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
    }
}
// ✅ Modifier un profil (update)
@PutMapping("/{id}")
public Laureat updateLaureat(@PathVariable Long id, @RequestBody LaureatRequest req) {

    Laureat l = laureatRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Lauréat introuvable"));

    // ✅ Champs modifiables (tu peux ajuster)
    if (req.nom != null) l.setNom(req.nom);
    if (req.prenom != null) l.setPrenom(req.prenom);
    if (req.genre != null) l.setGenre(req.genre);

    if (req.telephone != null) l.setTelephone(req.telephone);
    if (req.email != null) l.setEmail(req.email);

    if (req.promotion != null) l.setPromotion(req.promotion);
    if (req.filiere != null) l.setFiliere(req.filiere);
    if (req.filiereId != null) l.setFiliereId(req.filiereId);

    if (req.secteur != null) l.setSecteur(req.secteur);
    if (req.organisme != null) l.setOrganisme(req.organisme);
    if (req.autreOrganisme != null) l.setAutreOrganisme(req.autreOrganisme);

    // ⚠️ Si tu veux autoriser changement position :
    if (req.latitude != null) l.setLatitude(req.latitude);
    if (req.longitude != null) l.setLongitude(req.longitude);

    // si lat/lon changent => recalcul province
    if (req.latitude != null && req.longitude != null) {
        String provinceName = provinceService.findProvinceNameByLatLon(req.latitude, req.longitude);
        l.setProvince(provinceName);
    }

    if (req.description != null) l.setDescription(req.description);

    // ✅ la photo : elle se gère via /{id}/photo (upload) => on ne touche pas ici
    return laureatRepository.save(l);
}


}

