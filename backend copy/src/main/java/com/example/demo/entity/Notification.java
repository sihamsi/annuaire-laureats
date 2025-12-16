package com.example.demo.model;

import java.time.LocalDateTime;

public class Notification {
    private Long id;
    private Long laureatId;
    private String message;
    private LocalDateTime dateEnvoi;

    public Notification() {}

    public Notification(Long id, Long laureatId, String message, LocalDateTime dateEnvoi) {
        this.id = id;
        this.laureatId = laureatId;
        this.message = message;
        this.dateEnvoi = dateEnvoi;
    }

    // Getters / Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getLaureatId() { return laureatId; }
    public void setLaureatId(Long laureatId) { this.laureatId = laureatId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getDateEnvoi() { return dateEnvoi; }
    public void setDateEnvoi(LocalDateTime dateEnvoi) { this.dateEnvoi = dateEnvoi; }
}
