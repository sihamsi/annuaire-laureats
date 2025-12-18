package com.example.demo.controller;

import com.example.demo.dto.*;
import com.example.demo.model.Laureat;
import com.example.demo.service.LaureatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laureats")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Lauréats", description = "API pour la gestion des lauréats")
public class LaureatController {
    
    private final LaureatService laureatService;
    
    @PostMapping
    @Operation(summary = "Créer un nouveau lauréat")
    public ResponseEntity<LaureatDTO> createLaureat(@RequestBody LaureatCreateDTO dto) {
        LaureatDTO result = laureatService.createLaureat(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    @GetMapping
    @Operation(summary = "Récupérer les lauréats avec filtres et pagination")
    public ResponseEntity<LaureatPageResponseDTO> getLaureats(
            @ModelAttribute LaureatFilterDTO filter,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        LaureatPageResponseDTO response = laureatService.getLaureatsWithFilters(filter, page, size);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/list")
    @Operation(summary = "Récupérer la liste complète des lauréats avec filtres")
    public ResponseEntity<List<LaureatDTO>> getLaureatsList(@ModelAttribute LaureatFilterDTO filter) {
        List<LaureatDTO> laureats = laureatService.getLaureatsWithFiltersList(filter);
        return ResponseEntity.ok(laureats);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un lauréat par ID")
    public ResponseEntity<LaureatDTO> getLaureatById(@PathVariable Integer id) {
        Laureat laureat = laureatService.getLaureatById(id);
        return ResponseEntity.ok(laureatService.convertToDTO(laureat));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un lauréat")
    public ResponseEntity<LaureatDTO> updateLaureat(
            @PathVariable Integer id,
            @Valid @RequestBody LaureatUpdateDTO dto) {
        LaureatDTO result = laureatService.updateLaureat(id, dto);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/{id}/validate")
    @Operation(summary = "Valider un lauréat (changer le statut à PUBLISHED)")
    public ResponseEntity<LaureatDTO> validateLaureat(
            @PathVariable Integer id,
            @RequestParam(required = false) Integer validatedBy) {
        LaureatDTO result = laureatService.validateLaureat(id, validatedBy);
        return ResponseEntity.ok(result);
    }
    
    @PostMapping("/{id}/reject")
    @Operation(summary = "Rejeter un lauréat (changer le statut à REJECTED)")
    public ResponseEntity<LaureatDTO> rejectLaureat(
            @PathVariable Integer id,
            @Valid @RequestBody RejectLaureatDTO dto,
            @RequestParam(required = false) Integer rejectedBy) {
        LaureatDTO result = laureatService.rejectLaureat(id, dto, rejectedBy);
        return ResponseEntity.ok(result);
    }
}

