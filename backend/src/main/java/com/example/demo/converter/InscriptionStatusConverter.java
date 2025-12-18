package com.example.demo.converter;

import com.example.demo.entity.InscriptionStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class InscriptionStatusConverter implements AttributeConverter<InscriptionStatus, String> {

    @Override
    public String convertToDatabaseColumn(InscriptionStatus status) {
        if (status == null) {
            return null;
        }
        return status.getDbValue();
    }

    @Override
    public InscriptionStatus convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return InscriptionStatus.fromDbValue(dbData);
    }
}