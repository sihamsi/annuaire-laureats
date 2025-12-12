package com.example.demo.controller;

import com.example.demo.service.GeolocalisationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/geolocalisation")
@CrossOrigin(origins = "*")
public class GeolocalisationController {

    private final GeolocalisationService geolocalisationService;

    public GeolocalisationController(GeolocalisationService geolocalisationService) {
        this.geolocalisationService = geolocalisationService;
    }

    // POST /api/geolocalisation/province
    // Body: { "latitude": 33.57, "longitude": -7.62 }
    @PostMapping("/province")
    public ResponseEntity<?> identifierProvince(@RequestBody Map<String, Double> request) {
        try {
            Double latitude = request.get("latitude");
            Double longitude = request.get("longitude");

            Map<String, String> result = geolocalisationService.identifierProvince(latitude, longitude);
            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de l'identification de la province"));
        }
    }

    // GET /api/geolocalisation/laureats
    // Retourne la liste des lauréats avec lat/lon + province (join province)
    @GetMapping("/laureats")
    public ResponseEntity<?> getLaureatsAvecCoordonnees(
            @RequestParam(required = false, defaultValue = "false") boolean publishedOnly) {
        try {
            List<Map<String, Object>> data = geolocalisationService.getLaureatsAvecCoordonnees(publishedOnly);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des lauréats"));
        }
    }

    // GET /api/geolocalisation/laureat/{id}
    // Donne la province calculée depuis province_id (trigger PostGIS)
    @GetMapping("/laureat/{id}/province")
    public ResponseEntity<?> getProvinceForLaureat(@PathVariable Long id) {
        try {
            Map<String, Object> result = geolocalisationService.getProvinceForLaureat(id);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération de la province"));
        }
    }
}
