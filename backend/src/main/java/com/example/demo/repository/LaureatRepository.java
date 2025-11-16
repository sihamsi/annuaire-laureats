package com.example.demo.repository;

import com.example.demo.entity.Laureat;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class LaureatRepository {

    private final List<Laureat> laureats = new ArrayList<>();
    private Long currentId = 1L;

    public Laureat save(Laureat laureat) {
        if (laureat.getId() == null) {
            laureat.setId(currentId++);
        } else {
            // Si l'objet existe déjà, on le remplace
            deleteById(laureat.getId());
        }
        laureats.add(laureat);
        return laureat;
    }

    public List<Laureat> findAll() {
        return laureats;
    }

    public Optional<Laureat> findById(Long id) {
        return laureats.stream()
                .filter(l -> l.getId().equals(id))
                .findFirst();
    }

    public void deleteById(Long id) {
        laureats.removeIf(l -> l.getId().equals(id));
    }
}
