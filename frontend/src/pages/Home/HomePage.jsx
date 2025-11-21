import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Users, Map, BarChart3, Settings } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import heroEhtp from '../../assets/styles/hero-ehtp.png';
import logoEhtp from '../../assets/styles/logo-ehtp.png';
import alumniHero from '../../assets/styles/alumni-hero.png';

// Composants d'icônes SVG
const IconUsers = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const IconMapPin = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const IconBriefcase = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const IconCalendar = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-8 py-4 border-b shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logoEhtp} alt="EHTP Logo" className="w-10 h-10" />
          <span className="font-semibold text-lg">Career Tracker EHTP</span>
        </div>
        
        <nav className="flex items-center gap-8">
          <Link to={ROUTES.HOME} className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <Home size={18} />
            <span>Accueil</span>
          </Link>
          <Link to="/annuaire" className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <Users size={18} />
            <span>Annuaire</span>
          </Link>
          <Link to="/carte-sig" className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <Map size={18} />
            <span>Carte SIG</span>
          </Link>
          <Link to="/statistiques" className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <BarChart3 size={18} />
            <span>Statistiques</span>
          </Link>
          <Link to="/administration" className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <Settings size={18} />
            <span>Administration</span>
          </Link>
          <Link to={ROUTES.A_PROPOS} className="text-gray-700 hover:text-gray-900">À propos</Link>
          <Link to={ROUTES.CONTACT} className="text-gray-700 hover:text-gray-900">Contactez-nous</Link>
          <button className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800">
            Se Connecter
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="text-center py-16 px-4 pt-24">
        <h1 className="text-5xl font-serif text-black mb-4">
          Connecter les lauréats d'hier,
        </h1>
        <h1 className="text-5xl font-serif text-black mb-12">
          d'aujourd'hui et de demain.
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <img 
            src={heroEhtp} 
            alt="Réseau des lauréats EHTP" 
            className="w-full h-auto rounded-3xl"
          />
          
          <p className="text-sm text-gray-600 mt-4 italic">
            L'annuaire officiel des lauréats de l'École Hassania
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-8 border-t">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-serif text-black text-center mb-4">
            Career Tracker EHTP est la plateforme officielle
          </h2>
          <h2 className="text-4xl font-serif text-black text-center mb-16">
            de mise en réseau des diplômés de l'École Hassania des Travaux Publics.
          </h2>
          
          <div className="grid grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <IconUsers />
              </div>
              <h3 className="font-semibold text-black mb-3">Rechercher des anciens</h3>
              <p className="text-sm text-gray-600">
                Trouvez facilement vos anciens camarades par promotion, spécialité ou entreprise.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <IconMapPin />
              </div>
              <h3 className="font-semibold text-black mb-3">Réseautage</h3>
              <p className="text-sm text-gray-600">
                Découvrez les expériences et les postes occupés par les diplômés à travers le monde.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <IconBriefcase />
              </div>
              <h3 className="font-semibold text-black mb-3">Opportunités</h3>
              <p className="text-sm text-gray-600">
                Échangez via la messagerie intégrée et développez votre réseau professionnel.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                <IconCalendar />
              </div>
              <h3 className="font-semibold text-black mb-3">Événements</h3>
              <p className="text-sm text-gray-600">
                Retrouvailles et rencontres professionnelles ! Les recruteurs peuvent identifier des profils formés à l'EHTP pour leurs besoins.
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <h2 className="text-3xl font-serif text-black mb-6">Map Your Success</h2>
            <Link to={ROUTES.RECHERCHE}>
              <button className="bg-green-200 text-green-800 px-8 py-3 rounded-full hover:bg-green-300">
                Discover More
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto flex items-center gap-12">
          <div className="flex-shrink-0">
            <img 
              src={alumniHero} 
              alt="Lauréat EHTP" 
              className="w-64 h-64 object-contain rounded-lg"
            />
          </div>
          
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-black mb-6">
              Vous êtes lauréat de l'EHTP ? Rejoignez l'annuaire !
            </h2>
            <p className="text-gray-700 mb-4">
              Vous avez obtenu votre diplôme à École Hassania des Travaux Publics et souhaitez rester connecté avec vos anciens camarades ? Saisissez l'annuaire officiel des lauréats de EHTP.
            </p>
            <p className="text-gray-700 mb-4">
              En vous inscrivant, vous retrouverez vos camarades de promotion, élargirez votre réseau professionnel et accéderez à des opportunités exclusives. De plus, vous profiterez de nombreux autres avantages en rejoignant notre communauté. Comment nous rejoindre :
            </p>
            <ol className="text-gray-700 mb-4 space-y-2">
              <li>1. Cliquez sur le bouton ci-dessous</li>
              <li>2. Remplissez le formulaire d'inscription</li>
              <li>3. Validez votre profil et commencez à explorer.</li>
            </ol>
            <p className="text-gray-700 mb-6">
              N'attendez plus, inscrivez-vous à l'annuaire EHTP dès aujourd'hui ! Vous êtes lauréat de l'école Hassania ?
            </p>
            <button className="bg-green-800 text-white px-8 py-3 rounded-full w-full hover:bg-green-900">
              Se Connecter
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-footer text-white py-12 px-8" style={{ backgroundColor: '#4F6B2B' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={logoEhtp} alt="EHTP Logo" className="w-8 h-8" />
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
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Your email address" 
                  className="px-4 py-2 rounded-full text-gray-900"
                />
                <button className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
          
          <div className="border-t border-green-700 pt-8 flex justify-between text-sm text-green-200">
            <div className="flex gap-6">
              <Link to={ROUTES.HOME} className="hover:text-white">Acceuil</Link>
              <Link to="/annuaire" className="hover:text-white">newsletter</Link>
              <Link to={ROUTES.A_PROPOS} className="hover:text-white">À propos</Link>
              <Link to={ROUTES.CONTACT} className="hover:text-white">Contactez-nous</Link>
            </div>
            <div>
              Career Tracker EHTP © 2025. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
