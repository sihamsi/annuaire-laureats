package com.example.demo.entity;

public enum MotifRejet {
    PROMOTION_INCORRECTE("Promotion incorrecte"),
    FILIERE_INCORRECTE("Filière incorrecte"),
    COMPTE_EXISTANT("Compte existant"),
    NOM_PRENOM_INCORRECT("Nom/Prénom incorrect"),
    NON_LAUREAT("Non-lauréat");

    private final String libelle;

    MotifRejet(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }

    public static MotifRejet fromLibelle(String libelle) {
        for (MotifRejet motif : values()) {
            if (motif.libelle.equals(libelle)) {
                return motif;
            }
        }
        throw new IllegalArgumentException("Motif de rejet non valide: " + libelle);
    }
}
