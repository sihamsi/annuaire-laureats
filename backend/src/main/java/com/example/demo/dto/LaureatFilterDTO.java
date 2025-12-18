package com.example.demo.dto;

import com.example.demo.model.enums.FiliereType;
import com.example.demo.model.enums.GenreType;
import com.example.demo.model.enums.InscriptionStatus;
import com.example.demo.model.enums.SecteurType;
import lombok.Data;

@Data
public class LaureatFilterDTO {
    private FiliereType filiere;
    private String promotion;
    private SecteurType secteur;
    private GenreType genre;
    private Integer organismeId;
    private Integer provinceId;
    private InscriptionStatus status;
    private String search;
}

