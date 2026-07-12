-- Migration: Ajouter la colonne password à la table laureat
-- Date: 2026-01-12

-- Ajouter la colonne password (hashé) à la table laureat
ALTER TABLE laureat 
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Commentaire sur la colonne
COMMENT ON COLUMN laureat.password IS 'Mot de passe hashé (BCrypt) pour l''authentification';
