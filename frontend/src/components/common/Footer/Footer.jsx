import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';
import { User } from 'lucide-react';

const Footer = () => {
  const navigate = useNavigate();

  const handleContactClick = () => {
    // Rediriger vers la page de contact appropriée selon l'espace
    if (window.location.pathname.startsWith('/admin')) {
      navigate('/admin/administration');
    } else if (window.location.pathname.startsWith('/visiteur')) {
      navigate('/visiteur/contact');
    } else {
      navigate('/visiteur/contact');
    }
  };

  return (
    <footer className="text-white py-12 px-8" style={{ backgroundColor: "#4F6B2B" }}>
      <div className="max-w-6xl mx-auto">
        {/* Top Section */}
        <div className="flex justify-between items-start mb-8">
          {/* Left Side */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#8E9C78" }}>
                <User className="text-white" size={20} />
              </div>
              <span className="font-semibold text-lg">Career Tracker EHTP</span>
            </div>
            <p className="text-sm text-white mb-2">
              École Hassania Travaux Publics KM 7 Route
            </p>
            <p className="text-sm text-white mb-2">
              d'El Jadida Casablanca BP 8108 Maroc
            </p>
            <p className="text-sm text-white mb-2">
              +212 520 42 08 12
            </p>
            <p className="text-sm text-white">
              contact@ehtp.ac.ma
            </p>
          </div>
          
          {/* Right Side - Contact Button */}
          <div>
            <button
              onClick={handleContactClick}
              className="bg-white text-gray-800 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              style={{ color: "#4F6B2B" }}
            >
              Contactez-nous
            </button>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t mb-8" style={{ borderColor: "#8E9C78" }}></div>
        
        {/* Bottom Section */}
        <div className="flex justify-between items-center text-sm">
          {/* Left Side - Navigation Links */}
          <div className="flex gap-6" style={{ color: "#8E9C78" }}>
            <Link to={ROUTES.HOME} className="hover:text-white transition-colors">
              Acceuil
            </Link>
            <Link to="/visiteur/annuaire" className="hover:text-white transition-colors">
              Annuaire
            </Link>
            <Link to={ROUTES.A_PROPOS} className="hover:text-white transition-colors">
              À propos
            </Link>
            <Link to={ROUTES.CONTACT} className="hover:text-white transition-colors">
              Contactez-nous
            </Link>
          </div>
          
          {/* Right Side - Copyright */}
          <div className="text-white">
            Career Tracker EHTP © 2025. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
