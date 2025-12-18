package com.example.demo.model;

import com.example.demo.model.enums.UserRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "utilisateur")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Utilisateur {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "username", unique = true, nullable = false, length = 150)
    private String username;
    
    @Column(name = "password_hash", nullable = false, columnDefinition = "TEXT")
    private String passwordHash;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 255)
    private UserRole role;
    
    @Column(name = "email", unique = true, length = 255)
    private String email;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laureat_id")
    private Laureat laureat;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "last_login")
    private LocalDateTime lastLogin;
}

