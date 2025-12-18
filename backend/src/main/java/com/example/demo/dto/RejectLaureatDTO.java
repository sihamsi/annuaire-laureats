package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RejectLaureatDTO {
    
    @NotBlank(message = "Le motif de rejet est obligatoire")
    private String motifRejet;
}

