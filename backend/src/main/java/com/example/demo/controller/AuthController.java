package com.example.demo.controller;

import com.example.demo.entity.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")

public class AuthController {

    private final UtilisateurRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public AuthController(UtilisateurRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/login")
    public Utilisateur login(@RequestBody Utilisateur req) {

        Utilisateur user = repo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!encoder.matches(req.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        user.setPassword(null); // ⚠️ IMPORTANT
        return user;
    }
}
