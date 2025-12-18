import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

const Navbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-8 py-4 border-b shadow-sm">
      <Link to={ROUTES.HOME} className="flex items-center gap-2">
        <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
          <span className="text-white text-xl">🎓</span>
        </div>
        <span className="font-semibold text-lg">Career Tracker EHTP</span>
      </Link>
      
      <nav className="flex items-center gap-8">
        <Link 
          to={ROUTES.HOME} 
          className={`text-gray-700 hover:text-gray-900 ${isActive(ROUTES.HOME) ? 'font-bold' : ''}`}
        >
          Acceuil
        </Link>
        <Link 
          to={ROUTES.RECHERCHE} 
          className={`text-gray-700 hover:text-gray-900 ${isActive(ROUTES.RECHERCHE) ? 'font-bold' : ''}`}
        >
          Rechercher
        </Link>
        <Link 
          to={ROUTES.A_PROPOS} 
          className={`text-gray-700 hover:text-gray-900 ${isActive(ROUTES.A_PROPOS) ? 'font-bold' : ''}`}
        >
          À propos
        </Link>
        <Link 
          to={ROUTES.CONTACT} 
          className={`text-gray-700 hover:text-gray-900 ${isActive(ROUTES.CONTACT) ? 'font-bold' : ''}`}
        >
          Contactez-nous
        </Link>
        <button className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800">
          Se Connecter
        </button>
      </nav>
    </header>
  );
};

export default Navbar;
