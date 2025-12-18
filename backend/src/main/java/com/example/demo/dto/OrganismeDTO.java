package com.example.demo.dto;

import lombok.Data;

@Data
public class OrganismeDTO {
    private Integer id;
    private String nom;
    private String secteur;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer provinceId;
    private String provinceNom;
}

