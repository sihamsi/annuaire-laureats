package com.example.demo.controller;

import com.example.demo.dto.OrganismeCreateDTO;
import com.example.demo.dto.OrganismeDTO;
import com.example.demo.dto.OrganismeOptionDTO;
import com.example.demo.model.Organisme;
import com.example.demo.service.OrganismeService;
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
@RequestMapping("/api/organismes")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Organismes", description = "API pour la gestion des organismes")
public class OrganismeController {
    
    private final OrganismeService organismeService;
    
    @GetMapping
    @Operation(summary = "Récupérer tous les organismes")
    public ResponseEntity<List<OrganismeDTO>> getAllOrganismes() {
        List<Organisme> organismes = organismeService.getAllOrganismes();
        List<OrganismeDTO> dtos = organismes.stream()
                .map(organismeService::convertToDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
    
    @GetMapping("/options")
    @Operation(summary = "Récupérer les options d'organismes pour les filtres")
    public ResponseEntity<List<OrganismeOptionDTO>> getOrganismeOptions() {
        List<OrganismeOptionDTO> options = organismeService.getAllOrganismeOptions();
        return ResponseEntity.ok(options);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer un organisme par ID")
    public ResponseEntity<OrganismeDTO> getOrganismeById(@PathVariable Integer id) {
        Organisme organisme = organismeService.getOrganismeById(id);
        return ResponseEntity.ok(organismeService.convertToDTO(organisme));
    }
    
    @PostMapping
    @Operation(summary = "Créer un nouvel organisme")
    public ResponseEntity<OrganismeDTO> createOrganisme(@Valid @RequestBody OrganismeCreateDTO dto) {
        OrganismeDTO result = organismeService.createOrganisme(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Mettre à jour un organisme")
    public ResponseEntity<OrganismeDTO> updateOrganisme(
            @PathVariable Integer id,
            @Valid @RequestBody OrganismeCreateDTO dto) {
        OrganismeDTO result = organismeService.updateOrganisme(id, dto);
        return ResponseEntity.ok(result);
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un organisme")
    public ResponseEntity<Void> deleteOrganisme(@PathVariable Integer id) {
        organismeService.deleteOrganisme(id);
        return ResponseEntity.noContent().build();
    }
}

