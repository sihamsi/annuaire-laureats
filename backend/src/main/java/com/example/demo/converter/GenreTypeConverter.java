package com.example.demo.converter;

import com.example.demo.entity.GenreType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class GenreTypeConverter implements AttributeConverter<GenreType, String> {

    @Override
    public String convertToDatabaseColumn(GenreType genre) {
        if (genre == null) {
            return null;
        }
        return genre.getDbValue();
    }

    @Override
    public GenreType convertToEntityAttribute(String dbData) {
        if (dbData == null) {
            return null;
        }
        return GenreType.fromDbValue(dbData);
    }
}