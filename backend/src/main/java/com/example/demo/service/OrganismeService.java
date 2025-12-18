package com.example.demo.service;

import com.example.demo.dto.OrganismeCreateDTO;
import com.example.demo.dto.OrganismeDTO;
import com.example.demo.dto.OrganismeOptionDTO;
import com.example.demo.model.Organisme;
import com.example.demo.model.Province;
import com.example.demo.repository.OrganismeRepository;
import com.example.demo.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganismeService {
    
    private final OrganismeRepository organismeRepository;
    private final ProvinceRepository provinceRepository;
    
    @Transactional(readOnly = true)
    public List<Organisme> getAllOrganismes() {
        return organismeRepository.findAllWithProvince();
    }
    
    @Transactional(readOnly = true)
    public List<OrganismeOptionDTO> getAllOrganismeOptions() {
        return organismeRepository.findAll().stream()
                .map(o -> new OrganismeOptionDTO(o.getId(), o.getNom(), o.getSecteur().name()))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Organisme getOrganismeById(Integer id) {
        return organismeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organisme non trouvé avec l'ID: " + id));
    }
    
    @Transactional
    public OrganismeDTO createOrganisme(OrganismeCreateDTO dto) {
        Organisme organisme = new Organisme();
        organisme.setNom(dto.getNom());
        organisme.setSecteur(dto.getSecteur());
        organisme.setAddress(dto.getAddress());
        organisme.setLatitude(dto.getLatitude());
        organisme.setLongitude(dto.getLongitude());
        
        // La colonne location est générée automatiquement par PostgreSQL
        // à partir de latitude et longitude, donc on ne la définit pas manuellement
        
        // Définir la province si fournie
        if (dto.getProvinceId() != null) {
            Province province = provinceRepository.findById(dto.getProvinceId())
                    .orElseThrow(() -> new RuntimeException("Province non trouvée avec l'ID: " + dto.getProvinceId()));
            organisme.setProvince(province);
        }
        
        Organisme saved = organismeRepository.save(organisme);
        return convertToDTO(saved);
    }
    
    @Transactional
    public OrganismeDTO updateOrganisme(Integer id, OrganismeCreateDTO dto) {
        Organisme organisme = getOrganismeById(id);
        organisme.setNom(dto.getNom());
        organisme.setSecteur(dto.getSecteur());
        organisme.setAddress(dto.getAddress());
        organisme.setLatitude(dto.getLatitude());
        organisme.setLongitude(dto.getLongitude());
        
        // La colonne location est générée automatiquement par PostgreSQL
        // à partir de latitude et longitude, donc on ne la définit pas manuellement
        
        if (dto.getProvinceId() != null) {
            Province province = provinceRepository.findById(dto.getProvinceId())
                    .orElseThrow(() -> new RuntimeException("Province non trouvée avec l'ID: " + dto.getProvinceId()));
            organisme.setProvince(province);
        }
        
        Organisme saved = organismeRepository.save(organisme);
        return convertToDTO(saved);
    }
    
    @Transactional
    public void deleteOrganisme(Integer id) {
        organismeRepository.deleteById(id);
    }
    
    @Transactional(readOnly = true)
    public OrganismeDTO convertToDTO(Organisme organisme) {
        OrganismeDTO dto = new OrganismeDTO();
        dto.setId(organisme.getId());
        dto.setNom(organisme.getNom());
        dto.setSecteur(organisme.getSecteur().name());
        dto.setAddress(organisme.getAddress());
        dto.setLatitude(organisme.getLatitude());
        dto.setLongitude(organisme.getLongitude());
        
        // Charger la province de manière sécurisée
        try {
            Province province = organisme.getProvince();
            if (province != null) {
                dto.setProvinceId(province.getId());
                dto.setProvinceNom(province.getNom());
            }
        } catch (Exception e) {
            // Si la province n'est pas chargée (LAZY), on ignore
            dto.setProvinceId(null);
            dto.setProvinceNom(null);
        }
        
        return dto;
    }
}

