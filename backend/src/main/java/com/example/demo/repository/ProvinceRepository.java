package com.example.demo.repository;

import com.example.demo.model.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Integer> {
    Optional<Province> findByNom(String nom);
}

