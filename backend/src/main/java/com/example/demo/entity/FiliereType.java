package com.example.demo.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum FiliereType {
    SIG("sig"),
    GI("gi"),
    IHE("ihe"),
    IVE("ive"),
    MaterialSE("materialse"),
    MathSE("mathse"),
    GC("gc"),
    GE("ge"),
    GLT("glt"),
    MET("met");

    private final String dbValue;

    FiliereType(String dbValue) {
        this.dbValue = dbValue;
    }

    @JsonValue
    public String getDbValue() {
        return dbValue;
    }

    public static FiliereType fromDbValue(String dbValue) {
        for (FiliereType type : values()) {
            if (type.dbValue.equalsIgnoreCase(dbValue)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Valeur non valide pour FiliereType: " + dbValue);
    }

    // Pour la désérialisation JSON
    @JsonCreator
    public static FiliereType fromString(String value) {
        if (value == null)
            return null;
        return fromDbValue(value.toLowerCase().trim());
    }
}