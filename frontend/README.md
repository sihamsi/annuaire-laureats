# Annuaire des Lauréats EHTP

Plateforme de gestion de l'annuaire des lauréats de l'École Hassania des Travaux Publics (EHTP).

## 🚀 Technologies utilisées

- **React** 19.2.0
- **React Router DOM** 6.20.0
- **Axios** 1.6.0
- **Lucide React** 0.294.0 (icônes)
- **CSS Modules** (pour le styling)

## 📁 Structure du projet

```
frontend/
├── public/
│   ├── index.html
│   └── assets/
│       └── images/
│           └── logo-ehtp.png
│
├── src/
│   ├── api/
│   │   └── axiosConfig.js          # Configuration Axios
│   │
│   ├── assets/
│   │   └── styles/
│   │       ├── variables.css       # Variables CSS
│   │       └── global.css          # Styles globaux
│   │
│   ├── components/
│   │   └── common/
│   │       ├── Navbar/             # Barre de navigation
│   │       ├── Footer/             # Pied de page
│   │       ├── Button/            # Composant bouton
│   │       ├── Input/             # Composant input
│   │       └── Card/              # Composant carte
│   │
│   ├── layouts/
│   │   └── MainLayout.jsx         # Layout principal
│   │
│   ├── pages/
│   │   ├── Home/                   # Page d'accueil
│   │   ├── Rechercher/             # Page de recherche
│   │   ├── APropos/                # Page à propos
│   │   └── Contact/                # Page de contact
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx          # Configuration des routes
│   │
│   ├── utils/
│   │   └── constants.js           # Constantes de l'application
│   │
│   ├── App.jsx
│   └── index.js
│
├── .env
├── .env.example
├── jsconfig.json
└── package.json
```

## 🎨 Design

- **Couleur principale** : #6B7F5C (vert olive)
- **Background** : #F5F5F0 (beige clair)
- **Typographie titres** : Georgia (serif)
- **Typographie corps** : Sans-serif

## 📦 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

3. Modifier le fichier `.env` avec vos configurations :
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENV=development
```

## 🏃 Démarrage

```bash
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🛠️ Scripts disponibles

- `npm start` : Démarre le serveur de développement
- `npm build` : Construit l'application pour la production
- `npm test` : Lance les tests
- `npm eject` : Éjecte la configuration (irréversible)

## 📝 Fonctionnalités

- ✅ Page d'accueil avec présentation de l'EHTP
- ✅ Recherche de lauréats avec filtres avancés
- ✅ Page à propos avec informations sur l'école
- ✅ Formulaire de contact
- ✅ Navigation responsive
- ✅ Design moderne et professionnel

## 🔗 Routes

- `/` : Page d'accueil
- `/rechercher` : Page de recherche
- `/a-propos` : Page à propos
- `/contact` : Page de contact

## 📱 Responsive

L'application est entièrement responsive et s'adapte à tous les écrans (mobile, tablette, desktop).

## 🔧 Configuration

### Imports absolus

Le projet utilise des imports absolus configurés dans `jsconfig.json` :

```javascript
import Button from '@components/common/Button/Button';
import { ROUTES } from '@utils/constants';
```

### CSS Modules

Tous les composants utilisent CSS Modules pour le styling :

```javascript
import styles from './Component.module.css';
```

## 📄 Licence

Ce projet est développé pour l'École Hassania des Travaux Publics.
