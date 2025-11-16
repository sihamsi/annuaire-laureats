package com.example.demo.model;

public class Organisme {

    private Long id;
    private String nom;
    private String adresse;
    private String email;

    public Organisme() {}

    public Organisme(Long id, String nom, String adresse, String email) {
        this.id = id;
        this.nom = nom;
        this.adresse = adresse;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
