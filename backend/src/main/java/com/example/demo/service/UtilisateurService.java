package com.example.demo.service;

import com.example.demo.dto.UtilisateurCreateDTO;
import com.example.demo.dto.UtilisateurDTO;
import com.example.demo.model.Laureat;
import com.example.demo.model.Utilisateur;
import com.example.demo.repository.LaureatRepository;
import com.example.demo.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UtilisateurService {
    
    private final UtilisateurRepository utilisateurRepository;
    private final LaureatRepository laureatRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional(readOnly = true)
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public Utilisateur getUtilisateurById(Integer id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'ID: " + id));
    }
    
    @Transactional
    public Utilisateur createUtilisateur(UtilisateurCreateDTO dto) {
        if (utilisateurRepository.existsByUsername(dto.getUsername())) {
            throw new RuntimeException("Le nom d'utilisateur existe déjà");
        }
        
        if (dto.getEmail() != null && utilisateurRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("L'email existe déjà");
        }
        
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setUsername(dto.getUsername());
        utilisateur.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        utilisateur.setRole(dto.getRole());
        utilisateur.setEmail(dto.getEmail());
        
        if (dto.getLaureatId() != null) {
            Laureat laureat = laureatRepository.findById(dto.getLaureatId())
                    .orElseThrow(() -> new RuntimeException("Lauréat non trouvé avec l'ID: " + dto.getLaureatId()));
            utilisateur.setLaureat(laureat);
        }
        
        return utilisateurRepository.save(utilisateur);
    }
    
    @Transactional(readOnly = true)
    public UtilisateurDTO convertToDTO(Utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setUsername(utilisateur.getUsername());
        dto.setRole(utilisateur.getRole());
        dto.setEmail(utilisateur.getEmail());
        if (utilisateur.getLaureat() != null) {
            dto.setLaureatId(utilisateur.getLaureat().getId());
        }
        dto.setCreatedAt(utilisateur.getCreatedAt());
        dto.setLastLogin(utilisateur.getLastLogin());
        return dto;
    }
}

