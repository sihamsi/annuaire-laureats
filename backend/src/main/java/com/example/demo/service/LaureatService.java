package com.example.demo.service;

import com.example.demo.entity.Laureat;
import com.example.demo.repository.LaureatRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LaureatService {

    private final LaureatRepository repository;

    public LaureatService(LaureatRepository repository) {
        this.repository = repository;
    }

    public Laureat addLaureat(Laureat laureat) {
        return repository.save(laureat);
    }

    public List<Laureat> getAllLaureats() {
        return repository.findAll();
    }

    public Laureat getById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Laureat non trouvé"));
    }

    public Laureat updateLaureat(Long id, Laureat updated) {
        Laureat existing = getById(id);
        existing.setNom(updated.getNom());
        existing.setPrenom(updated.getPrenom());
        existing.setFiliere(updated.getFiliere());
        existing.setStatut(updated.getStatut());
        return repository.save(existing);
    }

    public void deleteLaureat(Long id) {
        repository.deleteById(id);
    }

    public Laureat changeStatut(Long id, String statut) {
        Laureat existing = getById(id);
        existing.setStatut(statut);
        return repository.save(existing);
    }
}
