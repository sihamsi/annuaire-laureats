import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../utils/constants';

const Footer = () => {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    // TODO: Implémenter la logique d'abonnement
    console.log('Email:', email);
    setEmail('');
  };

  return (
    <footer className="bg-green-900 text-white py-12 px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white rounded-full"></div>
              <span className="font-semibold">Career Tracker EHTP</span>
            </div>
            <p className="text-sm text-green-200 mb-2">
              École Hassania Travaux Publics KM 7 Route
            </p>
            <p className="text-sm text-green-200 mb-2">
              d'El Jadida Casablanca BP 8108 Maroc
            </p>
            <p className="text-sm text-green-200 mb-2">
              +212 520 42 08 12
            </p>
            <p className="text-sm text-green-200">
              contact@ehtp.ac.ma
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Contactez-nous</h3>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address" 
                className="px-4 py-2 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50"
                required
              />
              <button 
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-green-700 pt-8 flex justify-between text-sm text-green-200">
          <div className="flex gap-6">
            <Link to={ROUTES.HOME} className="hover:text-white">
              Acceuil
            </Link>
            <Link to={ROUTES.RECHERCHE} className="hover:text-white">
              newsletter
            </Link>
            <Link to={ROUTES.A_PROPOS} className="hover:text-white">
              À propos
            </Link>
            <Link to={ROUTES.CONTACT} className="hover:text-white">
              Contactez-nous
            </Link>
          </div>
          <div>
            Career Tracker EHTP © 2025. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
