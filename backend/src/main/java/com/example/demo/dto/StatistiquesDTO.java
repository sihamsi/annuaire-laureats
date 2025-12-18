package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatistiquesDTO {
    private Long totalLaureats;
    private Long publies;
    private Long enAttente;
    private Long rejetes;
    private Long secteurPublic;
    private Long secteurPrive;
    private Map<String, Long> parFiliere;
    private Map<String, Long> parPromotion;
    private Map<String, Long> parGenre;
    private Map<String, Long> parProvince;
}

