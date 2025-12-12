package com.example.demo.entity;

public enum GenreType {
    homme("homme"),
    femme("femme");

    private final String dbValue;

    GenreType(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static GenreType fromDbValue(String dbValue) {
        for (GenreType type : values()) {
            if (type.dbValue.equals(dbValue)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Valeur non valide pour GenreType: " + dbValue);
    }
}