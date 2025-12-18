# Plan d'Action - Gestion Annuaire Lauréats

## 📊 État Actuel du Projet

### ✅ Ce qui est déjà implémenté

#### Backend (Spring Boot)
- ✅ Modèles de données complets :
  - `Laureat` (avec tous les champs requis)
  - `Province` (découpage administratif)
  - `Organisme` (liste d'organismes/entreprises)
  - `Utilisateur` (pour l'administration)
- ✅ Enums : `FiliereType`, `GenreType`, `SecteurType`, `InscriptionStatus`, `UserRole`
- ✅ Controllers REST :
  - `LaureatController` (GET, POST, PATCH pour statut)
  - `ProvinceController` (avec recherche par géolocalisation)
  - `StatistiquesController`
- ✅ Services métier complets
- ✅ Configuration CORS et Security (basique)
- ✅ Base de données PostgreSQL avec PostGIS
- ✅ Géolocalisation automatique des provinces

#### Frontend (React)
- ✅ Pages principales : Home, Annuaire, CarteSIG, Statistiques, Administration
- ✅ Composants réutilisables
- ✅ Interface d'administration (partiellement fonctionnelle)

---

## ❌ Ce qui manque selon le cahier des charges

### 1. **Application Mobile** (Priorité HAUTE)
- ❌ Application mobile pour l'inscription des lauréats
- ❌ Gestion de l'identification des instances (IMEI)
- ❌ Upload de photos
- ❌ Géolocalisation depuis le mobile
- ❌ Affichage du motif de rejet
- ❌ Mise à jour des informations lauréat depuis mobile

### 2. **Backend - Fonctionnalités manquantes**

#### 2.1. Gestion des instances d'application mobile
- ❌ Modèle `AppInstance` pour stocker les informations des appareils (IMEI, etc.)
- ❌ Endpoint pour enregistrer/identifier les instances
- ❌ Repository et Service pour la gestion des instances

#### 2.2. Authentification et autorisation
- ❌ Service JWT (génération et validation de tokens)
- ❌ Controller d'authentification (`/api/auth/login`, `/api/auth/register`)
- ❌ Filtre JWT pour sécuriser les endpoints
- ❌ Mise à jour de `SecurityConfig` pour utiliser JWT
- ❌ Service de hashage de mots de passe (BCrypt)

#### 2.3. Gestion des inscriptions (Administration)
- ❌ Endpoint pour mettre à jour le statut avec motif de rejet : `PATCH /api/laureats/{id}/status?status=rejected&motifRejet=...`
- ❌ Endpoint pour récupérer les inscriptions en attente : `GET /api/laureats?status=pending`
- ❌ Traçabilité des rejets (historique)

#### 2.4. Mise à jour des informations lauréat
- ❌ Endpoint `PUT /api/laureats/{id}` pour mettre à jour les informations
- ❌ Endpoint `PATCH /api/laureats/{id}` pour mise à jour partielle
- ❌ Validation des permissions (seul le lauréat peut modifier ses infos)

#### 2.5. Gestion des utilisateurs
- ❌ Controller `UtilisateurController` (CRUD)
- ❌ Service `UtilisateurService`
- ❌ Endpoints pour créer/gérer les utilisateurs admin et bureau

#### 2.6. Notifications
- ❌ Service de notification (email/SMS)
- ❌ Notification lors du rejet d'inscription
- ❌ Notification lors de la validation d'inscription

### 3. **Frontend - Fonctionnalités manquantes**

#### 3.1. Authentification
- ❌ Page de connexion
- ❌ Gestion des tokens JWT (stockage, refresh)
- ❌ Protection des routes (admin, bureau)
- ❌ Déconnexion

#### 3.2. Administration
- ❌ Connexion réelle au backend pour la gestion des inscriptions
- ❌ Formulaire de rejet avec motif (connecté au backend)
- ❌ Historique des rejets depuis la base de données
- ❌ Gestion des utilisateurs (CRUD)

#### 3.3. Mise à jour des informations
- ❌ Formulaire de mise à jour pour les lauréats
- ❌ Vérification des permissions

### 4. **Base de données**

#### 4.1. Table manquante
- ❌ Table `app_instance` pour stocker les informations des instances mobiles :
  ```sql
  CREATE TABLE app_instance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      imei VARCHAR(50) UNIQUE NOT NULL,
      device_model VARCHAR(200),
      os_version VARCHAR(50),
      app_version VARCHAR(20),
      last_active TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      laureat_id UUID REFERENCES laureat(id)
  );
  ```

#### 4.2. Table de traçabilité des rejets
- ❌ Table `rejet_history` (optionnel, peut être dérivé de `laureat` avec `status=rejected`)

---

## 🎯 Plan d'Implémentation Priorisé

### Phase 1 : Backend - Authentification et Sécurité (URGENT)
1. ✅ Créer `JwtService` pour génération/validation des tokens
2. ✅ Créer `AuthController` avec endpoints login/register
3. ✅ Créer `JwtAuthenticationFilter`
4. ✅ Mettre à jour `SecurityConfig` pour utiliser JWT
5. ✅ Créer `PasswordEncoder` bean (BCrypt)
6. ✅ Créer `UtilisateurService` et `UtilisateurController`

### Phase 2 : Backend - Gestion des inscriptions (URGENT)
1. ✅ Améliorer `LaureatController` :
   - Endpoint pour rejeter avec motif : `PATCH /api/laureats/{id}/reject`
   - Endpoint pour valider : `PATCH /api/laureats/{id}/validate`
2. ✅ Créer endpoint pour récupérer les inscriptions en attente
3. ✅ Ajouter traçabilité (validatedBy, dateValidation)

### Phase 3 : Backend - Mise à jour et instances mobiles
1. ✅ Créer modèle `AppInstance`
2. ✅ Créer `AppInstanceRepository` et `AppInstanceService`
3. ✅ Créer `AppInstanceController`
4. ✅ Ajouter endpoint `PUT /api/laureats/{id}` pour mise à jour
5. ✅ Ajouter validation des permissions

### Phase 4 : Frontend - Authentification
1. ✅ Créer page de connexion
2. ✅ Créer contexte/auth provider
3. ✅ Protéger les routes
4. ✅ Mettre à jour `axiosConfig` pour inclure le token

### Phase 5 : Frontend - Administration
1. ✅ Connecter la page Administration au backend
2. ✅ Implémenter le rejet avec motif
3. ✅ Afficher l'historique depuis la base de données

### Phase 6 : Application Mobile
1. ✅ Choisir la technologie (React Native / Flutter / Ionic)
2. ✅ Créer la structure de base
3. ✅ Implémenter l'inscription
4. ✅ Implémenter la géolocalisation
5. ✅ Implémenter l'upload de photos
6. ✅ Implémenter la consultation de l'annuaire
7. ✅ Implémenter la mise à jour des informations

### Phase 7 : Notifications
1. ✅ Configurer un service d'email (Spring Mail)
2. ✅ Créer des templates d'email
3. ✅ Envoyer des notifications lors des changements de statut

---

## 📝 Notes Techniques

### Dépendances à ajouter au `pom.xml`
```xml
<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.12.3</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.12.3</version>
    <scope>runtime</scope>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-crypto</artifactId>
</dependency>

<!-- Email (optionnel pour notifications) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId>
</dependency>
```

### Structure de fichiers à créer

#### Backend
```
backend/src/main/java/com/example/demo/
├── config/
│   ├── JwtAuthenticationFilter.java (NOUVEAU)
│   └── ...
├── controller/
│   ├── AuthController.java (NOUVEAU)
│   ├── UtilisateurController.java (NOUVEAU)
│   ├── AppInstanceController.java (NOUVEAU)
│   └── ...
├── model/
│   ├── AppInstance.java (NOUVEAU)
│   └── ...
├── service/
│   ├── JwtService.java (NOUVEAU)
│   ├── AuthService.java (NOUVEAU)
│   ├── UtilisateurService.java (NOUVEAU)
│   ├── AppInstanceService.java (NOUVEAU)
│   └── ...
└── repository/
    ├── AppInstanceRepository.java (NOUVEAU)
    └── ...
```

#### Frontend
```
frontend/src/
├── auth/
│   ├── AuthContext.jsx (NOUVEAU)
│   ├── LoginPage.jsx (NOUVEAU)
│   └── ProtectedRoute.jsx (NOUVEAU)
└── ...
```

---

## 🔐 Sécurité

### Points à considérer
- ✅ Hashage des mots de passe avec BCrypt
- ✅ Validation des tokens JWT
- ✅ Expiration des tokens (configurée à 24h)
- ✅ Protection CSRF (désactivée pour API REST, à réactiver si nécessaire)
- ✅ Validation des inputs (déjà en place avec `@Valid`)
- ✅ Gestion des erreurs (à améliorer)

---

## 📱 Application Mobile - Recommandations

### Technologies possibles
1. **React Native** (recommandé si l'équipe connaît React)
   - Partage de code avec le frontend web
   - Accès natif à la géolocalisation et à l'appareil photo

2. **Flutter**
   - Performance native
   - UI moderne

3. **Ionic**
   - Application hybride
   - Partage de code avec le frontend web

### Fonctionnalités mobiles requises
- 📸 Accès à l'appareil photo pour upload de photo
- 📍 Géolocalisation (GPS)
- 🔔 Notifications push (optionnel)
- 📱 Identification IMEI/Device ID
- 🌐 Appels API REST vers le backend

---

## ✅ Checklist de Validation

### Backend
- [ ] Authentification JWT fonctionnelle
- [ ] Endpoints de gestion des inscriptions (validation/rejet)
- [ ] Gestion des instances mobiles
- [ ] Mise à jour des informations lauréat
- [ ] Gestion des utilisateurs
- [ ] Notifications (optionnel)

### Frontend
- [ ] Page de connexion
- [ ] Protection des routes
- [ ] Administration connectée au backend
- [ ] Gestion des rejets fonctionnelle

### Mobile
- [ ] Application créée
- [ ] Inscription fonctionnelle
- [ ] Géolocalisation fonctionnelle
- [ ] Upload de photos
- [ ] Consultation de l'annuaire
- [ ] Mise à jour des informations

---

## 🚀 Prochaines Étapes Immédiates

1. **Commencer par l'authentification backend** (Phase 1)
2. **Améliorer la gestion des inscriptions** (Phase 2)
3. **Créer l'application mobile** (Phase 6)

---

*Document créé le : $(date)*
*Dernière mise à jour : $(date)*

