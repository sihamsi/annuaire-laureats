package com.example.demo.service;

import java.util.*;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import com.example.demo.model.Laureat;

@Service
public class StatsService {

    private List<Laureat> laureats = new ArrayList<>();

    public StatsService() {
        // Données statiques pour test
        laureats.add(new Laureat(1L, "Ali", "Ben", "Informatique", "2024", "public", "H", "Casablanca"));
        laureats.add(new Laureat(2L, "Sara", "El", "Génie Civil", "2023", "prive", "F", "Rabat"));
        laureats.add(new Laureat(3L, "Youssef", "M", "Informatique", "2024", "prive", "H", "Casablanca"));
        laureats.add(new Laureat(4L, "Leila", "K", "Architecture", "2023", "public", "F", "Fès"));
        // Ajoute autant que tu veux
    }

    public Map<String, Long> getStatsByFiliere() {
        return laureats.stream().collect(Collectors.groupingBy(Laureat::getFiliere, Collectors.counting()));
    }

    public Map<String, Long> getStatsByPromotion() {
        return laureats.stream().collect(Collectors.groupingBy(Laureat::getPromotion, Collectors.counting()));
    }

    public Map<String, Long> getStatsBySecteur() {
        return laureats.stream().collect(Collectors.groupingBy(Laureat::getSecteur, Collectors.counting()));
    }

    public Map<String, Long> getStatsByGenre() {
        return laureats.stream().collect(Collectors.groupingBy(Laureat::getGenre, Collectors.counting()));
    }

    public Map<String, Long> getStatsByProvince() {
        return laureats.stream().collect(Collectors.groupingBy(Laureat::getProvince, Collectors.counting()));
    }
}
