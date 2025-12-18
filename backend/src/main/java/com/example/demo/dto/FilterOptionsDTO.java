package com.example.demo.dto;

import lombok.Data;

import java.util.List;

@Data
public class FilterOptionsDTO {
    private List<ProvinceOptionDTO> provinces;
    private List<OrganismeOptionDTO> organismes;
    private List<String> promotions;
    private List<String> filieres;
    private List<String> secteurs;
    private List<String> genres;
    private List<String> statuts;
}

