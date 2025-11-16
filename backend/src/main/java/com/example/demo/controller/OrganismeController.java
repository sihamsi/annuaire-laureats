package com.example.demo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.Organisme;
import com.example.demo.service.OrganismeService;

@RestController
@RequestMapping("/api/organismes")
@CrossOrigin(origins = "*")
public class OrganismeController {

    private final OrganismeService service;

    public OrganismeController(OrganismeService service) {
        this.service = service;
    }

    @GetMapping
    public List<Organisme> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Organisme create(@RequestBody Organisme organisme) {
        return service.create(organisme);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Organisme> update(@PathVariable Long id, @RequestBody Organisme organisme) {
        Organisme updated = service.update(id, organisme);
        if(updated != null) return ResponseEntity.ok(updated);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        boolean deleted = service.delete(id);
        if(deleted) return ResponseEntity.ok().build();
        return ResponseEntity.notFound().build();
    }
}
