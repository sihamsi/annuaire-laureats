package com.example.demo.model;

import com.example.demo.model.enums.InscriptionStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laureat_id", nullable = false)
    private Laureat laureat;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 255)
    private InscriptionStatus oldStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 255)
    private InscriptionStatus newStatus;
    
    @Column(name = "motif", columnDefinition = "TEXT")
    private String motif;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "changed_by")
    private Utilisateur changedBy;
    
    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private LocalDateTime changedAt;
}

