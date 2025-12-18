package com.example.demo.exception;

import jakarta.validation.ConstraintViolationException;
import org.hibernate.LazyInitializationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException e) {
        Map<String, Object> response = new HashMap<>();
        Map<String, String> errors = new HashMap<>();
        
        e.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        response.put("error", "Erreur de validation");
        response.put("message", "Les données fournies ne sont pas valides");
        response.put("errors", errors);
        response.put("type", "ValidationException");
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Erreur de format JSON");
        response.put("message", "Le JSON fourni est invalide ou contient des erreurs. " + 
                   (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()));
        response.put("type", "HttpMessageNotReadableException");
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
    
    @ExceptionHandler(LazyInitializationException.class)
    public ResponseEntity<Map<String, Object>> handleLazyInitializationException(LazyInitializationException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Erreur de chargement des données");
        response.put("message", "Impossible de charger les relations. Vérifiez la configuration des transactions.");
        response.put("type", "LazyInitializationException");
        response.put("details", e.getMessage());
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Erreur serveur");
        response.put("message", e.getMessage());
        response.put("type", e.getClass().getSimpleName());
        response.put("details", getStackTrace(e));
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception e) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Erreur inattendue");
        response.put("message", e.getMessage());
        response.put("type", e.getClass().getSimpleName());
        response.put("details", getStackTrace(e));
        
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    private String getStackTrace(Exception e) {
        StringBuilder sb = new StringBuilder();
        sb.append(e.getClass().getName()).append(": ").append(e.getMessage()).append("\n");
        for (StackTraceElement element : e.getStackTrace()) {
            if (element.getClassName().startsWith("com.example.demo")) {
                sb.append("  at ").append(element.toString()).append("\n");
            }
        }
        return sb.toString();
    }
}

