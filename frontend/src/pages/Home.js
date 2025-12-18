import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Bienvenue sur GeoInfo</h1>
          <p className="hero-subtitle">
            Plateforme de géoinformatique pour la visualisation et l'analyse de données géospatiales
          </p>
          <div className="hero-buttons">
            <Link to="/map" className="btn btn-primary">
              Explorer la carte
            </Link>
            <Link to="/data" className="btn btn-secondary">
              Voir les données
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Fonctionnalités</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Cartographie interactive</h3>
              <p>Visualisez et explorez des données géospatiales sur une carte interactive</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Analyse de données</h3>
              <p>Analysez et traitez vos données géographiques avec des outils avancés</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💾</div>
              <h3>Gestion de données</h3>
              <p>Importez, exportez et gérez vos données géospatiales facilement</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;


