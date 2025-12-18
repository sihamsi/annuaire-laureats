package com.example.demo.converter;

import com.example.demo.entity.SecteurType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SecteurTypeConverter implements AttributeConverter<SecteurType, String> {

    @Override
    public String convertToDatabaseColumn(SecteurType secteur) {
        if (secteur == null) {
            return null;
        }
        // Map Java enum to database value
        return secteur.getDbValue();
    }

    @Override
    public SecteurType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        // Map database value to Java enum
        return SecteurType.fromDbValue(dbData);
    }
}