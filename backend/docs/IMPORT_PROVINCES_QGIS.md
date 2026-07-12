# Guide d'import des provinces depuis QGIS vers PostgreSQL/PostGIS

Ce guide explique comment importer la couche provinces du Maroc depuis QGIS dans la table `province` de votre base de données PostgreSQL/PostGIS.

## Structure actuelle de la table `province`

La table `province` contient actuellement les champs suivants :
- `id` : Long (auto-généré)
- `nom` : String (unique, non null)
- `geom` : geometry(MULTIPOLYGON, 4326) - Géométrie PostGIS
- `created_at` : LocalDateTime

## Champs de la couche QGIS

D'après votre couche QGIS, vous avez les champs suivants :
- `Code_Provi` : Code de la province (ex: 01.051.)
- `Superficie` : Superficie de la province
- `nom` : Nom de la province (ex: Province d'Al Hoceima)
- `Marocains_` : Nombre de Marocains
- `Etrangers_` : Nombre d'étrangers
- `Menages_` : Nombre de ménages
- `nom_arabe` : Nom en arabe (ex: إقليم الحسيمة)
- `Population` : Population totale

## Méthode 1 : Import direct depuis QGIS (Recommandé)

### Étape 1 : Préparer la connexion à PostgreSQL depuis QGIS

1. Ouvrez QGIS
2. Allez dans **Database > DB Manager** (ou **Couche > Ajouter une couche > Ajouter une couche PostGIS**)
3. Cliquez sur **Nouvelle connexion**
4. Configurez la connexion :
   - **Nom** : Nom de votre connexion (ex: "Projet GeoInformatique")
   - **Service** : (laissez vide)
   - **Hôte** : `localhost` (ou l'adresse IP de votre serveur PostgreSQL)
   - **Port** : `5433` (port de votre PostgreSQL - vérifiez dans `application.properties`)
   - **Base de données** : Nom de votre base de données (vérifiez dans `application.properties`)
   - **Authentification** : 
     - **Utilisateur** : Votre utilisateur PostgreSQL
     - **Mot de passe** : Votre mot de passe PostgreSQL
   - **SSL mode** : `Prefer`
5. Cliquez sur **OK** pour tester et sauvegarder la connexion

### Étape 2 : Vérifier que PostGIS est activé

Dans DB Manager, exécutez cette requête SQL pour vérifier que PostGIS est activé :

```sql
SELECT PostGIS_Version();
```

Si PostGIS n'est pas installé, installez-le avec :

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Étape 3 : Vider la table province (optionnel)

Si vous voulez remplacer les données existantes, videz d'abord la table :

```sql
TRUNCATE TABLE province CASCADE;
```

**⚠️ ATTENTION** : Cela supprimera toutes les provinces existantes. Si vous avez des données liées, cette commande peut échouer à cause des contraintes de clé étrangère. Dans ce cas, supprimez d'abord les références :

```sql
-- Désactiver temporairement les contraintes
SET session_replication_role = 'replica';

-- Vider la table
TRUNCATE TABLE province;

-- Réactiver les contraintes
SET session_replication_role = 'origin';
```

### Étape 4 : Exporter la couche vers PostgreSQL

1. Dans QGIS, sélectionnez votre couche **provinces**
2. Clic droit sur la couche > **Exporter > Sauvegarder les entités sous...**
3. Dans le dialogue :
   - **Format** : `PostgreSQL`
   - **Nom de fichier** : Cliquez sur **...** et sélectionnez votre connexion PostgreSQL créée à l'étape 1
   - **Nom de la table** : `province_temp` (table temporaire pour ne pas écraser la table existante)
   - **Options géométriques** :
     - ✅ **Géométries** : Activer
     - **Type de géométrie** : `Auto-detect` ou `MultiPolygon`
     - **SRID** : `4326` (WGS84)
   - **Options de création** :
     - ✅ **Remplacer la table si elle existe**
     - ✅ **Créer une clé primaire spatiale**
4. Cliquez sur **OK**

### Étape 5 : Mapper les champs vers la table province

Une fois la table `province_temp` créée, exécutez cette requête SQL dans DB Manager ou dans votre client PostgreSQL (pgAdmin, DBeaver, etc.) :

```sql
-- Insérer les données de province_temp vers province
INSERT INTO province (nom, geom, created_at)
SELECT 
    nom,  -- Utiliser le champ 'nom' de QGIS
    ST_Multi(geom) as geom,  -- Convertir en MULTIPOLYGON si nécessaire
    NOW() as created_at
FROM province_temp
WHERE nom IS NOT NULL AND nom != ''
ON CONFLICT (nom) DO UPDATE 
SET 
    geom = EXCLUDED.geom,
    created_at = EXCLUDED.created_at;

-- Vérifier les données importées
SELECT id, nom, ST_GeometryType(geom) as geom_type, created_at 
FROM province 
ORDER BY nom;
```

### Étape 6 : Nettoyer la table temporaire

```sql
DROP TABLE IF EXISTS province_temp;
```

## Méthode 2 : Import via Shapefile puis PostgreSQL

Si la méthode directe ne fonctionne pas, vous pouvez exporter d'abord en Shapefile, puis importer dans PostgreSQL :

1. Dans QGIS, sélectionnez votre couche **provinces**
2. Clic droit > **Exporter > Sauvegarder les entités sous...**
3. Format : `ESRI Shapefile`
4. Sauvegardez le fichier (ex: `provinces_maroc.shp`)
5. Utilisez `shp2pgsql` ou QGIS pour importer dans PostgreSQL

### Utilisation de shp2pgsql (ligne de commande)

```bash
# Générer le script SQL
shp2pgsql -s 4326 -I -g geom provinces_maroc.shp province_temp > provinces_import.sql

# Importer dans PostgreSQL
psql -h localhost -U votre_utilisateur -d votre_base_de_donnees -f provinces_import.sql
```

Puis exécutez la requête de mapping de l'étape 5 ci-dessus.

## Méthode 3 : Import via SQL direct (pour utilisateurs avancés)

Si vous avez les données en format GeoJSON, GeoPackage, ou autre :

1. Exportez depuis QGIS au format souhaité
2. Utilisez `ogr2ogr` (outil GDAL) :

```bash
ogr2ogr -f "PostgreSQL" \
  PG:"host=localhost user=votre_utilisateur dbname=votre_base password=votre_mot_de_passe" \
  provinces_maroc.shp \
  -nln province_temp \
  -lco GEOMETRY_NAME=geom \
  -lco FID=id \
  -t_srs EPSG:4326
```

Puis exécutez la requête de mapping de l'étape 5.

## Vérification de l'import

Exécutez ces requêtes pour vérifier que tout s'est bien passé :

```sql
-- Compter le nombre de provinces
SELECT COUNT(*) as nombre_provinces FROM province;

-- Vérifier les géométries
SELECT 
    nom, 
    ST_GeometryType(geom) as type_geometrie,
    ST_SRID(geom) as srid,
    ST_IsValid(geom) as geometrie_valide
FROM province
LIMIT 10;

-- Lister toutes les provinces
SELECT id, nom, created_at 
FROM province 
ORDER BY nom;

-- Vérifier qu'une province contient bien des points
SELECT nom 
FROM province 
WHERE ST_Contains(
    geom, 
    ST_SetSRID(ST_MakePoint(-4.0088, 35.2517), 4326)  -- Coordonnées d'Al Hoceima
);
```

## Ajout de champs supplémentaires (Optionnel)

Si vous souhaitez conserver plus d'informations de la couche QGIS (code, population, etc.), vous pouvez modifier l'entité `Province.java` pour ajouter ces champs. Cependant, pour l'instant, seule la géométrie (`geom`) et le nom (`nom`) sont nécessaires pour le fonctionnement de l'application.

## Notes importantes

1. **SRID** : Assurez-vous que le SRID est bien **4326** (WGS84) pour correspondre au reste de l'application
2. **Type de géométrie** : La table attend un `MULTIPOLYGON`. Si vos données sont des `POLYGON`, utilisez `ST_Multi()` pour convertir
3. **Nom unique** : Le champ `nom` doit être unique. Si vous avez des doublons dans QGIS, corrigez-les avant l'import
4. **Encodage** : Assurez-vous que les noms avec caractères spéciaux (arabe, français) sont correctement encodés (UTF-8)

## Résolution de problèmes

### Erreur : "duplicate key value violates unique constraint"
- Vous avez des noms de provinces en double. Vérifiez avec :
```sql
SELECT nom, COUNT(*) 
FROM province_temp 
GROUP BY nom 
HAVING COUNT(*) > 1;
```

### Erreur : "geometry type mismatch"
- Vos géométries ne sont pas des MULTIPOLYGON. Utilisez `ST_Multi()` :
```sql
INSERT INTO province (nom, geom, created_at)
SELECT 
    nom,
    ST_Multi(ST_CollectionExtract(geom, 3)) as geom,  -- Force MULTIPOLYGON
    NOW()
FROM province_temp;
```

### Erreur : "SRID mismatch"
- Vos géométries n'ont pas le bon SRID. Définissez-le :
```sql
UPDATE province_temp 
SET geom = ST_SetSRID(geom, 4326);
```
