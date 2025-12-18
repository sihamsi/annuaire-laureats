package com.example.demo.controller;

import com.example.demo.dto.ProvinceOptionDTO;
import com.example.demo.model.Province;
import com.example.demo.service.ProvinceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/provinces")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
@Tag(name = "Provinces", description = "API pour la gestion des provinces")
public class ProvinceController {
    
    private final ProvinceService provinceService;
    
    @GetMapping
    @Operation(summary = "Récupérer toutes les provinces")
    public ResponseEntity<List<Province>> getAllProvinces() {
        List<Province> provinces = provinceService.getAllProvinces();
        return ResponseEntity.ok(provinces);
    }
    
    @GetMapping("/options")
    @Operation(summary = "Récupérer les options de provinces pour les filtres")
    public ResponseEntity<List<ProvinceOptionDTO>> getProvinceOptions() {
        List<ProvinceOptionDTO> options = provinceService.getAllProvinceOptions();
        return ResponseEntity.ok(options);
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Récupérer une province par ID")
    public ResponseEntity<Province> getProvinceById(@PathVariable Integer id) {
        Province province = provinceService.getProvinceById(id);
        return ResponseEntity.ok(province);
    }
}

