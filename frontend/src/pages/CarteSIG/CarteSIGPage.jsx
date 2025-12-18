import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Users, Map, BarChart3, Settings, Home, Filter, MapPin, Layers, Maximize2, Navigation } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import logoEhtp from '../../assets/styles/logo-ehtp.png';

// Données des lauréats avec coordonnées géographiques (même structure que AnnuairePage)
const mockLaureats = [
  {
    id: 1,
    nom: "Alami",
    prenom: "Mohammed",
    genre: "M",
    email: "m.alami@email.com",
    telephone: "0612345678",
    promotion: "2020",
    filiere: "Génie informatique",
    secteur: "Privé",
    organisme: "OCP",
    province: "Casablanca",
    lat: 33.5731,
    lon: -7.5898,
    photo: "https://ui-avatars.com/api/?name=Mohammed+Alami&background=556B2F&color=fff",
    statut: "validé",
    description: "Ingénieur DevOps"
  },
  {
    id: 2,
    nom: "Bennani",
    prenom: "Fatima",
    genre: "F",
    email: "f.bennani@email.com",
    telephone: "0623456789",
    promotion: "2019",
    filiere: "Génie civil",
    secteur: "Public",
    organisme: "Ministère Equipement",
    province: "Rabat",
    lat: 34.0209,
    lon: -6.8416,
    photo: "https://ui-avatars.com/api/?name=Fatima+Bennani&background=6B8E23&color=fff",
    statut: "validé",
    description: "Chef de projet"
  },
  {
    id: 3,
    nom: "Tazi",
    prenom: "Karim",
    genre: "M",
    email: "k.tazi@email.com",
    telephone: "0634567890",
    promotion: "2021",
    filiere: "Génie électrique",
    secteur: "Privé",
    organisme: "ONCF",
    province: "Rabat",
    lat: 34.0209,
    lon: -6.8416,
    photo: "https://ui-avatars.com/api/?name=Karim+Tazi&background=808000&color=fff",
    statut: "en_attente",
    description: "Ingénieur électrotechnique"
  },
  {
    id: 4,
    nom: "El Amrani",
    prenom: "Salma",
    genre: "F",
    email: "s.elamrani@email.com",
    telephone: "0645678901",
    promotion: "2020",
    filiere: "Sciences de l'Information Géographique (SIG / Géomatique)",
    secteur: "Privé",
    organisme: "Maroc Telecom",
    province: "Casablanca",
    lat: 33.5892,
    lon: -7.6031,
    photo: "https://ui-avatars.com/api/?name=Salma+Amrani&background=9ACD32&color=fff",
    statut: "validé",
    description: "Géomaticien"
  },
  {
    id: 5,
    nom: "Idrissi",
    prenom: "Youssef",
    genre: "M",
    email: "y.idrissi@email.com",
    telephone: "0656789012",
    promotion: "2022",
    filiere: "Ingénierie hydraulique et environnement",
    secteur: "Privé",
    organisme: "OCP",
    province: "Khouribga",
    lat: 32.8811,
    lon: -6.9063,
    photo: "https://ui-avatars.com/api/?name=Youssef+Idrissi&background=556B2F&color=fff",
    statut: "validé",
    description: "Ingénieur hydraulique"
  },
  {
    id: 6,
    nom: "Mansouri",
    prenom: "Nadia",
    genre: "F",
    email: "n.mansouri@email.com",
    telephone: "0667890123",
    promotion: "2021",
    filiere: "Génie logistique et transports",
    secteur: "Privé",
    organisme: "ONCF",
    province: "Tanger",
    lat: 35.7595,
    lon: -5.8340,
    photo: "https://ui-avatars.com/api/?name=Nadia+Mansouri&background=6B8E23&color=fff",
    statut: "validé",
    description: "Ingénieur logistique"
  }
];

const filieres = [
  "Génie civil",
  "Génie électrique",
  "Ingénierie hydraulique et environnement",
  "Ingénierie de la ville et de l'environnement",
  "Météorologie",
  "Sciences de l'Information Géographique (SIG / Géomatique)",
  "Génie informatique",
  "Génie logistique et transports"
];

const provinces = ["Casablanca", "Rabat", "Marrakech", "Fès", "Tanger", "Agadir", "Khouribga"];

const CarteSIGPage = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [showProvinces, setShowProvinces] = useState(true);
  const [showMarkers, setShowMarkers] = useState(true);
  
  // Filtres identiques à AnnuairePage
  const [filters, setFilters] = useState({
    filiere: searchParams.get('filiere') || '',
    promotion: searchParams.get('promotion') || '',
    secteur: searchParams.get('secteur') || '',
    genre: searchParams.get('genre') || '',
    province: searchParams.get('province') || '',
    search: searchParams.get('search') || ''
  });

  const [filteredLaureats, setFilteredLaureats] = useState(mockLaureats);
  
  // Configuration GeoServer
  const GEOSERVER_CONFIG = {
    url: 'http://localhost:8080/geoserver',
    workspace: 'EHTP',
    layerProvinces: 'Provinces',
    layerMaroc: 'maroc_boundary'
  };

  // Couleurs par filière
  const getColorByFiliere = (filiere) => {
    const colors = {
      'Génie informatique': '#6B7F5C',
      'Génie civil': '#8A9B7A',
      'Génie électrique': '#556448',
      'Sciences de l\'Information Géographique (SIG / Géomatique)': '#4F6B2B',
      'Ingénierie hydraulique et environnement': '#6B7F5C',
      'Génie logistique et transports': '#8A9B7A'
    };
    return colors[filiere] || '#6B7F5C';
  };

  // Filtrage des lauréats (même logique que AnnuairePage)
  useEffect(() => {
    let filtered = mockLaureats;

    if (filters.search) {
      filtered = filtered.filter(l =>
        l.nom.toLowerCase().includes(filters.search.toLowerCase()) ||
        l.prenom.toLowerCase().includes(filters.search.toLowerCase()) ||
        l.email.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.filiere) filtered = filtered.filter(l => l.filiere === filters.filiere);
    if (filters.promotion) filtered = filtered.filter(l => l.promotion === filters.promotion);
    if (filters.secteur) filtered = filtered.filter(l => l.secteur === filters.secteur);
    if (filters.genre) filtered = filtered.filter(l => l.genre === filters.genre);
    if (filters.province) filtered = filtered.filter(l => l.province === filters.province);

    setFilteredLaureats(filtered);

    // Mettre à jour les marqueurs sur la carte
    if (leafletMapRef.current && window.L) {
      updateMarkers();
    }
  }, [filters]);

  // Synchroniser les filtres avec l'URL
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      filiere: '',
      promotion: '',
      secteur: '',
      genre: '',
      province: '',
      search: ''
    });
  };

  // Initialisation de Leaflet
  useEffect(() => {
    if (!window.L) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(leafletCSS);

      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJS.onload = () => {
        if (mapRef.current && !leafletMapRef.current) {
          initializeMap();
        }
      };
      document.body.appendChild(leafletJS);
    } else {
      if (mapRef.current && !leafletMapRef.current) {
        initializeMap();
      }
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mise à jour des couches
  useEffect(() => {
    if (leafletMapRef.current) {
      updateLayers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showProvinces, showMarkers]);

  const initializeMap = () => {
    if (!mapRef.current || leafletMapRef.current) return;

    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: false
    });

    leafletMapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    addGeoServerLayers(map, L);
    updateMarkers();

    L.control.zoom({
      position: 'topright'
    }).addTo(map);
  };

  const addGeoServerLayers = (map, L) => {
    try {
      const provincesLayer = L.tileLayer.wms(`${GEOSERVER_CONFIG.url}/wms`, {
        layers: `${GEOSERVER_CONFIG.workspace}:${GEOSERVER_CONFIG.layerProvinces}`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'GeoServer - Provinces Maroc'
      });

      provincesLayer.on('tileerror', (error) => {
        console.warn('Erreur de chargement de la couche provinces:', error);
      });

      const marocLayer = L.tileLayer.wms(`${GEOSERVER_CONFIG.url}/wms`, {
        layers: `${GEOSERVER_CONFIG.workspace}:${GEOSERVER_CONFIG.layerMaroc}`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'GeoServer - Maroc'
      });

      marocLayer.on('tileerror', (error) => {
        console.warn('Erreur de chargement de la couche Maroc:', error);
      });

      marocLayer.addTo(map);
      if (showProvinces) {
        provincesLayer.addTo(map);
      }

      map.provincesLayer = provincesLayer;
      map.marocLayer = marocLayer;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des couches GeoServer:', error);
    }
  };

  const updateMarkers = () => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;

    // Supprimer tous les marqueurs existants
    markersRef.current.forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = [];

    if (!showMarkers) return;

    const L = window.L;

    // Ajouter les marqueurs filtrés
    filteredLaureats.forEach(laureat => {
      const color = getColorByFiliere(laureat.filiere);
      
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: ${color};
            border: 4px solid white;
            border-radius: 50%;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 40],
        popupAnchor: [0, -40]
      });

      const marker = L.marker([laureat.lat, laureat.lon], {
        icon: customIcon
      }).addTo(map);

      const popupContent = `
        <div style="min-width: 200px; font-family: system-ui;">
          <div style="font-weight: bold; font-size: 16px; color: #1f2937; margin-bottom: 8px;">
            ${laureat.prenom} ${laureat.nom}
          </div>
          <div style="color: #6b7280; margin-bottom: 4px;">
            <strong>Filière:</strong> ${laureat.filiere}
          </div>
          <div style="color: #6b7280; margin-bottom: 4px;">
            <strong>Promotion:</strong> ${laureat.promotion}
          </div>
          <div style="color: #6b7280; margin-bottom: 4px;">
            <strong>Organisme:</strong> ${laureat.organisme}
          </div>
          <div style="color: ${color}; font-weight: bold;">
            📍 ${laureat.province}
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('mouseover', function() {
        this.getElement().style.transform = 'scale(1.2)';
      });

      marker.on('mouseout', function() {
        this.getElement().style.transform = 'scale(1)';
      });

      markersRef.current.push(marker);
    });
  };

  const updateLayers = () => {
    const map = leafletMapRef.current;
    if (!map || !window.L) return;

    if (map.provincesLayer) {
      if (showProvinces && !map.hasLayer(map.provincesLayer)) {
        map.addLayer(map.provincesLayer);
      } else if (!showProvinces && map.hasLayer(map.provincesLayer)) {
        map.removeLayer(map.provincesLayer);
      }
    }

    updateMarkers();
  };

  const resetView = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([31.7917, -7.0926], 6);
    }
  };

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
          <Link to="/carte-sig" className="text-primary hover:text-primary-dark flex items-center gap-2 font-semibold">
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
          <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark">
            Se Connecter
          </button>
        </nav>
      </header>

      {/* Contenu Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-black mb-2">
            Carte SIG
          </h1>
          <p className="text-gray-600 text-lg">Visualisation géographique interactive</p>
        </div>
        
        <div className="grid grid-cols-4 gap-6">
          {/* Panneau latéral gauche */}
          <div className="space-y-6">
            {/* Filtres de carte */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200">
              <h3 className="font-bold text-black mb-4 flex items-center text-lg">
                <Filter className="w-5 h-5 text-primary mr-2" />
                <span>Filtres de carte</span>
              </h3>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    PROMOTION
                  </label>
                  <select
                    value={filters.promotion}
                    onChange={(e) => handleFilterChange('promotion', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="">Toutes</option>
                    <option value="2019">2019</option>
                    <option value="2020">2020</option>
                    <option value="2021">2021</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    FILIÈRE
                  </label>
                  <select
                    value={filters.filiere}
                    onChange={(e) => handleFilterChange('filiere', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="">Toutes</option>
                    {filieres.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    SECTEUR
                  </label>
                  <select
                    value={filters.secteur}
                    onChange={(e) => handleFilterChange('secteur', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="">Tous</option>
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    PROVINCE
                  </label>
                  <select
                    value={filters.province}
                    onChange={(e) => handleFilterChange('province', e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                  >
                    <option value="">Toutes</option>
                    {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={() => {
                  // Les filtres sont appliqués automatiquement via useEffect
                }}
                className="w-full bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
              >
                Appliquer les filtres
              </button>
            </div>

            {/* Légende */}
            <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200">
              <h3 className="font-bold text-black mb-4 flex items-center text-lg">
                <Layers className="mr-2 text-primary" size={22} />
                Légende
              </h3>
              <div className="space-y-3">
                {filieres.map((filiere, idx) => {
                  const count = filteredLaureats.filter(l => l.filiere === filiere).length;
                  if (count === 0) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-5 h-5 rounded-full mr-3 shadow-md border-2 border-white"
                          style={{ backgroundColor: getColorByFiliere(filiere) }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{filiere}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Carte principale */}
          <div className="col-span-3">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200" style={{height: '800px'}}>
              {/* Barre d'outils carte */}
              <div className="bg-primary px-6 py-4 flex justify-between items-center">
                <div className="text-white">
                  <div className="font-bold text-lg">Carte Interactive du Maroc</div>
                  <div className="text-sm opacity-90">Cliquez sur un marqueur pour plus d'informations</div>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={resetView}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
                    title="Recentrer"
                  >
                    <Navigation size={20} />
                  </button>
                  <button className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all">
                    <Maximize2 size={20} />
                  </button>
                </div>
              </div>

              {/* Zone carte Leaflet */}
              <div 
                ref={mapRef} 
                style={{ width: '100%', height: 'calc(100% - 72px)' }}
              ></div>
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

export default CarteSIGPage;
