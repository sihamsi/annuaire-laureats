package com.example.demo.controller;

import com.example.demo.repository.LaureatRepository;
import com.example.demo.repository.ProvinceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/dropdowns")
public class DropdownController {

    private final LaureatRepository laureatRepository;
    private final ProvinceRepository provinceRepository;

    public DropdownController(LaureatRepository laureatRepository, ProvinceRepository provinceRepository) {
        this.laureatRepository = laureatRepository;
        this.provinceRepository = provinceRepository;
    }

    @GetMapping("/filieres")
    public List<String> filieres() {
        return laureatRepository.findAll().stream()
                .map(l -> l.getFiliere())
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @GetMapping("/promotions")
    public List<String> promotions() {
        return laureatRepository.findAll().stream()
                .map(l -> l.getPromotion())
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @GetMapping("/organismes")
    public List<String> organismes() {
        return laureatRepository.findAll().stream()
                .map(l -> l.getOrganisme())
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @GetMapping("/provinces")
    public List<String> provinces() {
        // ✅ on retourne la liste des noms (pas besoin de geometry ici)
        return provinceRepository.findAll().stream()
                .map(p -> p.getNom())
                .filter(s -> s != null && !s.isBlank())
                .distinct()
                .sorted()
                .toList();
    }
}
