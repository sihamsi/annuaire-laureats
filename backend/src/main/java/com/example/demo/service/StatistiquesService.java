package com.example.demo.service;

import com.example.demo.dto.StatistiquesDTO;
import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.model.enums.SecteurType;
import com.example.demo.repository.LaureatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class StatistiquesService {
    
    private final LaureatRepository laureatRepository;
    
    @Transactional(readOnly = true)
    public StatistiquesDTO getStatistiques() {
        StatistiquesDTO stats = new StatistiquesDTO();
        
        stats.setTotalLaureats(laureatRepository.count());
        stats.setPublies(laureatRepository.countByStatus(InscriptionStatus.PUBLISHED));
        stats.setEnAttente(laureatRepository.countByStatus(InscriptionStatus.PENDING));
        stats.setRejetes(laureatRepository.countByStatus(InscriptionStatus.REJECTED));
        stats.setSecteurPublic(laureatRepository.countBySecteur(SecteurType.PUBLIC));
        stats.setSecteurPrive(laureatRepository.countBySecteur(SecteurType.PRIVE));
        
        // Statistiques par filière
        Map<String, Long> parFiliere = new HashMap<>();
        for (FiliereType filiere : FiliereType.values()) {
            parFiliere.put(filiere.name(), laureatRepository.countByFiliere(filiere));
        }
        stats.setParFiliere(parFiliere);
        
        return stats;
    }
}

