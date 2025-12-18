package com.example.demo.service;

import com.example.demo.dto.ProvinceOptionDTO;
import com.example.demo.model.Province;
import com.example.demo.repository.ProvinceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProvinceService {
    
    private final ProvinceRepository provinceRepository;
    
    @Transactional(readOnly = true)
    public List<Province> getAllProvinces() {
        return provinceRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<ProvinceOptionDTO> getAllProvinceOptions() {
        return provinceRepository.findAll().stream()
                .map(p -> new ProvinceOptionDTO(p.getId(), p.getNom()))
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Province getProvinceById(Integer id) {
        return provinceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Province non trouvée avec l'ID: " + id));
    }
    
    @Transactional
    public Province createProvince(Province province) {
        return provinceRepository.save(province);
    }
}

