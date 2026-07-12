-- Migration: Ajouter la colonne device_id à la table laureat
-- À exécuter dans pgAdmin

ALTER TABLE laureat 
ADD COLUMN IF NOT EXISTS device_id VARCHAR(255);

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'laureat' AND column_name = 'device_id';
