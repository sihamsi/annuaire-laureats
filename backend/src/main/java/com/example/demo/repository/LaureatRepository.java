package com.example.demo.repository;

import com.example.demo.entity.Laureat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LaureatRepository extends JpaRepository<Laureat, Long> {
}
