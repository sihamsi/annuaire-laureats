import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>🌍 GeoInfo</h1>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Accueil</Link>
          <Link to="/map" className="nav-link">Carte</Link>
          <Link to="/data" className="nav-link">Données</Link>
          <Link to="/about" className="nav-link">À propos</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;


