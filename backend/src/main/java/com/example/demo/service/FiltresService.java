package com.example.demo.service;

import com.example.demo.repository.LaureatRepository;
import com.example.demo.repository.ProvinceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class FiltresService {

    private final LaureatRepository laureatRepository;
    private final ProvinceRepository provinceRepository;

    public FiltresService(LaureatRepository laureatRepository, ProvinceRepository provinceRepository) {
        this.laureatRepository = laureatRepository;
        this.provinceRepository = provinceRepository;
    }

    public List<String> getFilieres() {
        return laureatRepository.findDistinctFilieres();
    }

    public List<String> getPromotions() {
        return laureatRepository.findDistinctPromotions();
    }

    public List<String> getSecteurs() {
        return laureatRepository.findDistinctSecteurs();
    }

    public List<String> getProvinces() {
        return provinceRepository.findAllProvinceNames();
    }

    public Map<String, Object> getAllFiltres() {
        return Map.of(
                "filieres", getFilieres(),
                "promotions", getPromotions(),
                "secteurs", getSecteurs(),
                "provinces", getProvinces());
    }
}
