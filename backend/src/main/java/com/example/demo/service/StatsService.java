package com.example.demo.service;

import com.example.demo.repository.StatsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    private final StatsRepository statsRepository;

    public List<Map<String, Object>> byFiliere() {
        return statsRepository.statsByFiliere();
    }

    public List<Map<String, Object>> byPromotion() {
        return statsRepository.statsByPromotion();
    }

    public List<Map<String, Object>> bySecteur() {
        return statsRepository.statsBySecteur();
    }

    public List<Map<String, Object>> byGenre() {
        return statsRepository.statsByGenre();
    }

    public List<Map<String, Object>> byProvince() {
        return statsRepository.statsByProvince();
    }
}
