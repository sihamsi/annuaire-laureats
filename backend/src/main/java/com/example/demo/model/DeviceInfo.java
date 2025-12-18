package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "device_info")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceInfo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "laureat_id", nullable = false)
    private Laureat laureat;
    
    @Column(name = "imei", unique = true, length = 50)
    private String imei;
    
    @Column(name = "device_model", length = 100)
    private String deviceModel;
    
    @Column(name = "os_version", length = 50)
    private String osVersion;
    
    @Column(name = "app_version", length = 20)
    private String appVersion;
    
    @Column(name = "last_seen")
    private LocalDateTime lastSeen;
    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

