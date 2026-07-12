package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum GenreType {
    homme("homme"),
    femme("femme");

    private final String dbValue;

    GenreType(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    public static GenreType fromDbValue(String dbValue) {
        for (GenreType type : values()) {
            if (type.dbValue.equalsIgnoreCase(dbValue)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Valeur non valide pour GenreType: " + dbValue);
    }

    @JsonCreator
    public static GenreType fromString(String value) {
        if (value == null) {
            return null;
        }
        return fromDbValue(value.toLowerCase().trim());
    }
}