# 🧪 Guide de Test Postman - Annuaire & Carte SIG

## 🚀 Démarrage Rapide

### Étape 1 : Démarrer le Backend

```bash
cd backend
mvn spring-boot:run
```

**Attendre le message :** `Started DemoApplication in X seconds`

---

### Étape 2 : Importer la Collection Postman

1. **Ouvrir Postman**
2. **Cliquer sur "Import"** (en haut à gauche)
3. **Sélectionner le fichier** `POSTMAN_COLLECTION.json`
4. ✅ La collection "Annuaire & Carte SIG API" apparaît

---

## 📋 Tests par Catégorie

### 1️⃣ ANNUAIRE

#### Test 1.1 : Liste complète (paginée)
```
GET http://localhost:8080/api/laureats/annuaire?page=0&size=20
```

**Réponse attendue :**
```json
{
  "content": [
    {
      "id": "uuid",
      "prenom": "Ahmed",
      "nom": "El Mansouri",
      "email": "ahmed@example.com",
      "latitude": 33.5731,
      "longitude": -7.5898,
      "status": "published"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8
}
```

#### Test 1.2 : Recherche globale
```
GET http://localhost:8080/api/laureats/annuaire?search=ahmed
```
Recherche dans : nom, prénom, email, organisme, description

#### Test 1.3 : Filtre par filière
```
GET http://localhost:8080/api/laureats/annuaire?filiere=GC
```
**Valeurs possibles :** `SIG`, `GE`, `GC`, `IHE`, `IVE`, `GLT`, `GI`, `MET`, `MathSE`, `MaterialSE`

#### Test 1.4 : Filtre par promotion
```
GET http://localhost:8080/api/laureats/annuaire?promotion=2018
```

#### Test 1.5 : Filtre par secteur
```
GET http://localhost:8080/api/laureats/annuaire?secteur=public
```
**Valeurs :** `public` ou `prive`

#### Test 1.6 : Filtres combinés
```
GET http://localhost:8080/api/laureats/annuaire?filiere=GC&promotion=2018&secteur=public
```

#### Test 1.7 : Options de filtres
```
GET http://localhost:8080/api/laureats/filter-options
```
Retourne toutes les options disponibles pour les filtres

---

### 2️⃣ CARTE SIG

#### Test 2.1 : Tous les lauréats avec coordonnées
```
GET http://localhost:8080/api/laureats?status=published
```
**Important :** Chaque lauréat inclut `latitude` et `longitude`

#### Test 2.2 : Lauréats filtrés avec coordonnées
```
GET http://localhost:8080/api/laureats?status=published&filiere=GC
```
Les mêmes filtres que l'annuaire peuvent être appliqués

#### Test 2.3 : Liste des provinces
```
GET http://localhost:8080/api/provinces
```
Retourne les provinces avec leurs géométries (pour afficher les limites)

#### Test 2.4 : Province par coordonnées
```
GET http://localhost:8080/api/provinces/by-location?latitude=33.5731&longitude=-7.5898
```
**Coordonnées de test :**
- Casablanca : `33.5731, -7.5898`
- Rabat : `34.0209, -6.8416`

---

### 3️⃣ STATISTIQUES

#### Test 4.1 : Toutes les statistiques
```
GET http://localhost:8080/api/statistiques
```

#### Test 4.2 : Total lauréats
```
GET http://localhost:8080/api/statistiques/total
```

#### Test 4.3 : Par filière
```
GET http://localhost:8080/api/statistiques/by-filiere
```

#### Test 4.4 : Par province
```
GET http://localhost:8080/api/statistiques/by-province
```

---

## ✅ Checklist de Test

### Tests de Base
- [ ] Backend démarré sans erreur
- [ ] Collection Postman importée
- [ ] Test de connexion : `GET /api/provinces` fonctionne

### Annuaire
- [ ] Liste complète avec pagination
- [ ] Recherche globale fonctionne
- [ ] Filtre par filière
- [ ] Filtre par promotion
- [ ] Filtre par secteur
- [ ] Filtres combinés
- [ ] Options de filtres retournées

### Carte SIG
- [ ] Lauréats avec coordonnées (latitude/longitude présentes)
- [ ] Filtres appliqués à la carte
- [ ] Provinces récupérées avec géométries
- [ ] Géolocalisation fonctionne

### Intégration
- [ ] Mêmes filtres sur annuaire et carte
- [ ] Coordonnées présentes dans toutes les réponses
- [ ] Synchronisation annuaire ↔ carte

---

## 🐛 Résolution de Problèmes

### Erreur 404
**Cause :** Backend non démarré ou URL incorrecte  
**Solution :**
1. Vérifier que le backend est démarré : `mvn spring-boot:run`
2. Vérifier l'URL : `http://localhost:8080/api/...`

### Erreur 500
**Cause :** Problème de connexion à la base de données  
**Solution :**
1. Vérifier que PostgreSQL est démarré
2. Vérifier les paramètres dans `application.properties`
3. Vérifier les logs du backend

### Résultats vides `[]`
**Cause :** Pas de données dans la base  
**Solution :**
1. Vérifier qu'il y a des lauréats avec `status=published`
2. Tester sans filtres d'abord
3. Vérifier les données dans PostgreSQL

### Erreur de connexion
**Cause :** PostgreSQL non accessible  
**Solution :**
1. Vérifier que PostgreSQL est démarré
2. Vérifier le port (5432 ou 5433)
3. Vérifier les credentials dans `application.properties`

---

## 📝 Ordre Recommandé de Test

1. **Tests de base :**
   - `GET /api/provinces` (vérifier la connexion)
   - `GET /api/statistiques/total` (vérifier les données)

2. **Tests Annuaire :**
   - `GET /api/laureats/annuaire` (liste complète)
   - `GET /api/laureats/filter-options` (options)
   - Tests de filtres individuels
   - Tests de filtres combinés

3. **Tests Carte SIG :**
   - `GET /api/laureats?status=published` (coordonnées)
   - `GET /api/provinces/by-location` (géolocalisation)
   - Tests avec filtres

4. **Tests d'intégration :**
   - Appliquer les mêmes filtres sur annuaire et carte
   - Vérifier la cohérence des résultats

---

## 🎯 Exemples de Requêtes cURL

Si vous préférez utiliser cURL :

```bash
# Annuaire complet
curl "http://localhost:8080/api/laureats/annuaire?page=0&size=20"

# Recherche
curl "http://localhost:8080/api/laureats/annuaire?search=ahmed"

# Filtre par filière
curl "http://localhost:8080/api/laureats/annuaire?filiere=GC"

# Carte - Lauréats avec coordonnées
curl "http://localhost:8080/api/laureats?status=published"

# Provinces
curl "http://localhost:8080/api/provinces"

# Province par coordonnées
curl "http://localhost:8080/api/provinces/by-location?latitude=33.5731&longitude=-7.5898"
```

---

## 💡 Conseils

- **Commencez simple :** Testez d'abord les endpoints sans filtres
- **Vérifiez les données :** Assurez-vous qu'il y a des lauréats publiés dans la base
- **Utilisez la collection :** Tous les endpoints sont pré-configurés
- **Consultez les logs :** Les logs du backend montrent les requêtes SQL exécutées

---

*Guide créé pour faciliter les tests avec Postman*

