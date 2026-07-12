-- Script de migration pour mettre à jour les photo_url des lauréats existants
-- Ce script génère les URLs au format photos/Prenom_Nom.png basées sur les noms dans la base de données

-- Version simplifiée qui fonctionne mieux avec PostgreSQL
UPDATE laureat
SET photo_url = 'photos/' || 
    INITCAP(LOWER(TRIM(prenom))) || '_' ||
    INITCAP(LOWER(TRIM(nom))) || '.png'
WHERE photo_url IS NULL 
   OR photo_url = ''
   OR photo_url NOT LIKE 'photos/%';

-- Vérification: Afficher les URLs générées
SELECT id, prenom, nom, photo_url 
FROM laureat 
WHERE photo_url IS NOT NULL 
ORDER BY id
LIMIT 20;
