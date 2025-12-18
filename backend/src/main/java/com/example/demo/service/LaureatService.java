package com.example.demo.service;

import com.example.demo.dto.*;
import com.example.demo.model.*;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaureatService {
    
    private final LaureatRepository laureatRepository;
    private final OrganismeRepository organismeRepository;
    private final ProvinceRepository provinceRepository;
    private final DeviceInfoRepository deviceInfoRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    
    @Transactional
    public LaureatDTO createLaureat(LaureatCreateDTO dto) {
        // Vérifier si l'email existe déjà
        if (laureatRepository.findByEmail(dto.getEmail()).isPresent()) {
            throw new RuntimeException("Un lauréat avec cet email existe déjà");
        }
        
        Laureat laureat = new Laureat();
        laureat.setPrenom(dto.getPrenom());
        laureat.setNom(dto.getNom());
        
        // Conversion sécurisée des enums
        if (dto.getGenre() != null) {
            try {
                laureat.setGenre(dto.getGenre());
            } catch (Exception e) {
                throw new RuntimeException("Genre invalide: " + dto.getGenre(), e);
            }
        }
        
        laureat.setTelephone(dto.getTelephone());
        laureat.setEmail(dto.getEmail());
        laureat.setPhotoUrl(dto.getPhotoUrl());
        laureat.setPromotion(dto.getPromotion());
        
        // Conversion sécurisée de la filière
        if (dto.getFiliere() != null) {
            try {
                laureat.setFiliere(dto.getFiliere());
            } catch (Exception e) {
                throw new RuntimeException("Filière invalide: " + dto.getFiliere(), e);
            }
        }
        
        // Conversion sécurisée du secteur
        if (dto.getSecteur() != null) {
            try {
                laureat.setSecteur(dto.getSecteur());
            } catch (Exception e) {
                throw new RuntimeException("Secteur invalide: " + dto.getSecteur() + " (type: " + 
                    dto.getSecteur().getClass().getName() + ")", e);
            }
        }
        laureat.setAutreOrganisme(dto.getAutreOrganisme());
        laureat.setDescription(dto.getDescription());
        laureat.setLatitude(dto.getLatitude());
        laureat.setLongitude(dto.getLongitude());
        laureat.setStatus(InscriptionStatus.PENDING);
        
        // La colonne location est générée automatiquement par PostgreSQL
        // à partir de latitude et longitude, donc on ne la définit pas manuellement
        
        // Définir l'organisme si fourni
        if (dto.getOrganismeId() != null) {
            Organisme organisme = organismeRepository.findById(dto.getOrganismeId())
                    .orElseThrow(() -> new RuntimeException("Organisme non trouvé avec l'ID: " + dto.getOrganismeId()));
            laureat.setOrganisme(organisme);
        }
        
        // La province sera définie automatiquement par le trigger PostgreSQL
        
        Laureat savedLaureat = laureatRepository.save(laureat);
        
        // Sauvegarder les informations du device si fournies
        if (dto.getImei() != null && !dto.getImei().isEmpty()) {
            DeviceInfo deviceInfo = new DeviceInfo();
            deviceInfo.setLaureat(savedLaureat);
            deviceInfo.setImei(dto.getImei());
            deviceInfo.setDeviceModel(dto.getDeviceModel());
            deviceInfo.setOsVersion(dto.getOsVersion());
            deviceInfo.setAppVersion(dto.getAppVersion());
            deviceInfoRepository.save(deviceInfo);
        }
        
        return convertToDTO(savedLaureat);
    }
    
    @Transactional(readOnly = true)
    public LaureatPageResponseDTO getLaureatsWithFilters(LaureatFilterDTO filter, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Laureat> laureatPage = laureatRepository.findWithFilters(
                filter.getFiliere(),
                filter.getPromotion(),
                filter.getSecteur(),
                filter.getGenre(),
                filter.getOrganismeId(),
                filter.getProvinceId(),
                filter.getStatus(),
                pageable
        );
        
        List<LaureatDTO> content = laureatPage.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        
        return new LaureatPageResponseDTO(
                content,
                laureatPage.getNumber(),
                laureatPage.getSize(),
                laureatPage.getTotalElements(),
                laureatPage.getTotalPages(),
                laureatPage.isFirst(),
                laureatPage.isLast()
        );
    }
    
    @Transactional(readOnly = true)
    public List<LaureatDTO> getLaureatsWithFiltersList(LaureatFilterDTO filter) {
        List<Laureat> laureats = laureatRepository.findWithFiltersList(
                filter.getFiliere(),
                filter.getPromotion(),
                filter.getSecteur(),
                filter.getGenre(),
                filter.getOrganismeId(),
                filter.getProvinceId(),
                filter.getStatus()
        );
        
        return laureats.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Laureat getLaureatById(Integer id) {
        return laureatRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lauréat non trouvé avec l'ID: " + id));
    }
    
    @Transactional
    public LaureatDTO updateLaureat(Integer id, LaureatUpdateDTO dto) {
        Laureat laureat = getLaureatById(id);
        
        if (dto.getPrenom() != null) laureat.setPrenom(dto.getPrenom());
        if (dto.getNom() != null) laureat.setNom(dto.getNom());
        if (dto.getGenre() != null) laureat.setGenre(dto.getGenre());
        if (dto.getTelephone() != null) laureat.setTelephone(dto.getTelephone());
        if (dto.getEmail() != null) laureat.setEmail(dto.getEmail());
        if (dto.getPhotoUrl() != null) laureat.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getPromotion() != null) laureat.setPromotion(dto.getPromotion());
        if (dto.getFiliere() != null) laureat.setFiliere(dto.getFiliere());
        if (dto.getSecteur() != null) laureat.setSecteur(dto.getSecteur());
        if (dto.getAutreOrganisme() != null) laureat.setAutreOrganisme(dto.getAutreOrganisme());
        if (dto.getDescription() != null) laureat.setDescription(dto.getDescription());
        
        if (dto.getLatitude() != null && dto.getLongitude() != null) {
            laureat.setLatitude(dto.getLatitude());
            laureat.setLongitude(dto.getLongitude());
            // La colonne location est générée automatiquement par PostgreSQL
            // à partir de latitude et longitude, donc on ne la définit pas manuellement
        }
        
        if (dto.getOrganismeId() != null) {
            Organisme organisme = organismeRepository.findById(dto.getOrganismeId())
                    .orElseThrow(() -> new RuntimeException("Organisme non trouvé avec l'ID: " + dto.getOrganismeId()));
            laureat.setOrganisme(organisme);
        }
        
        Laureat saved = laureatRepository.save(laureat);
        return convertToDTO(saved);
    }
    
    @Transactional
    public LaureatDTO validateLaureat(Integer id, Integer validatedByUserId) {
        Laureat laureat = getLaureatById(id);
        laureat.setStatus(InscriptionStatus.PUBLISHED);
        Laureat saved = laureatRepository.save(laureat);
        return convertToDTO(saved);
    }
    
    @Transactional
    public LaureatDTO rejectLaureat(Integer id, RejectLaureatDTO dto, Integer rejectedByUserId) {
        Laureat laureat = getLaureatById(id);
        laureat.setStatus(InscriptionStatus.REJECTED);
        laureat.setMotifRejet(dto.getMotifRejet());
        Laureat saved = laureatRepository.save(laureat);
        return convertToDTO(saved);
    }
    
    @Transactional(readOnly = true)
    public LaureatDTO convertToDTO(Laureat laureat) {
        LaureatDTO dto = new LaureatDTO();
        dto.setId(laureat.getId());
        dto.setPrenom(laureat.getPrenom());
        dto.setNom(laureat.getNom());
        dto.setGenre(laureat.getGenre());
        dto.setTelephone(laureat.getTelephone());
        dto.setEmail(laureat.getEmail());
        dto.setPhotoUrl(laureat.getPhotoUrl());
        dto.setPromotion(laureat.getPromotion());
        dto.setFiliere(laureat.getFiliere());
        dto.setSecteur(laureat.getSecteur());
        dto.setAutreOrganisme(laureat.getAutreOrganisme());
        dto.setLatitude(laureat.getLatitude());
        dto.setLongitude(laureat.getLongitude());
        dto.setDescription(laureat.getDescription());
        dto.setStatus(laureat.getStatus());
        dto.setMotifRejet(laureat.getMotifRejet());
        dto.setDateInscription(laureat.getDateInscription());
        dto.setDateValidation(laureat.getDateValidation());
        dto.setUpdatedAt(laureat.getUpdatedAt());
        
        // Charger l'organisme de manière sécurisée
        try {
            Organisme organisme = laureat.getOrganisme();
            if (organisme != null) {
                dto.setOrganismeId(organisme.getId());
                dto.setOrganismeNom(organisme.getNom());
            }
        } catch (Exception e) {
            dto.setOrganismeId(null);
            dto.setOrganismeNom(null);
        }
        
        // Charger la province de manière sécurisée
        try {
            Province province = laureat.getProvince();
            if (province != null) {
                dto.setProvinceId(province.getId());
                dto.setProvinceNom(province.getNom());
            }
        } catch (Exception e) {
            dto.setProvinceId(null);
            dto.setProvinceNom(null);
        }
        
        return dto;
    }
}

