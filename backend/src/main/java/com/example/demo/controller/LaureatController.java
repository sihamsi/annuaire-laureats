package com.example.demo.controller;

import com.example.demo.dto.LaureatRequest;
import com.example.demo.entity.Laureat;
import com.example.demo.repository.LaureatRepository;
import com.example.demo.service.ProvinceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/laureats")
public class LaureatController {

    private final LaureatRepository laureatRepository;
    private final ProvinceService provinceService;

    public LaureatController(LaureatRepository laureatRepository,
                             ProvinceService provinceService) {
        this.laureatRepository = laureatRepository;
        this.provinceService = provinceService;
    }

    @PostMapping
    public ResponseEntity<?> createLaureat(@RequestBody LaureatRequest req) {

        Laureat l = new Laureat();
        l.setNom(req.nom);
        l.setPrenom(req.prenom);
        l.setGenre(req.genre);
        l.setTelephone(req.telephone);
        l.setEmail(req.email);
        l.setPromotion(req.promotion);
        l.setFiliere(req.filiere);
        l.setFiliereId(req.filiereId);
        l.setSecteur(req.secteur);
        l.setOrganisme(req.organisme);
        l.setAutreOrganisme(req.autreOrganisme);
        l.setLatitude(req.latitude);
        l.setLongitude(req.longitude);

        // 🔴 ICI : calcul de la province via PostGIS
        String provinceName =
                provinceService.findProvinceNameByLatLon(req.latitude, req.longitude);
        l.setProvince(provinceName);

        l.setDescription(req.description);
        l.setPhotoUri(req.photoUri);
        l.setDeviceId(req.deviceId);
        l.setDateInscription(OffsetDateTime.parse(req.dateInscription));
        l.setStatut("EN_ATTENTE");
        l.setMotifRejet(null);

        Laureat saved = laureatRepository.save(l);
        return ResponseEntity.ok(saved);
    }
}
