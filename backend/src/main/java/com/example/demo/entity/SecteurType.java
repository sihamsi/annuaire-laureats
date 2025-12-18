package com.example.demo.entity;

public enum SecteurType {
    PUBLIC("public"), 
    PRIVE("prive"); 

    private final String dbValue;

    SecteurType(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static SecteurType fromDbValue(String dbValue) {
        for (SecteurType type : values()) {
            if (type.dbValue.equals(dbValue)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Valeur non valide pour SecteurType: " + dbValue);
    }
}