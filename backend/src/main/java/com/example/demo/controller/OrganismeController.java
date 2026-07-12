package com.example.demo.controller;

import com.example.demo.entity.Organisme;
import com.example.demo.service.OrganismeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/organismes")
@CrossOrigin(origins = "*")
public class OrganismeController {

    private final OrganismeService organismeService;

    public OrganismeController(OrganismeService organismeService) {
        this.organismeService = organismeService;
    }

    // GET /api/organismes?secteur=public
    @GetMapping
    public ResponseEntity<List<Organisme>> getAll(
            @RequestParam(required = false) String secteur) {
        return ResponseEntity.ok(organismeService.getAllOrganismes(secteur));
    }

    // GET /api/organismes/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Organisme> getById(@PathVariable Long id) {
        return ResponseEntity.ok(organismeService.getById(id));
    }

    // POST /api/organismes
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Organisme organisme) {
        try {
            Organisme created = organismeService.create(organisme);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // PUT /api/organismes/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Organisme> update(
            @PathVariable Long id,
            @RequestBody Organisme organisme) {
        return ResponseEntity.ok(organismeService.update(id, organisme));
    }

    // DELETE /api/organismes/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        organismeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
