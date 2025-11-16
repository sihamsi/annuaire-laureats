package com.example.demo.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.Organisme;

@Service
public class OrganismeService {

    private List<Organisme> organismes = new ArrayList<>();
    private Long nextId = 1L;

    public List<Organisme> getAll() {
        return organismes;
    }

    public Organisme create(Organisme organisme) {
        organisme.setId(nextId++);
        organismes.add(organisme);
        return organisme;
    }

    public Organisme update(Long id, Organisme updated) {
        for (Organisme org : organismes) {
            if (org.getId().equals(id)) {
                org.setNom(updated.getNom());
                org.setAdresse(updated.getAdresse());
                org.setEmail(updated.getEmail());
                return org;
            }
        }
        return null;
    }

    public boolean delete(Long id) {
        return organismes.removeIf(org -> org.getId().equals(id));
    }
}


