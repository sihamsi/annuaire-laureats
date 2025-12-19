package com.example.demo.service;

import com.example.demo.entity.Organisme;
import com.example.demo.repository.OrganismeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganismeService {

    private final OrganismeRepository organismeRepository;

    // GET /api/organismes
    @Transactional(readOnly = true)
    public List<Organisme> getAllOrganismes(String secteur) {
        if (secteur != null && !secteur.isBlank()) {
            return organismeRepository.findBySecteur(secteur);
        }
        return organismeRepository.findAll();
    }

    // GET /api/organismes/{id}
    @Transactional(readOnly = true)
    public Organisme getById(Long id) {
        return organismeRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Organisme introuvable avec id: " + id));
    }

    // POST /api/organismes
    public Organisme create(Organisme organisme) {
        if (organismeRepository.existsByNomIgnoreCase(organisme.getNom())) {
            throw new IllegalArgumentException("Un organisme avec ce nom existe déjà");
        }
        return organismeRepository.save(organisme);
    }

    // PUT /api/organismes/{id}
    public Organisme update(Long id, Organisme updated) {
        Organisme existing = getById(id);

        existing.setNom(updated.getNom());
        existing.setSecteur(updated.getSecteur());
        existing.setAddress(updated.getAddress());
        existing.setLatitude(updated.getLatitude());
        existing.setLongitude(updated.getLongitude());
        existing.setProvinceId(updated.getProvinceId());

        return organismeRepository.save(existing);
    }

    // DELETE /api/organismes/{id}
    public void delete(Long id) {
        if (!organismeRepository.existsById(id)) {
            throw new EntityNotFoundException("Organisme introuvable avec id: " + id);
        }
        organismeRepository.deleteById(id);
    }
}
