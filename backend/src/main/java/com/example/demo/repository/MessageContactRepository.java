package com.example.demo.repository;

import com.example.demo.entity.MessageContact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MessageContactRepository extends JpaRepository<MessageContact, Long> {
}
