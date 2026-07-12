<div align="center">

# 🎓 Annuaire des Lauréats — GéoInfo

**Cross-platform alumni directory with GIS features — Web · Mobile · REST API**

[![Java](https://img.shields.io/badge/Java-Spring%20Boot-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-web-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-000020?logo=expo&logoColor=white)](https://expo.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-spatial%20data-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)

*Find, locate and connect alumni — searchable directory, interactive SIG map of graduates by province, statistics dashboard and full admin workflow.*

</div>

---

## ✨ Features

- 🔎 **Alumni directory** — searchable, filterable profiles (promotion, filière, secteur, organisme, province…)
- 🗺️ **SIG map** — graduates geolocated by province on an interactive map (province geometries imported from **QGIS** into PostgreSQL)
- 📊 **Statistics dashboard** — distribution by filière, sector, gender, promotion and geography
- 👤 **Self-service accounts** — alumni sign up, manage their profile and photo; inscriptions are validated by an admin (with rejection motives)
- 🛡️ **Admin back-office** — account validation, directory management, contact messages, notifications
- 🔐 **Authentication** — BCrypt-hashed passwords, role-based access (admin / lauréat / visitor)
- 📱 **Mobile app** — React Native (Expo) client with the same directory, profile and map features

## 🧱 Architecture

```
projet_geoinfo/
├── backend/            # REST API — Spring Boot · JPA · PostgreSQL
│   ├── src/main/java/  #   entities (Laureat, Province, Geolocalisation…),
│   │                   #   controllers (auth, laureats, geoloc, stats, notifications…)
│   └── scripts/        #   QGIS → PostgreSQL province import (SQL)
├── frontend/           # Web client — React (annuaire, carte SIG, stats, admin)
├── frontend_mobile/    # Mobile client — React Native / Expo
└── scripts/            # Dev utilities (network/firewall helpers)
```

## 🚀 Getting started

### Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 17+ |
| Node.js | 18+ |
| PostgreSQL | 14+ (database `laureat_db`) |

### Backend

```bash
cd backend
./mvnw spring-boot:run          # Windows: mvnw.cmd spring-boot:run  (or ..\DEMARRER_BACKEND.ps1)
```

API on `http://localhost:8080`. On first run a demo admin is seeded — see console output.

### Web frontend

```bash
cd frontend
cp .env.example .env            # points to http://localhost:8080
npm install && npm start
```

### Mobile (Expo)

```bash
cd frontend_mobile
npm install
npx expo start
```

## 🔐 Demo credentials & scope

This is an academic project: a demo admin account (`admin` / see `CreateAdminOnce`) is auto-seeded for evaluation, and the database configuration targets localhost. For any real deployment, move credentials to environment variables and disable the demo seed. No real personal data is stored in this repository.

## 👩‍💻 Author

**[Siham Ait Oumghar](https://github.com/sihamsi)** — Software engineer · GIS & full-stack development

*See also: [SIG Construction](https://github.com/sihamsi/Flutter_Project) (Flutter offline GIS app) · [Multitenant Cartography & Billing](https://github.com/sihamsi/multitenant-cartography-billing) (Spring Boot + React platform)*
