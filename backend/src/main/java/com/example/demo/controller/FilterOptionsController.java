package com.example.demo.controller;

import com.example.demo.dto.FilterOptionsDTO;
import com.example.demo.service.FilterOptionsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/filter-options")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Options de Filtres", description = "API pour récupérer les options de filtres")
public class FilterOptionsController {
    
    private final FilterOptionsService filterOptionsService;
    
    @GetMapping
    @Operation(summary = "Récupérer toutes les options de filtres")
    public ResponseEntity<FilterOptionsDTO> getFilterOptions() {
        FilterOptionsDTO options = filterOptionsService.getFilterOptions();
        return ResponseEntity.ok(options);
    }
}

