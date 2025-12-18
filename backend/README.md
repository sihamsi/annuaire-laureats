# Backend - Career Tracker EHTP

Backend Spring Boot pour la gestion de l'annuaire des lauréats de l'EHTP.

## Prérequis

- Java 21
- Maven 3.6+
- PostgreSQL 12+ avec extension PostGIS
- Base de données `laureat_db` créée avec le script SQL fourni

## Configuration

### 1. Base de données PostgreSQL

Assurez-vous que PostgreSQL est installé et que l'extension PostGIS est activée :

```sql
CREATE DATABASE laureat_db;
\c laureat_db
CREATE EXTENSION IF NOT EXISTS postgis;
```

Exécutez ensuite le script SQL de création des tables fourni.

### 2. Configuration de l'application

Modifiez le fichier `src/main/resources/application.properties` avec vos paramètres de connexion :

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/laureat_db
spring.datasource.username=votre_username
spring.datasource.password=votre_password
```

### 3. Compilation et exécution

```bash
# Compiler le projet
mvn clean install

# Lancer l'application
mvn spring-boot:run
```

L'application sera accessible sur `http://localhost:8080`

## API Endpoints

### Lauréats

- `GET /api/laureats` - Liste tous les lauréats avec filtres optionnels
  - Paramètres de requête : `search`, `filiere`, `promotion`, `secteur`, `genre`, `provinceId`, `organismeId`, `status`
- `GET /api/laureats/{id}` - Récupère un lauréat par ID
- `POST /api/laureats` - Crée un nouveau lauréat (inscription)
- `PATCH /api/laureats/{id}/status` - Met à jour le statut d'un lauréat

### Provinces

- `GET /api/provinces` - Liste toutes les provinces
- `GET /api/provinces/{id}` - Récupère une province par ID
- `GET /api/provinces/by-location?latitude={lat}&longitude={lon}` - Trouve la province contenant un point

### Statistiques

- `GET /api/statistiques` - Récupère toutes les statistiques
- `GET /api/statistiques/total` - Nombre total de lauréats
- `GET /api/statistiques/by-status` - Répartition par statut
- `GET /api/statistiques/by-filiere` - Répartition par filière
- `GET /api/statistiques/by-promotion` - Répartition par promotion
- `GET /api/statistiques/by-secteur` - Répartition par secteur
- `GET /api/statistiques/by-province` - Répartition par province

## Structure du projet

```
src/main/java/com/example/demo/
├── config/          # Configuration (CORS, Security)
├── controller/      # Controllers REST
├── dto/            # Data Transfer Objects
├── model/          # Entités JPA
│   ├── enums/      # Énumérations
│   └── ...         # Entités (Laureat, Organisme, Province, Utilisateur)
├── repository/     # Repositories JPA
└── service/        # Services métier
```

## Technologies utilisées

- Spring Boot 3.5.7
- Spring Data JPA
- PostgreSQL avec PostGIS
- Hibernate Spatial
- Spring Security
- Lombok

## Notes importantes

- L'application est configurée pour accepter les requêtes CORS depuis `http://localhost:3000` (frontend React)
- La sécurité est actuellement désactivée pour les endpoints `/api/**` (à activer en production)
- Les coordonnées géographiques sont gérées via PostGIS pour les opérations spatiales


