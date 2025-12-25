package com.example.demo.repository;

import com.example.demo.entity.Laureat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface LaureatRepository extends JpaRepository<Laureat, Long>, JpaSpecificationExecutor<Laureat> {
}
