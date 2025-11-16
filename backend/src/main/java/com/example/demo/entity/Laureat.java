// src/main/java/com/example/demo/entity/Laureat.java
package com.example.demo.entity;

import lombok.Data;

@Data
public class Laureat {
    private Long id;
    private String nom;
    private String prenom;
    private String filiere;
    private String statut; // en_attente, valide, rejete
}
