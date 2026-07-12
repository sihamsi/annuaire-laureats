package com.example.demo.dto;

import com.example.demo.entity.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class LaureatDTO {

    private Long id; // CHANGED: ID → Long
    private String prenom;
    private String nom;
    private String genre;
    private String telephone;
    private String email;
    private String photoUrl;
    private String promotion;
    private String filiere;
    private String secteur;
    private Long organismeId; // CHANGED: ID → Long
    private String organismeNom;
    private String autreOrganisme;
    private Double latitude;
    private Double longitude;
    private Long provinceId; // CHANGED: ID → Long
    private String provinceNom;
    private String description;
    private String deviceId;
    private String status;
    private String motifRejet;
    private LocalDateTime dateInscription;
    private LocalDateTime dateValidation;

    public static LaureatDTO fromEntity(Laureat laureat) {
        LaureatDTO dto = new LaureatDTO();
        dto.setId(laureat.getId());
        dto.setPrenom(laureat.getPrenom());
        dto.setNom(laureat.getNom());
        dto.setGenre(laureat.getGenre() != null ? laureat.getGenre().name() : null); // CHANGED: .getDbValue() → .name()
        dto.setTelephone(laureat.getTelephone());
        dto.setEmail(laureat.getEmail());
        dto.setPhotoUrl(laureat.getPhotoUrl());
        dto.setPromotion(laureat.getPromotion());
        dto.setFiliere(laureat.getFiliere() != null ? laureat.getFiliere().name() : null); // CHANGED
        dto.setSecteur(laureat.getSecteur() != null ? laureat.getSecteur().name() : null); // CHANGED
        dto.setOrganismeId(laureat.getOrganismeId());
        dto.setAutreOrganisme(laureat.getAutreOrganisme());
        dto.setLatitude(laureat.getLatitude());
        dto.setLongitude(laureat.getLongitude());
        dto.setProvinceId(laureat.getProvinceId());
        dto.setDescription(laureat.getDescription());
        dto.setDeviceId(laureat.getDeviceId());
        dto.setStatus(laureat.getStatus() != null ? laureat.getStatus().name() : null); // CHANGED
        dto.setMotifRejet(laureat.getMotifRejet());
        dto.setDateInscription(laureat.getDateInscription());
        dto.setDateValidation(laureat.getDateValidation());
        return dto;
    }

    public Laureat toEntity() {
        Laureat laureat = new Laureat();
        laureat.setId(this.id);
        laureat.setPrenom(this.prenom);
        laureat.setNom(this.nom);
        laureat.setGenre(this.genre != null ? GenreType.valueOf(this.genre) : null); // CHANGED: .fromDbValue() →
                                                                                     // .valueOf()
        laureat.setTelephone(this.telephone);
        laureat.setEmail(this.email);
        laureat.setPhotoUrl(this.photoUrl);
        laureat.setPromotion(this.promotion);
        laureat.setFiliere(this.filiere != null ? FiliereType.valueOf(this.filiere) : null); // CHANGED
        laureat.setSecteur(this.secteur != null ? SecteurType.valueOf(this.secteur) : null); // CHANGED
        laureat.setOrganismeId(this.organismeId);
        laureat.setAutreOrganisme(this.autreOrganisme);
        laureat.setLatitude(this.latitude);
        laureat.setLongitude(this.longitude);
        laureat.setProvinceId(this.provinceId);
        laureat.setDescription(this.description);
        laureat.setDeviceId(this.deviceId);
        laureat.setStatus(this.status != null ? InscriptionStatus.valueOf(this.status) : InscriptionStatus.PENDING); // CHANGED
        laureat.setMotifRejet(this.motifRejet);
        return laureat;
    }
}