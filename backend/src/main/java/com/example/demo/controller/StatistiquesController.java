package com.example.demo.controller;

import com.example.demo.dto.StatistiquesDTO;
import com.example.demo.service.StatistiquesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/statistiques")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Statistiques", description = "API pour les statistiques des lauréats")
public class StatistiquesController {
    
    private final StatistiquesService statistiquesService;
    
    @GetMapping
    @Operation(summary = "Récupérer toutes les statistiques")
    public ResponseEntity<StatistiquesDTO> getStatistiques() {
        StatistiquesDTO stats = statistiquesService.getStatistiques();
        return ResponseEntity.ok(stats);
    }
}

