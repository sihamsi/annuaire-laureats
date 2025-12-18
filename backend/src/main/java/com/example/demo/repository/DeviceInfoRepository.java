package com.example.demo.repository;

import com.example.demo.model.DeviceInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceInfoRepository extends JpaRepository<DeviceInfo, Integer> {
    Optional<DeviceInfo> findByImei(String imei);
    Optional<DeviceInfo> findByLaureatId(Integer laureatId);
    List<DeviceInfo> findByLaureatIdOrderByLastSeenDesc(Integer laureatId);
}

