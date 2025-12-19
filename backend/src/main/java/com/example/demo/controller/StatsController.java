package com.example.demo.controller;

import com.example.demo.service.StatsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    // GET /api/stats/filiere
    @GetMapping("/filiere")
    public ResponseEntity<List<Map<String, Object>>> statsByFiliere() {
        return ResponseEntity.ok(statsService.byFiliere());
    }

    // GET /api/stats/promotion
    @GetMapping("/promotion")
    public ResponseEntity<List<Map<String, Object>>> statsByPromotion() {
        return ResponseEntity.ok(statsService.byPromotion());
    }

    // GET /api/stats/secteur
    @GetMapping("/secteur")
    public ResponseEntity<List<Map<String, Object>>> statsBySecteur() {
        return ResponseEntity.ok(statsService.bySecteur());
    }

    // GET /api/stats/genre
    @GetMapping("/genre")
    public ResponseEntity<List<Map<String, Object>>> statsByGenre() {
        return ResponseEntity.ok(statsService.byGenre());
    }

    // GET /api/stats/province
    @GetMapping("/province")
    public ResponseEntity<List<Map<String, Object>>> statsByProvince() {
        return ResponseEntity.ok(statsService.byProvince());
    }
}
