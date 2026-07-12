<div align="center">

# 🌍 Projet GéoInfo

**Full-stack geoinformation platform — WebSIG**

[![Java](https://img.shields.io/badge/Java-Spring%20Boot%203-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Maven](https://img.shields.io/badge/Maven-wrapper-C71A36?logo=apachemaven&logoColor=white)](https://maven.apache.org)
[![Status](https://img.shields.io/badge/status-work%20in%20progress-orange)]()

*Visualize, manage and analyze geospatial data through a modern web interface backed by a REST API.*

</div>

---

## 🎯 About

**Projet GéoInfo** is a web-based GIS (WebSIG) under active development: a Spring Boot REST API serving geospatial data to an interactive React map client. The goal is a clean, end-to-end example of a modern geoinformation stack — from spatial storage to map rendering.

## 🗺️ Roadmap

- [x] Monorepo skeleton — Spring Boot backend + React frontend
- [ ] Interactive map view (base layers, zoom/pan, layer switcher)
- [ ] Geospatial entities CRUD via REST API (GeoJSON)
- [ ] Spatial database integration (PostgreSQL + PostGIS)
- [ ] Drawing & editing geometries on the map
- [ ] Authentication and user roles
- [ ] Thematic styling and filters by attribute
- [ ] Dashboard with spatial statistics

## 🧱 Architecture

```
projet_geoinfo/
├── backend/                  # REST API — Java · Spring Boot · Maven
│   └── src/main/java/...     # controllers, services, repositories (WIP)
│
└── frontend/                 # Web client — React 19 (CRA)
    └── src/                  # map components, API client (WIP)

        React (map UI)  ──HTTP/GeoJSON──▶  Spring Boot API  ──▶  PostgreSQL/PostGIS (planned)
```

## 🚀 Getting started

### Prerequisites

| Tool | Version |
|---|---|
| Java (JDK) | 17+ |
| Node.js | 18+ |
| Maven | provided via `mvnw` wrapper |

### Run the backend

```bash
cd backend
./mvnw spring-boot:run        # Windows: mvnw.cmd spring-boot:run
```

API available on `http://localhost:8080`.

### Run the frontend

```bash
cd frontend
npm install
npm start
```

UI available on `http://localhost:3000`.

## 🔐 Configuration & secrets

Environment-specific values (database credentials, API keys) must **never** be committed:

- backend → use environment variables or an ignored `application-local.properties`
- frontend → use an ignored `.env` (commit only a template `.env.example`)

The repository's `.gitignore` already enforces these rules.

## 👩‍💻 Author

**[Siham Ait Oumghar](https://github.com/sihamsi)** — Software engineer · GIS & full-stack development

*See also: [SIG Construction](https://github.com/sihamsi/Flutter_Project) (Flutter offline GIS app) · [Multitenant Cartography & Billing](https://github.com/sihamsi/multitenant-cartography-billing) (Spring Boot + React platform)*
