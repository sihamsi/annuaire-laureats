package com.example.demo.converter;

import com.example.demo.entity.FiliereType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class FiliereTypeConverter implements AttributeConverter<FiliereType, String> {

    @Override
    public String convertToDatabaseColumn(FiliereType filiere) {
        if (filiere == null) {
            return null;
        }
        return filiere.getDbValue();
    }

    @Override
    public FiliereType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return FiliereType.fromDbValue(dbData); 
    }
}