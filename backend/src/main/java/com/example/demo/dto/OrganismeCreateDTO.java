package com.example.demo.dto;

import com.example.demo.model.enums.SecteurType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrganismeCreateDTO {
    
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;
    
    @NotNull(message = "Le secteur est obligatoire")
    private SecteurType secteur;
    
    private String address;
    
    private Double latitude;
    
    private Double longitude;
    
    private Integer provinceId;
}

