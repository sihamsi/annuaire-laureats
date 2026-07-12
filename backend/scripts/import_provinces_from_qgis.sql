-- Script SQL pour importer les provinces depuis QGIS
-- Ce script suppose que vous avez déjà importé la couche QGIS dans une table temporaire "province_temp"
-- 
-- Instructions :
-- 1. Importez d'abord votre couche QGIS dans une table "province_temp" (voir guide IMPORT_PROVINCES_QGIS.md)
-- 2. Exécutez ce script dans votre client PostgreSQL (pgAdmin, DBeaver, etc.)

-- ============================================
-- ÉTAPE 1 : Vérifier que la table temporaire existe
-- ============================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'province_temp'
    ) THEN
        RAISE EXCEPTION 'La table province_temp n''existe pas. Veuillez d''abord importer votre couche QGIS dans cette table.';
    END IF;
END $$;

-- ============================================
-- ÉTAPE 2 : Vérifier les données dans province_temp
-- ============================================
-- Décommentez pour voir les données avant import
-- SELECT nom, ST_GeometryType(geom) as type_geom, ST_SRID(geom) as srid
-- FROM province_temp
-- LIMIT 5;

-- ============================================
-- ÉTAPE 3 : Vérifier les noms en double
-- ============================================
-- Vérifier s'il y a des noms en double
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT nom, COUNT(*) as cnt
        FROM province_temp
        WHERE nom IS NOT NULL AND nom != ''
        GROUP BY nom
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE WARNING 'ATTENTION: Il y a % nom(s) de province(s) en double dans province_temp. Vérifiez-les avant de continuer.', duplicate_count;
        
        -- Afficher les doublons
        RAISE NOTICE 'Doublons trouvés:';
        FOR rec IN 
            SELECT nom, COUNT(*) as cnt
            FROM province_temp
            WHERE nom IS NOT NULL AND nom != ''
            GROUP BY nom
            HAVING COUNT(*) > 1
        LOOP
            RAISE NOTICE '  - % : % occurrence(s)', rec.nom, rec.cnt;
        END LOOP;
    END IF;
END $$;

-- ============================================
-- ÉTAPE 4 : Vider la table province (OPTIONNEL)
-- ============================================
-- ⚠️ ATTENTION : Décommentez ces lignes UNIQUEMENT si vous voulez remplacer toutes les données existantes
-- TRUNCATE TABLE province CASCADE;

-- ============================================
-- ÉTAPE 5 : Insérer/Mettre à jour les provinces
-- ============================================
-- Cette requête insère les nouvelles provinces et met à jour les existantes
INSERT INTO province (nom, geom, created_at)
SELECT 
    TRIM(nom) as nom,  -- Nettoyer les espaces
    -- Convertir en MULTIPOLYGON et s'assurer du bon SRID
    ST_Multi(
        ST_SetSRID(
            CASE 
                WHEN ST_GeometryType(geom) = 'ST_Polygon' THEN ST_Multi(geom)
                WHEN ST_GeometryType(geom) = 'ST_MultiPolygon' THEN geom
                ELSE ST_Multi(ST_CollectionExtract(geom, 3))
            END,
            4326
        )
    ) as geom,
    COALESCE(created_at, NOW()) as created_at
FROM province_temp
WHERE nom IS NOT NULL 
  AND TRIM(nom) != ''
  AND geom IS NOT NULL
  AND ST_IsValid(geom) = true
ON CONFLICT (nom) DO UPDATE 
SET 
    geom = EXCLUDED.geom,
    created_at = COALESCE(EXCLUDED.created_at, NOW());

-- ============================================
-- ÉTAPE 6 : Vérifier les données importées
-- ============================================
-- Compter le nombre total de provinces
DO $$
DECLARE
    total_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_count FROM province;
    RAISE NOTICE 'Nombre total de provinces dans la table province : %', total_count;
END $$;

-- Afficher les provinces avec leurs informations géométriques
SELECT 
    id,
    nom,
    ST_GeometryType(geom) as type_geometrie,
    ST_SRID(geom) as srid,
    ST_IsValid(geom) as geometrie_valide,
    ST_Area(geom::geography) / 1000000 as superficie_km2,  -- Superficie approximative en km²
    created_at
FROM province 
ORDER BY nom
LIMIT 20;

-- ============================================
-- ÉTAPE 7 : Nettoyer (OPTIONNEL)
-- ============================================
-- Décommentez pour supprimer la table temporaire après import réussi
-- DROP TABLE IF EXISTS province_temp;

-- ============================================
-- ÉTAPE 8 : Tests de géolocalisation (OPTIONNEL)
-- ============================================
-- Tester si une province contient un point donné (exemple : Al Hoceima)
-- SELECT nom 
-- FROM province 
-- WHERE ST_Contains(
--     geom, 
--     ST_SetSRID(ST_MakePoint(-4.0088, 35.2517), 4326)
-- );

-- Tester la recherche de province la plus proche
-- SELECT nom 
-- FROM province 
-- WHERE geom IS NOT NULL
-- ORDER BY ST_DistanceSphere(
--     geom,
--     ST_SetSRID(ST_MakePoint(-4.0088, 35.2517), 4326)
-- )
-- LIMIT 1;
