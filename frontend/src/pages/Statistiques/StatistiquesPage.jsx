import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Map, BarChart3, Settings, Home, GraduationCap, TrendingUp, CheckCircle, Clock, Briefcase, MapPin, Award } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import logoEhtp from '../../assets/styles/logo-ehtp.png';

const StatistiquesPage = () => {
  const [animateCharts, setAnimateCharts] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimateCharts(true), 300);
  }, []);

  const stats = {
    total: 6,
    valides: 5,
    enAttente: 1,
    tauxValidation: 83
  };

  const kpis = [
    { 
      label: 'Total Lauréats', 
      value: stats.total, 
      icon: Users, 
      gradient: 'from-primary to-primary-dark',
      change: '+12%',
      changePositive: true
    },
    { 
      label: 'Profils Validés', 
      value: stats.valides, 
      icon: CheckCircle, 
      gradient: 'from-primary to-primary-dark',
      change: '+8%',
      changePositive: true
    },
    { 
      label: 'En Attente', 
      value: stats.enAttente, 
      icon: Clock, 
      gradient: 'from-primary-light to-primary',
      change: '0%',
      changePositive: false
    },
    { 
      label: 'Taux Validation', 
      value: `${stats.tauxValidation}%`, 
      icon: TrendingUp, 
      gradient: 'from-primary to-primary-dark',
      change: '+5%',
      changePositive: true
    }
  ];

  const statsParFiliere = [
    { nom: 'Génie informatique', valeur: 1, pourcentage: 17 },
    { nom: 'Génie civil', valeur: 1, pourcentage: 17 },
    { nom: 'Génie électrique', valeur: 1, pourcentage: 17 },
    { nom: 'Sciences de l\'Information Géographique (SIG / Géomatique)', valeur: 1, pourcentage: 17 },
    { nom: 'Ingénierie hydraulique et environnement', valeur: 1, pourcentage: 17 },
    { nom: 'Génie logistique et transports', valeur: 1, pourcentage: 17 }
  ];

  const statsParPromotion = [
    { annee: '2019', valeur: 1 },
    { annee: '2020', valeur: 2 },
    { annee: '2021', valeur: 2 },
    { annee: '2022', valeur: 1 },
    { annee: '2023', valeur: 0 },
    { annee: '2024', valeur: 0 }
  ];

  const statsParSecteur = {
    public: 1,
    prive: 5
  };

  const statsParGenre = [
    { nom: 'Hommes', valeur: 3, pourcentage: 50 },
    { nom: 'Femmes', valeur: 3, pourcentage: 50 }
  ];

  const distributionGeo = [
    { ville: 'Casablanca', public: 0, prive: 2 },
    { ville: 'Rabat', public: 1, prive: 1 },
    { ville: 'Khouribga', public: 0, prive: 1 },
    { ville: 'Tanger', public: 0, prive: 1 }
  ];

  const topOrganismes = [
    { nom: 'OCP', laureats: 2, secteur: 'Privé' },
    { nom: 'Ministère Equipement', laureats: 1, secteur: 'Public' },
    { nom: 'ONCF', laureats: 2, secteur: 'Privé' },
    { nom: 'Maroc Telecom', laureats: 1, secteur: 'Privé' }
  ];

  const topProvinces = [
    { nom: 'Casablanca', laureats: 2 },
    { nom: 'Rabat', laureats: 2 },
    { nom: 'Khouribga', laureats: 1 },
    { nom: 'Tanger', laureats: 1 }
  ];

  const maxPromotion = Math.max(...statsParPromotion.map(s => s.valeur), 1);
  const maxGeo = Math.max(...distributionGeo.flatMap(d => [d.public, d.prive]), 1);

  return (
    <div className="min-h-screen bg-background">
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
          <Link to="/statistiques" className="text-primary hover:text-primary-dark flex items-center gap-2 font-semibold">
            <BarChart3 size={18} />
            <span>Statistiques</span>
          </Link>
          <Link to="/administration" className="text-gray-700 hover:text-gray-900 flex items-center gap-2">
            <Settings size={18} />
            <span>Administration</span>
          </Link>
          <Link to={ROUTES.A_PROPOS} className="text-gray-700 hover:text-gray-900">À propos</Link>
          <Link to={ROUTES.CONTACT} className="text-gray-700 hover:text-gray-900">Contactez-nous</Link>
          <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark">
            Se Connecter
          </button>
        </nav>
      </header>

      {/* Contenu Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-black mb-2">Tableau de Bord & Statistiques</h1>
          <p className="text-gray-600">Analyses et indicateurs clés de notre réseau de lauréats</p>
        </div>

        {/* KPIs Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${kpi.gradient} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className="text-white" size={22} />
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-1">{kpi.value}</div>
              <div className="text-sm text-gray-600">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Graphiques Principaux - 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Promotions */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <GraduationCap className="mr-2 text-primary" size={18} />
              Promotions
            </h3>
            <div className="relative h-56">
              {/* Grille horizontale */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pt-2">
                {[2, 1, 0].map((val, idx) => (
                  <div key={idx} className="flex items-center">
                    <span className="text-xs text-gray-400 w-8 text-right pr-2">{val}</span>
                    <div className="flex-1 border-t border-gray-100"></div>
                  </div>
                ))}
              </div>
              
              {/* Barres */}
              <div className="flex items-end justify-around h-52 pt-2 relative">
                {statsParPromotion.map((promo, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-end" style={{ width: '14%' }}>
                    <div 
                      className="w-full bg-gradient-to-t from-primary-dark via-primary to-primary-light rounded-t transition-all duration-700 hover:opacity-80 cursor-pointer"
                      style={{ 
                        height: animateCharts ? `${(promo.valeur / maxPromotion) * 170}px` : '0px',
                        transitionDelay: `${idx * 50}ms`
                      }}
                    ></div>
                    <div className="text-xs font-medium text-gray-600 mt-2">{promo.annee}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Secteurs */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <Briefcase className="mr-2 text-primary" size={18} />
              Secteurs
            </h3>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="88" cy="88" r="70" fill="none" stroke="#f3f4f6" strokeWidth="36" />
                  <circle
                    cx="88" cy="88" r="70" fill="none" stroke="#6B7F5C" strokeWidth="36"
                    strokeDasharray={`${(statsParSecteur.prive / 6) * 439.8} 439.8`}
                    strokeDashoffset="0"
                    className="transition-all duration-700"
                    style={{ 
                      strokeDasharray: animateCharts ? `${(statsParSecteur.prive / 6) * 439.8} 439.8` : '0 439.8',
                      transitionDelay: '200ms'
                    }}
                  />
                  <circle
                    cx="88" cy="88" r="70" fill="none" stroke="#4F6B2B" strokeWidth="36"
                    strokeDasharray={`${(statsParSecteur.public / 6) * 439.8} 439.8`}
                    strokeDashoffset={`-${(statsParSecteur.prive / 6) * 439.8}`}
                    className="transition-all duration-700"
                    style={{ 
                      strokeDasharray: animateCharts ? `${(statsParSecteur.public / 6) * 439.8} 439.8` : '0 439.8',
                      transitionDelay: '400ms'
                    }}
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-primary-dark mx-auto mb-1"></div>
                <div className="text-2xl font-bold text-black">{statsParSecteur.public}</div>
                <div className="text-xs text-gray-600">Public</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-primary mx-auto mb-1"></div>
                <div className="text-2xl font-bold text-black">{statsParSecteur.prive}</div>
                <div className="text-xs text-gray-600">Privé</div>
              </div>
            </div>
          </div>

          {/* Filières */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <Award className="mr-2 text-primary" size={18} />
              Filières
            </h3>
            <div className="space-y-4">
              {statsParFiliere.map((filiere, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-medium text-gray-700">{filiere.nom}</span>
                    <span className="text-base font-bold text-black">{filiere.valeur}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ 
                          width: animateCharts ? `${filiere.pourcentage}%` : '0%',
                          transitionDelay: `${idx * 100}ms`
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 w-9 text-right">{filiere.pourcentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution Géographique et Genre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Distribution Géographique */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <MapPin className="mr-2 text-primary" size={18} />
              Distribution Géographique
            </h3>
            <div className="mb-4 flex justify-end space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-dark rounded mr-1.5"></div>
                <span className="text-xs text-gray-600">Public</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary-light rounded mr-1.5"></div>
                <span className="text-xs text-gray-600">Privé</span>
              </div>
            </div>
            <div className="flex items-end justify-around h-56">
              {distributionGeo.map((data, idx) => (
                <div key={idx} className="flex flex-col items-center" style={{ width: '20%' }}>
                  <div className="w-full flex space-x-1 items-end h-48">
                    <div 
                      className="flex-1 bg-primary-dark rounded-t transition-all duration-700"
                      style={{ 
                        height: animateCharts ? `${(data.public / maxGeo) * 180}px` : '0px',
                        transitionDelay: `${idx * 100}ms`
                      }}
                    ></div>
                    <div 
                      className="flex-1 bg-primary-light rounded-t transition-all duration-700"
                      style={{ 
                        height: animateCharts ? `${(data.prive / maxGeo) * 180}px` : '0px',
                        transitionDelay: `${idx * 100 + 50}ms`
                      }}
                    ></div>
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-2">{data.ville}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Répartition Genre */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <Users className="mr-2 text-primary" size={18} />
              Répartition Genre
            </h3>
            <div className="flex items-center justify-center mb-5">
              <div className="relative w-48 h-48">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="96" cy="96" r="76" fill="none" stroke="#f3f4f6" strokeWidth="38" />
                  <circle
                    cx="96" cy="96" r="76" fill="none" stroke="#8A9B7A" strokeWidth="38"
                    strokeDasharray={`${(statsParGenre[1].pourcentage / 100) * 477.5} 477.5`}
                    strokeDashoffset="0"
                    className="transition-all duration-700"
                    style={{ strokeDasharray: animateCharts ? `${(statsParGenre[1].pourcentage / 100) * 477.5} 477.5` : '0 477.5' }}
                  />
                  <circle
                    cx="96" cy="96" r="76" fill="none" stroke="#4F6B2B" strokeWidth="38"
                    strokeDasharray={`${(statsParGenre[0].pourcentage / 100) * 477.5} 477.5`}
                    strokeDashoffset={`-${(statsParGenre[1].pourcentage / 100) * 477.5}`}
                    className="transition-all duration-700"
                    style={{ 
                      strokeDasharray: animateCharts ? `${(statsParGenre[0].pourcentage / 100) * 477.5} 477.5` : '0 477.5',
                      transitionDelay: '200ms'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-black">{statsParGenre[0].pourcentage}%</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-background rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-dark mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Hommes</span>
                </div>
                <div className="text-2xl font-bold text-black">{statsParGenre[0].valeur}</div>
                <div className="text-xs text-gray-500">{statsParGenre[0].pourcentage}%</div>
              </div>
              <div className="p-4 bg-background rounded-lg">
                <div className="flex items-center mb-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-light mr-2"></div>
                  <span className="text-sm font-medium text-gray-700">Femmes</span>
                </div>
                <div className="text-2xl font-bold text-black">{statsParGenre[1].valeur}</div>
                <div className="text-xs text-gray-500">{statsParGenre[1].pourcentage}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Organismes et Provinces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Top Organismes */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <Briefcase className="mr-2 text-primary" size={18} />
              Top 5 Organismes Employeurs
            </h3>
            <div className="space-y-3">
              {topOrganismes.map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-black text-sm">{org.nom}</div>
                      <div className="text-xs text-gray-500">{org.secteur}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{org.laureats}</div>
                    <div className="text-xs text-gray-500">lauréats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Provinces */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <MapPin className="mr-2 text-primary" size={18} />
              Top 5 Provinces
            </h3>
            <div className="space-y-3">
              {topProvinces.map((province, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="font-semibold text-black text-sm">{province.nom}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{province.laureats}</div>
                    <div className="text-xs text-gray-500">lauréats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-footer text-white py-12 px-8 mt-12" style={{ backgroundColor: '#4F6B2B' }}>
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
                <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark">
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
};

export default StatistiquesPage;

