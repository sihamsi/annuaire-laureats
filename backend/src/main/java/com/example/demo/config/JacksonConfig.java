package com.example.demo.config;

import com.example.demo.model.enums.*;
import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.module.SimpleModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.util.List;

@Configuration
public class JacksonConfig implements WebMvcConfigurer {
    
    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        converters.add(0, mappingJackson2HttpMessageConverter());
    }
    
    @Bean
    @Primary
    public MappingJackson2HttpMessageConverter mappingJackson2HttpMessageConverter() {
        MappingJackson2HttpMessageConverter converter = new MappingJackson2HttpMessageConverter();
        converter.setObjectMapper(objectMapper());
        return converter;
    }
    
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        SimpleModule module = new SimpleModule("CaseInsensitiveEnumModule");
        
        // Deserializers pour les enums
        module.addDeserializer(SecteurType.class, new CaseInsensitiveEnumDeserializer<>(SecteurType.class));
        module.addDeserializer(GenreType.class, new CaseInsensitiveEnumDeserializer<>(GenreType.class));
        module.addDeserializer(FiliereType.class, new CaseInsensitiveEnumDeserializer<>(FiliereType.class));
        module.addDeserializer(InscriptionStatus.class, new CaseInsensitiveEnumDeserializer<>(InscriptionStatus.class));
        module.addDeserializer(UserRole.class, new CaseInsensitiveEnumDeserializer<>(UserRole.class));
        
        mapper.registerModule(module);
        
        return mapper;
    }
    
    private static class CaseInsensitiveEnumDeserializer<T extends Enum<T>> extends JsonDeserializer<T> {
        private final Class<T> enumClass;
        
        public CaseInsensitiveEnumDeserializer(Class<T> enumClass) {
            this.enumClass = enumClass;
        }
        
        @Override
        public T deserialize(JsonParser jsonParser, DeserializationContext context) throws IOException {
            String value = jsonParser.getText();
            if (value == null || value.trim().isEmpty()) {
                return null;
            }
            
            try {
                // Essayer d'abord avec la valeur exacte
                return Enum.valueOf(enumClass, value);
            } catch (IllegalArgumentException e) {
                // Si ça échoue, essayer en majuscules
                try {
                    return Enum.valueOf(enumClass, value.toUpperCase().trim());
                } catch (IllegalArgumentException e2) {
                    throw new IOException("Valeur invalide pour " + enumClass.getSimpleName() + 
                        ": '" + value + "'. Valeurs acceptées: " + 
                        java.util.Arrays.toString(enumClass.getEnumConstants()), e2);
                }
            }
        }
    }
}
