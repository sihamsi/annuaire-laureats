package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "laureat")
public class Laureat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String prenom;
    private String genre;
    private String telephone;
    private String email;
    private String promotion;

    private String filiere;
    private Integer filiereId;

    private String secteur;
    private String organisme;
    private String autreOrganisme;

    private Double latitude;
    private Double longitude;
    private String province;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "photo_uri", columnDefinition = "text")
    private String photoUri;

    @Column(name = "device_id")
    private String deviceId;

    @Column(name = "date_inscription")
    private OffsetDateTime dateInscription;

    private String statut;
    private String motifRejet;

    // ==== GETTERS & SETTERS ====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getGenre() { return genre; }
    public void setGenre(String genre) { this.genre = genre; }

    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPromotion() { return promotion; }
    public void setPromotion(String promotion) { this.promotion = promotion; }

    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }

    public Integer getFiliereId() { return filiereId; }
    public void setFiliereId(Integer filiereId) { this.filiereId = filiereId; }

    public String getSecteur() { return secteur; }
    public void setSecteur(String secteur) { this.secteur = secteur; }

    public String getOrganisme() { return organisme; }
    public void setOrganisme(String organisme) { this.organisme = organisme; }

    public String getAutreOrganisme() { return autreOrganisme; }
    public void setAutreOrganisme(String autreOrganisme) { this.autreOrganisme = autreOrganisme; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getProvince() { return province; }
    public void setProvince(String province) { this.province = province; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPhotoUri() { return photoUri; }
    public void setPhotoUri(String photoUri) { this.photoUri = photoUri; }

    public String getDeviceId() { return deviceId; }
    public void setDeviceId(String deviceId) { this.deviceId = deviceId; }

    public OffsetDateTime getDateInscription() { return dateInscription; }
    public void setDateInscription(OffsetDateTime dateInscription) { this.dateInscription = dateInscription; }

    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }

    public String getMotifRejet() { return motifRejet; }
    public void setMotifRejet(String motifRejet) { this.motifRejet = motifRejet; }
}
