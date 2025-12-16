package com.example.demo.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.StatsService;

@RestController
@RequestMapping("/api/stats")
@CrossOrigin(origins = "*")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/filiere")
    public Map<String, Long> statsFiliere() {
        return statsService.getStatsByFiliere();
    }

    @GetMapping("/promotion")
    public Map<String, Long> statsPromotion() {
        return statsService.getStatsByPromotion();
    }

    @GetMapping("/secteur")
    public Map<String, Long> statsSecteur() {
        return statsService.getStatsBySecteur();
    }

    @GetMapping("/genre")
    public Map<String, Long> statsGenre() {
        return statsService.getStatsByGenre();
    }

    @GetMapping("/province")
    public Map<String, Long> statsProvince() {
        return statsService.getStatsByProvince();
    }
}
