package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum SecteurType {
    PUBLIC("public"), // Java constant: PUBLIC, Database value: "public"
    PRIVE("prive"); // Java constant: PRIVE, Database value: "prive"

    private final String dbValue;

    SecteurType(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    public static SecteurType fromDbValue(String dbValue) {
        for (SecteurType type : values()) {
            if (type.dbValue.equalsIgnoreCase(dbValue)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Valeur non valide pour SecteurType: " + dbValue);
    }

    @JsonCreator
    public static SecteurType fromString(String value) {
        if (value == null) {
            return null;
        }
        return fromDbValue(value.toLowerCase().trim());
    }
}