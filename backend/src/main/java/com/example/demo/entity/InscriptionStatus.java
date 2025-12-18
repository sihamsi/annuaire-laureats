package com.example.demo.entity;

public enum InscriptionStatus {
    PENDING("pending"),
    PUBLISHED("published"),
    REJECTED("rejected");

    private final String dbValue;

    InscriptionStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String getDbValue() {
        return dbValue;
    }

    public static InscriptionStatus fromDbValue(String dbValue) {
        for (InscriptionStatus status : values()) {
            if (status.dbValue.equals(dbValue)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Valeur non valide pour InscriptionStatus: " + dbValue);
    }
}