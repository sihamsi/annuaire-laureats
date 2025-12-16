package com.example.demo.controller;

import com.example.demo.service.FiltresService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/filtres")
@CrossOrigin(origins = "*")
public class FiltresController {

    private final FiltresService filtresService;

    public FiltresController(FiltresService filtresService) {
        this.filtresService = filtresService;
    }

    @GetMapping("/filieres")
    public ResponseEntity<?> getFilieres() {
        try {
            return ResponseEntity.ok(filtresService.getFilieres());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des filières"));
        }
    }

    @GetMapping("/promotions")
    public ResponseEntity<?> getPromotions() {
        try {
            return ResponseEntity.ok(filtresService.getPromotions());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des promotions"));
        }
    }

    @GetMapping("/secteurs")
    public ResponseEntity<?> getSecteurs() {
        try {
            return ResponseEntity.ok(filtresService.getSecteurs());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des secteurs"));
        }
    }

    @GetMapping("/provinces")
    public ResponseEntity<?> getProvinces() {
        try {
            return ResponseEntity.ok(filtresService.getProvinces());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des provinces"));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllFiltres() {
        try {
            return ResponseEntity.ok(filtresService.getAllFiltres());
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Erreur lors de la récupération des filtres"));
        }
    }
}
