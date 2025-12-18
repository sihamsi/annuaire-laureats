package com.example.demo.controller;

import com.example.demo.dto.UtilisateurCreateDTO;
import com.example.demo.dto.UtilisateurDTO;
import com.example.demo.model.Utilisateur;
import com.example.demo.service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Utilisateurs", description = "API pour la gestion des utilisateurs")
public class UtilisateurController {
    
    private final UtilisateurService utilisateurService;
    
    @GetMapping
    @Operation(summary = "Récupérer tous les utilisateurs")
    public ResponseEntity<List<UtilisateurDTO>> getAllUtilisateurs() {
        List<Utilisateur> utilisateurs = utilisateurService.getAllUtilisateurs();
        List<UtilisateurDTO> dtos = utilisateurs.stream()
                .map(utilisateurService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un utilisateur par ID")
    public ResponseEntity<UtilisateurDTO> getUtilisateurById(@PathVariable Integer id) {
        Utilisateur utilisateur = utilisateurService.getUtilisateurById(id);
        return ResponseEntity.ok(utilisateurService.convertToDTO(utilisateur));
    }
    
    @PostMapping
    @Operation(summary = "Créer un nouvel utilisateur")
    public ResponseEntity<UtilisateurDTO> createUtilisateur(@Valid @RequestBody UtilisateurCreateDTO dto) {
        Utilisateur utilisateur = utilisateurService.createUtilisateur(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(utilisateurService.convertToDTO(utilisateur));
    }
}

