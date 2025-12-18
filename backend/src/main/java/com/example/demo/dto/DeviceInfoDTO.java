package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DeviceInfoDTO {
    private Integer id;
    private Integer laureatId;
    private String imei;
    private String deviceModel;
    private String osVersion;
    private String appVersion;
    private LocalDateTime lastSeen;
    private LocalDateTime createdAt;
}

