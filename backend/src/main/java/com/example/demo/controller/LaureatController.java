package com.example.demo.controller;

import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/laureats")
public class LaureatController {

    private List<Map<String, String>> laureats = new ArrayList<>(
            Arrays.asList(
                    Map.of("id", "1", "nom", "Hassan", "filiere", "Géoinfo"),
                    Map.of("id", "2", "nom", "Siham", "filiere", "Géotechnique")));

    @GetMapping
    public List<Map<String, String>> getAllLaureats() {
        return laureats;
    }

    @GetMapping("/{id}")
    public Map<String, String> getLaureatById(@PathVariable String id) {
        return laureats.stream()
                .filter(l -> l.get("id").equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Laureat non trouvé"));
    }
}
