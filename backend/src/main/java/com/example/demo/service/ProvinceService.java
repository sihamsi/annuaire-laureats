package com.example.demo.service;

import com.example.demo.repository.ProvinceRepository;
import org.springframework.stereotype.Service;

@Service
public class ProvinceService {

    private final ProvinceRepository provinceRepository;

    public ProvinceService(ProvinceRepository provinceRepository) {
        this.provinceRepository = provinceRepository;
    }

    public String findProvinceNameByLatLon(Double lat, Double lon) {
        if (lat == null || lon == null) return null;

        String name = provinceRepository.findProvinceNameByPoint(lat, lon);

        // tu peux renvoyer null ou un texte par défaut
        return name != null ? name : null;
    }
}
