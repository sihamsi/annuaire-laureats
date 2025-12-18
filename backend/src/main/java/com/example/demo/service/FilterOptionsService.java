package com.example.demo.service;

import com.example.demo.dto.FilterOptionsDTO;
import com.example.demo.dto.OrganismeOptionDTO;
import com.example.demo.dto.ProvinceOptionDTO;
import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.model.enums.SecteurType;
import com.example.demo.repository.LaureatRepository;
import com.example.demo.repository.OrganismeRepository;
import com.example.demo.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FilterOptionsService {
    
    private final ProvinceRepository provinceRepository;
    private final OrganismeRepository organismeRepository;
    private final LaureatRepository laureatRepository;
    
    @Transactional(readOnly = true)
    public FilterOptionsDTO getFilterOptions() {
        FilterOptionsDTO options = new FilterOptionsDTO();
        
        // Provinces
        options.setProvinces(
                provinceRepository.findAll().stream()
                        .map(p -> new ProvinceOptionDTO(p.getId(), p.getNom()))
                        .collect(Collectors.toList())
        );
        
        // Organismes
        options.setOrganismes(
                organismeRepository.findAll().stream()
                        .map(o -> new OrganismeOptionDTO(o.getId(), o.getNom(), o.getSecteur().name()))
                        .collect(Collectors.toList())
        );
        
        // Promotions (distinctes depuis la base)
        List<String> promotions = laureatRepository.findAll().stream()
                .map(l -> l.getPromotion())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        options.setPromotions(promotions);
        
        // Filières
        options.setFilieres(
                Arrays.stream(FiliereType.values())
                        .map(Enum::name)
                        .collect(Collectors.toList())
        );
        
        // Secteurs
        options.setSecteurs(
                Arrays.stream(SecteurType.values())
                        .map(Enum::name)
                        .collect(Collectors.toList())
        );
        
        // Genres
        options.setGenres(
                Arrays.stream(GenreType.values())
                        .map(Enum::name)
                        .collect(Collectors.toList())
        );
        
        // Statuts
        options.setStatuts(
                Arrays.stream(InscriptionStatus.values())
                        .map(Enum::name)
                        .collect(Collectors.toList())
        );
        
        return options;
    }
}

