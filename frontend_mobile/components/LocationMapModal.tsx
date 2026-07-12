import React, { useMemo, useEffect, useRef } from "react";
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import { API_BASE_URL } from "../config/network";

// Import conditionnel de WebView (uniquement pour mobile natif)
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require("react-native-webview").WebView;
  } catch (e) {
    console.warn("WebView non disponible");
  }
}

interface LocationMapModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (coords: [number, number], locationName?: string) => void;
  initialCoordinates?: [number, number];
  zoomLevel?: number;
}

const LocationMapModal: React.FC<LocationMapModalProps> = ({
  visible,
  onClose,
  onSelect,
  initialCoordinates, // Non utilisé - la carte s'affiche toujours sur le Maroc
  zoomLevel, // Non utilisé - zoom fixe à 6 pour voir tout le Maroc
}) => {
  const mapContainerRef = useRef<any>(null);
  const webViewRef = useRef<any>(null);
  const mapContainerIdRef = useRef(`map-container-${Math.random().toString(36).substr(2, 9)}`);

  // Log pour déboguer l'affichage du modal
  useEffect(() => {
    console.log("📍 LocationMapModal - visible:", visible);
  }, [visible]);

  // Données des organismes marocains - sérialisées dans le HTML pour éviter les problèmes d'échappement
  const organismesMaroc = {
    'ONCF': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Office National des Chemins de Fer (ONCF)' },
    'ONEE': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Office National de l\'Électricité et de l\'Eau Potable (ONEE)' },
    'ADM': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Autoroutes du Maroc (ADM)' },
    'OCP': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Office Chérifien des Phosphates (OCP)' },
    'Maroc Telecom': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Maroc Telecom' },
    'Bank of Africa': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Bank of Africa' },
    'Attijariwafa Bank': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Attijariwafa Bank' },
    'BMCE Bank': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'BMCE Bank' },
    'LYDEC': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'LYDEC' },
    'REDAL': { lat: 34.0209, lng: -6.8416, city: 'Rabat', name: 'REDAL' },
    'AMENDIS': { lat: 35.7595, lng: -5.8340, city: 'Tanger', name: 'AMENDIS' },
    'CDG': { lat: 34.0209, lng: -6.8416, city: 'Rabat', name: 'Caisse de Dépôt et de Gestion (CDG)' },
    'RAM': { lat: 33.5731, lng: -7.5898, city: 'Casablanca', name: 'Royal Air Maroc (RAM)' },
  };

  const html = useMemo(
    () => {
      // Sérialiser les données d'organismes en JSON pour injection sûre dans le HTML
      const organismesJson = JSON.stringify(organismesMaroc);
      // Convertir API_BASE_URL en string simple pour interpolation
      const apiBaseUrlStr = String(API_BASE_URL);
      return `
  <!DOCTYPE html>
  <html lang="fr">
    <head>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossorigin="anonymous"
      />
      <style>
        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
          width: 100%;
        }
        #map {
          height: 100%;
          width: 100%;
        }
        .leaflet-control {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .province-tooltip {
          background: rgba(107, 127, 92, 0.9);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
  
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <script>
        (function() {
          function initMap() {
            if (typeof L === 'undefined') {
              setTimeout(initMap, 100);
              return;
            }
            
            // Toujours centrer sur le Maroc
            var map = L.map('map', {
              center: [31.7917, -7.9926], // Centre du Maroc
              zoom: 6, // Zoom pour voir tout le Maroc
              zoomControl: false
            });
  
            L.tileLayer('https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
              maxZoom: 19,
              attribution: 'Esri'
            }).addTo(map);
  
            // ✅ Charger et afficher la couche des provinces du Maroc
            var API_BASE_URL = '${apiBaseUrlStr}';
            fetch(API_BASE_URL + '/api/geolocalisation/provinces/geojson')
            .then(function(response) {
              return response.json();
            })
            .then(function(geojson) {
              if (geojson && geojson.features && geojson.features.length > 0) {
                var provincesLayer = L.geoJSON(geojson, {
                  style: function(feature) {
                    return {
                      color: '#6B7F5C',
                      weight: 1.5,
                      fillColor: '#8A9B7A',
                      fillOpacity: 0.2,
                      opacity: 0.8
                    };
                  },
                  onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.nom) {
                      layer.bindTooltip(feature.properties.nom, {
                        permanent: false,
                        direction: 'center',
                        className: 'province-tooltip'
                      });
                    }
                  }
                }).addTo(map);
              }
            })
            .catch(function(error) {
              console.error('Erreur lors du chargement des provinces:', error);
            });
  
            // === Icônes personnalisées ===
            const greenIcon = L.icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="32" height="48"><path fill="#4CAF50" stroke="#2E7D32" stroke-width="1.5" d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z"/><circle cx="12" cy="9" r="3.5" fill="white"/></svg>'),
              iconSize: [32, 48],
              iconAnchor: [16, 48],
              popupAnchor: [0, -48]
            });
  
            const redIcon = L.icon({
              iconUrl: 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="42"><path fill="#F44336" stroke="#C62828" stroke-width="1.5" d="M12 0C7.03 0 3 4.03 3 9c0 7.5 9 18 9 18s9-10.5 9-18c0-4.97-4.03-9-9-9z"/><circle cx="12" cy="9" r="3.5" fill="white"/></svg>'),
              iconSize: [28, 42],
              iconAnchor: [14, 42],
              popupAnchor: [0, -42]
            });
  
            // === Marker sélectionné et liste des marqueurs de recherche ===
            let selectedMarker = null;
            let searchMarkers = [];
            let selectedLocationName = null;
            let selectedLat = null;
            let selectedLng = null;
            let searchInput = null; // Référence à l'input de recherche
  
            // Identifier la province à partir des coordonnées via l'API backend
            async function identifyProvince(lat, lng) {
              try {
                const response = await fetch(API_BASE_URL + '/api/geolocalisation/province', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    latitude: lat,
                    longitude: lng
                  })
                });
                
                if (response.ok) {
                  const data = await response.json();
                  return data.province || null;
                }
                return null;
              } catch (error) {
                console.warn('Erreur identification province:', error);
                return null;
              }
            }
  
            // Envoi des coords vers React Native ou Web avec le nom du lieu et la province
            async function sendPositionToRN(lat, lng, locationName) {
              // Stocker les valeurs pour pouvoir les récupérer plus tard
              selectedLat = lat;
              selectedLng = lng;
              
              // Prioriser le nom fourni, sinon utiliser celui de la barre de recherche
              let finalLocationName = searchInput ? searchInput.value : locationName || selectedLocationName || null;
              
              // Nettoyer le locationName
              if (!finalLocationName || 
                  finalLocationName.trim() === '' || 
                  finalLocationName === 'Position sélectionnée' ||
                  finalLocationName.startsWith('Lat:') || 
                  (finalLocationName.includes('Lat:') && finalLocationName.includes('Lng:'))) {
                finalLocationName = null;
              } else {
                finalLocationName = finalLocationName.trim();
              }
              
              if (!finalLocationName) {
                console.warn('⚠️ Pas de locationName valide, envoi des coordonnées uniquement.');
              }
              
              selectedLocationName = finalLocationName;
              
              console.log('📍 sendPositionToRN - finalLocationName:', finalLocationName);
              
              // Identifier la province automatiquement
              const province = await identifyProvince(lat, lng);
              
              const message = {
                type: 'locationSelected',
                lat: lat,
                lng: lng,
                locationName: finalLocationName,
                province: province || null
              };
              
              console.log('📍 sendPositionToRN - message complet:', message);
              
              const messageStr = JSON.stringify(message);
              
              // Pour React Native WebView
              if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
                window.ReactNativeWebView.postMessage(messageStr);
              }
              // Pour Web dans iframe - utiliser window.parent.postMessage
              else if (window.parent && window.parent !== window) {
                window.parent.postMessage(messageStr, '*');
              }
              // Fallback pour le web
              else {
                console.log('Position sélectionnée:', lat, lng, selectedLocationName, 'Province:', province);
              }
            }
  
            // Fonction pour envoyer la position sélectionnée
            function sendSelectedPosition() {
              if (selectedLat !== null && selectedLng !== null) {
                sendPositionToRN(selectedLat, selectedLng, selectedLocationName);
              }
            }
  
            // Exposer la fonction globalement pour qu'elle puisse être appelée
            window.sendSelectedPosition = sendSelectedPosition;
            
            // Stocker les dernières valeurs sélectionnées
            window.getSelectedPosition = function() {
              return {
                lat: selectedLat,
                lng: selectedLng,
                locationName: selectedLocationName
              };
            };
  
            // === MapClickHandler ===
            map.on('click', function(e) {
              const latlng = e.latlng;
              
              // Supprimer l'ancien marqueur vert
              if (selectedMarker) {
                map.removeLayer(selectedMarker);
              }
              
              // Pour un clic direct sur la carte, récupérer le nom via géocodage inverse
              selectedLocationName = null;
              
              // Créer le nouveau marqueur vert
              selectedMarker = L.marker(latlng, { icon: greenIcon }).addTo(map);
              
              // Faire un géocodage inverse
              (async function() {
                try {
                  let formattedAddress = null;
                  
                  // Stratégie 1: Nominatim avec zoom élevé
                  try {
                    const nominatimResponse = await fetch(
                      'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latlng.lat + 
                      '&lon=' + latlng.lng + '&zoom=18&addressdetails=1&accept-language=fr'
                    );
                    if (nominatimResponse.ok) {
                      const nominatimData = await nominatimResponse.json();
                      if (nominatimData && nominatimData.display_name) {
                        formattedAddress = nominatimData.display_name;
                        console.log('✅ Nominatim (zoom 18) - Adresse complète:', formattedAddress);
                      }
                    }
                  } catch (nominatimError) {
                    console.warn('⚠️ Erreur Nominatim (zoom 18):', nominatimError);
                  }
                  
                  // Stratégie 2: Si pas de résultat précis, essayer Photon
                  if (!formattedAddress) {
                    try {
                      const reverseResponse = await fetch(
                        'https://photon.komoot.io/reverse?lat=' + latlng.lat + '&lon=' + latlng.lng + '&lang=fr'
                      );
                      if (reverseResponse.ok) {
                        const reverseData = await reverseResponse.json();
                        if (reverseData.features && reverseData.features.length > 0) {
                          const feature = reverseData.features[0];
                          const props = feature.properties;
                          const parts = [];
                          if (props.name) parts.push(props.name);
                          if (props.street) {
                            if (props.housenumber) parts.push(props.housenumber + ' ' + props.street);
                            else parts.push(props.street);
                          }
                          if (props.city || props.locality) parts.push(props.city || props.locality);
                          if (props.state && props.state !== (props.city || props.locality)) parts.push(props.state);
                          if (props.country) parts.push(props.country);
                          if (parts.length > 0) {
                            formattedAddress = parts.join(', ');
                            console.log('✅ Photon - Adresse formatée:', formattedAddress);
                          }
                        }
                      }
                    } catch (photonError) {
                      console.warn('⚠️ Erreur Photon:', photonError);
                    }
                  }
                  
                  // Stratégie 3: Si toujours pas de résultat, essayer Nominatim avec zoom moyen
                  if (!formattedAddress) {
                    try {
                      const nominatimResponse2 = await fetch(
                        'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + latlng.lat + 
                        '&lon=' + latlng.lng + '&zoom=14&addressdetails=1&accept-language=fr'
                      );
                      if (nominatimResponse2.ok) {
                        const nominatimData2 = await nominatimResponse2.json();
                        if (nominatimData2 && nominatimData2.display_name) {
                          formattedAddress = nominatimData2.display_name;
                          console.log('✅ Nominatim (zoom 14) - Adresse:', formattedAddress);
                        }
                      }
                    } catch (nominatimError2) {
                      console.warn('⚠️ Erreur Nominatim (zoom 14):', nominatimError2);
                    }
                  }
                  
                  // Utiliser l'adresse formatée si disponible
                  if (formattedAddress) {
                    selectedLocationName = formattedAddress;
                    if (searchInput) {
                      searchInput.value = formattedAddress;
                    }
                    console.log('📍 Adresse formatée depuis géocodage inverse:', formattedAddress);
                  } else {
                    selectedLocationName = null;
                    if (searchInput) {
                      searchInput.value = '';
                    }
                    console.log('⚠️ Aucune adresse trouvée via géocodage inverse');
                  }
                  
                  // Mettre à jour le popup avec le nom
                  if (selectedLocationName) {
                    const province = await identifyProvince(latlng.lat, latlng.lng);
                    const provinceText = province ? '<br><small style="color: #6B7F5C; font-weight: 600;">📍 Province: ' + province + '</small>' : '';
                    selectedMarker.bindPopup(
                      '<strong>✓ Position sélectionnée</strong><br>' +
                      '<b>' + selectedLocationName + '</b><br>' +
                      '<small>Lat: ' + latlng.lat.toFixed(6) + '<br>Lng: ' + latlng.lng.toFixed(6) + '</small>' +
                      provinceText
                    ).openPopup();
                    
                    // Envoyer les coordonnées avec le nom récupéré
                    sendPositionToRN(latlng.lat, latlng.lng, selectedLocationName);
                  } else {
                    const province = await identifyProvince(latlng.lat, latlng.lng);
                    const provinceText = province ? '<br><small style="color: #6B7F5C; font-weight: 600;">📍 Province: ' + province + '</small>' : '';
                    selectedMarker.bindPopup(
                      '<strong>⚠️ Adresse non trouvée</strong><br>' +
                      '<small>Veuillez utiliser la barre de recherche pour trouver l\\'adresse complète de ce lieu.</small><br>' +
                      '<small>Lat: ' + latlng.lat.toFixed(6) + '<br>Lng: ' + latlng.lng.toFixed(6) + '</small>' +
                      provinceText
                    ).openPopup();
                    
                    sendPositionToRN(latlng.lat, latlng.lng, null);
                  }
                } catch (e) {
                  console.warn('Erreur géocodage inverse:', e);
                  selectedLocationName = null;
                  if (searchInput) {
                    searchInput.value = '';
                  }
                  
                  identifyProvince(latlng.lat, latlng.lng).then(function(province) {
                    const provinceText = province ? '<br><small style="color: #6B7F5C; font-weight: 600;">📍 Province: ' + province + '</small>' : '';
                    selectedMarker.bindPopup(
                      '<strong>⚠️ Adresse non trouvée</strong><br>' +
                      '<small>Veuillez utiliser la barre de recherche pour trouver l\\'adresse complète de ce lieu.</small><br>' +
                      '<small>Lat: ' + latlng.lat.toFixed(6) + '<br>Lng: ' + latlng.lng.toFixed(6) + '</small>' +
                      provinceText
                    ).openPopup();
                  });
                  
                  sendPositionToRN(latlng.lat, latlng.lng, null);
                }
              })();
              
              // Ajouter événement de clic sur le marqueur
              selectedMarker.on('click', function() {
                sendPositionToRN(latlng.lat, latlng.lng, selectedLocationName);
              });
            });
  
            // === Contrôle géolocalisation (📍) ===
            const LocationControl = L.Control.extend({
              options: {},
              onAdd: function() {
                const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
                const button = L.DomUtil.create('a', '', div);
                button.innerHTML = '📍';
                button.title = 'Ma position';
                button.href = '#';
                button.style.display = 'flex';
                button.style.alignItems = 'center';
                button.style.justifyContent = 'center';
                button.style.width = '30px';
                button.style.height = '30px';
                button.style.fontSize = '16px';
  
                button.addEventListener('click', function(e) {
                  e.preventDefault();
                  map.locate({
                    setView: true,
                    maxZoom: 16,
                    enableHighAccuracy: true,
                  });
                });
  
                map.on('locationfound', function(ev) {
                  const latlng = ev.latlng;
                  
                  if (selectedMarker) {
                    map.removeLayer(selectedMarker);
                  }
                  
                  selectedLocationName = 'Ma position';
                  selectedMarker = L.marker(latlng, { icon: greenIcon }).addTo(map);
                  
                  identifyProvince(latlng.lat, latlng.lng).then(function(province) {
                    const provinceText = province ? '<br><small style="color: #6B7F5C; font-weight: 600;">📍 Province: ' + province + '</small>' : '';
                    selectedMarker.bindPopup('<strong>📍 Ma position</strong>' + provinceText).openPopup();
                  });
                  
                  sendPositionToRN(latlng.lat, latlng.lng, selectedLocationName);
                });
  
                map.on('locationerror', function() {
                  alert('Impossible de récupérer votre position');
                });
  
                return div;
              }
            });
  
            // === Contrôle Zoom ===
            const zoomControl = L.control.zoom({
              position: 'topleft',
            });
  
            // === Contrôle Recherche ===
            const SearchControl = L.Control.extend({
              options: {
                position: 'topright',
              },
              onAdd: function() {
                const wrapper = L.DomUtil.create('div', 'search-wrapper');
                wrapper.style.position = 'relative';
  
                const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control', wrapper);
                container.style.display = 'flex';
                container.style.gap = '5px';
                container.style.padding = '5px';
                container.style.background = 'white';
                container.style.borderRadius = '4px';
  
                const input = L.DomUtil.create('input', '', container);
                input.type = 'text';
                input.placeholder = 'Rechercher une adresse...';
                input.style.padding = '6px';
                input.style.width = '200px';
                input.style.border = '1px solid #ccc';
                input.style.borderRadius = '4px';
  
                const searchButton = L.DomUtil.create('button', '', container);
                searchButton.innerHTML = '🔍';
                searchButton.style.width = '30px';
                searchButton.style.height = '30px';
                searchButton.style.border = '1px solid #ccc';
                searchButton.style.borderRadius = '4px';
                searchButton.style.cursor = 'pointer';
                searchButton.style.display = 'flex';
                searchButton.style.alignItems = 'center';
                searchButton.style.justifyContent = 'center';
  
                // Stocker la référence à l'input
                searchInput = input;
  
                // Liste des résultats
                const resultsList = L.DomUtil.create('div', 'results-list', wrapper);
                resultsList.style.position = 'absolute';
                resultsList.style.top = '40px';
                resultsList.style.left = '0';
                resultsList.style.width = '100%';
                resultsList.style.maxHeight = '300px';
                resultsList.style.overflowY = 'auto';
                resultsList.style.background = 'white';
                resultsList.style.border = '1px solid #ccc';
                resultsList.style.borderRadius = '4px';
                resultsList.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
                resultsList.style.display = 'none';
                resultsList.style.zIndex = '1000';
  
                function hideResults() {
                  resultsList.style.display = 'none';
                  resultsList.innerHTML = '';
                }
  
                function clearSearchMarkers() {
                  searchMarkers.forEach(function(m) {
                    map.removeLayer(m);
                  });
                  searchMarkers = [];
                }
  
                function showResults(results) {
                  resultsList.innerHTML = '';
                  resultsList.style.display = 'block';
                  
                  clearSearchMarkers();
  
                  var bounds = [];
                  
                  results.forEach(function(result, index) {
                    const lat = result.geometry.lat;
                    const lng = result.geometry.lng;
                    const latlng = L.latLng(lat, lng);
                    
                    const marker = L.marker(latlng, { icon: redIcon }).addTo(map);
                    marker.bindPopup('<strong>' + result.formatted + '</strong>');
                    searchMarkers.push(marker);
                    bounds.push(latlng);
  
                    const item = L.DomUtil.create('div', 'result-item', resultsList);
                    item.style.padding = '10px';
                    item.style.borderBottom = '1px solid #eee';
                    item.style.cursor = 'pointer';
                    item.style.fontSize = '13px';
  
                    var icon = '📍';
                    if (result.isOrganisme || result.class === 'amenity' || result.type === 'office' || result.type === 'company') icon = '🏢';
                    else if (result.class === 'building' || result.type === 'building') icon = '🏛️';
                    else if (result.class === 'shop' || result.type === 'shop') icon = '🏪';
                    else if (result.class === 'tourism' || result.type === 'hotel') icon = '🏨';
                    else if (result.type === 'city' || result.type === 'town') icon = '🏙️';
  
                    const displayName = result.name || result.formatted || 'Sans nom';
                    const locationInfo = [
                      result.components.city,
                      result.components.province,
                      result.components.country
                    ].filter(Boolean).join(', ');
  
                    item.innerHTML = 
                      '<div style="display: flex; align-items: start; gap: 8px; padding: 4px 0;">' +
                      '<span style="font-size: 20px; flex-shrink: 0;">' + icon + '</span>' +
                      '<div style="flex: 1; min-width: 0;">' +
                      '<strong style="font-size: 14px; display: block; margin-bottom: 2px; color: #333;">' + displayName + '</strong>' +
                      (locationInfo ? '<small style="color: #666; font-size: 11px; display: block;">' + locationInfo + '</small>' : '') +
                      '</div>' +
                      '</div>';
  
                    item.addEventListener('mouseover', function() {
                      item.style.background = '#f0f0f0';
                      marker.openPopup();
                      map.panTo(latlng);
                    });
  
                    item.addEventListener('mouseout', function() {
                      item.style.background = 'white';
                      marker.closePopup();
                    });
  
                    item.addEventListener('click', function() {
                      hideResults();
                      
                      clearSearchMarkers();
                      
                      if (selectedMarker) {
                        map.removeLayer(selectedMarker);
                      }
                      
                      selectedLocationName = result.formatted || result.name || input.value;
                      
                      input.value = selectedLocationName;
                      console.log('📍 Nom du lieu mis à jour:', selectedLocationName);
                      
                      selectedMarker = L.marker(latlng, { icon: greenIcon }).addTo(map);
                      
                      selectedMarker.on('click', function() {
                        sendPositionToRN(lat, lng, selectedLocationName);
                      });
                      
                      const zoomLevel = result.type === 'city' || result.type === 'town' ? 13 : 
                                       result.type === 'state' || result.type === 'region' ? 10 : 17;
                      map.flyTo(latlng, zoomLevel, {
                        duration: 1.5,
                        easeLinearity: 0.5
                      });
                      
                      setTimeout(async function() {
                        const province = await identifyProvince(lat, lng);
                        const provinceText = province ? '<br><small style="color: #6B7F5C; font-weight: 600;">📍 Province: ' + province + '</small>' : '';
                        
                        const popupContent = '<strong>✓ Position sélectionnée</strong><br>' + 
                          '<b>' + selectedLocationName + '</b><br>' + 
                          '<small style="color: #666;">Lat: ' + lat.toFixed(6) + ', Lng: ' + lng.toFixed(6) + '</small>' +
                          provinceText + '<br>' +
                          '<small style="color: #666;">Cliquez sur le marqueur pour confirmer</small>';
                        selectedMarker.bindPopup(popupContent).openPopup();
                      }, 1600);
                      
                      setTimeout(function() {
                        sendPositionToRN(lat, lng, selectedLocationName);
                      }, 100);
                    });
                  });
  
                  if (bounds.length > 0) {
                    map.fitBounds(bounds, { padding: [50, 50] });
                  }
                }
  
                async function performSearch() {
                  const query = input.value.trim();
                  if (!query) {
                    hideResults();
                    return;
                  }
  
                  try {
                    const organismesMaroc = ${organismesJson};
  
                    const queryUpper = query.toUpperCase();
                    let organismeResults = [];
                    
                    Object.keys(organismesMaroc).forEach(key => {
                      if (key.toUpperCase().includes(queryUpper) || 
                          organismesMaroc[key].name.toUpperCase().includes(queryUpper)) {
                        const org = organismesMaroc[key];
                        organismeResults.push({
                          formatted: org.name + ', ' + org.city + ', Maroc',
                          geometry: {
                            lat: org.lat,
                            lng: org.lng
                          },
                          components: {
                            city: org.city,
                            province: org.city,
                            country: 'Maroc'
                          },
                          type: 'office',
                          class: 'amenity',
                          source: 'organismes',
                          isOrganisme: true
                        });
                      }
                    });
  
                    function formatAddress(properties) {
                      const parts = [];
                      if (properties.name) parts.push(properties.name);
                      if (properties.housenumber && properties.street) {
                        parts.push(properties.housenumber + ' ' + properties.street);
                      } else if (properties.street) {
                        parts.push(properties.street);
                      }
                      if (properties.district && properties.district !== properties.city) {
                        parts.push(properties.district);
                      }
                      if (properties.city) parts.push(properties.city);
                      if (properties.state && properties.state !== properties.city) {
                        parts.push(properties.state);
                      }
                      if (properties.country && !properties.country.toLowerCase().includes('maroc')) {
                        parts.push(properties.country);
                      }
                      
                      return parts.length > 0 ? parts.join(', ') : (properties.name || query);
                    }
  
                    const queryVariants = [
                      query,
                      query + " Maroc",
                      query + " Morocco",
                    ];
  
                    const photonSearches = queryVariants.map(variant =>
                      fetch("https://photon.komoot.io/api/?q=" + encodeURIComponent(variant) + "&limit=30&lang=fr", {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                          'Accept': 'application/json'
                        }
                      })
                        .then(r => {
                          if (!r.ok) {
                            throw new Error('Photon API error: ' + r.status);
                          }
                          return r.json();
                        })
                        .then(data => {
                          if (data.features && data.features.length > 0) {
                            return data.features
                              .filter(f => {
                                const country = (f.properties.country || '').toLowerCase();
                                const countryCode = (f.properties.countrycode || '').toLowerCase();
                                const lon = f.geometry.coordinates[0];
                                const lat = f.geometry.coordinates[1];
                                
                                const isMorocco = country.includes('maroc') || 
                                                 country.includes('morocco') ||
                                                 countryCode === 'ma';
                                
                                const isInMoroccoBounds = lat >= 21 && lat <= 36 && lon >= -17 && lon <= -1;
                                
                                return isMorocco || isInMoroccoBounds;
                              })
                              .map(f => {
                                return {
                                  formatted: formatAddress(f.properties),
                                  geometry: {
                                    lat: f.geometry.coordinates[1],
                                    lng: f.geometry.coordinates[0]
                                  },
                                  components: {
                                    city: f.properties.city || f.properties.district || '',
                                    province: f.properties.state || '',
                                    country: f.properties.country || 'Maroc'
                                  },
                                  type: f.properties.type || 'place',
                                  class: f.properties.osm_value || 'place',
                                  source: 'photon',
                                  name: f.properties.name || '',
                                  street: f.properties.street || '',
                                  housenumber: f.properties.housenumber || ''
                                };
                              });
                          }
                          return [];
                        })
                        .catch(err => {
                          console.warn('Erreur Photon:', err);
                          return [];
                        })
                    );
  
                    const nominatimSearches = queryVariants.map(variant =>
                      fetch("https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(variant) + "&format=json&limit=20&countrycodes=ma&accept-language=fr&addressdetails=1", {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                          'Accept': 'application/json',
                          'User-Agent': 'LaureatApp/1.0'
                        }
                      })
                        .then(r => {
                          if (!r.ok) {
                            throw new Error('Nominatim API error: ' + r.status);
                          }
                          return r.json();
                        })
                        .then(data => {
                          if (Array.isArray(data) && data.length > 0) {
                            return data.map(item => {
                              if (!item.display_name) return null;
                              
                              const addr = item.address || {};
                              const parts = [];
                              
                              if (item.display_name.includes(item.name || '')) {
                                parts.push(item.name || item.display_name.split(',')[0]);
                              }
                              
                              if (addr.road) {
                                if (addr.house_number) {
                                  parts.push(addr.house_number + ' ' + addr.road);
                                } else {
                                  parts.push(addr.road);
                                }
                              }
                              
                              if (addr.quarter && addr.quarter !== addr.city) {
                                parts.push(addr.quarter);
                              }
                              
                              if (addr.city || addr.town || addr.village) {
                                parts.push(addr.city || addr.town || addr.village);
                              }
                              
                              if (addr.state && addr.state !== (addr.city || addr.town || addr.village)) {
                                parts.push(addr.state);
                              }
                              
                              const formatted = parts.length > 0 ? parts.join(', ') : item.display_name;
                              
                              return {
                                formatted: formatted,
                                geometry: {
                                  lat: parseFloat(item.lat),
                                  lng: parseFloat(item.lon)
                                },
                                components: {
                                  city: addr.city || addr.town || addr.village || '',
                                  province: addr.state || addr.region || '',
                                  country: addr.country || 'Maroc'
                                },
                                type: item.type || 'place',
                                class: item.class || 'place',
                                source: 'nominatim',
                                name: item.name || item.display_name.split(',')[0] || '',
                                street: addr.road || '',
                                housenumber: addr.house_number || ''
                              };
                            }).filter(Boolean);
                          }
                          return [];
                        })
                        .catch(err => {
                          console.warn('Erreur Nominatim:', err);
                          return [];
                        })
                    );
  
                    const searches = [
                      Promise.resolve(organismeResults),
                      ...photonSearches,
                      ...nominatimSearches
                    ];
  
                    const allResults = await Promise.all(searches);
                    const combined = allResults.flat();
  
                    combined.sort((a, b) => {
                      if (a.isOrganisme && !b.isOrganisme) return -1;
                      if (!a.isOrganisme && b.isOrganisme) return 1;
                      return 0;
                    });
  
                    const unique = [];
                    const seenCoords = new Set();
                    const seenNames = new Set();
                    
                    combined.forEach(r => {
                      const coordKey = r.geometry.lat.toFixed(4) + ',' + r.geometry.lng.toFixed(4);
                      const nameKey = (r.name || r.formatted || '').toLowerCase().trim();
                      
                      const isDuplicateByCoord = seenCoords.has(coordKey);
                      const isDuplicateByName = nameKey && seenNames.has(nameKey);
                      
                      if (!isDuplicateByCoord && !isDuplicateByName) {
                        seenCoords.add(coordKey);
                        if (nameKey) seenNames.add(nameKey);
                        unique.push(r);
                      }
                    });
  
                    if (unique.length === 0) {
                      resultsList.innerHTML = '<div style="padding: 10px; color: #999;">Aucun résultat trouvé. Essayez un autre terme.</div>';
                      resultsList.style.display = 'block';
                      return;
                    }
  
                    showResults(unique.slice(0, 20));
                  } catch (error) {
                    console.error("Erreur lors de la recherche:", error);
                    resultsList.innerHTML = '<div style="padding: 10px; color: #f44336;">Erreur de recherche. Réessayez.</div>';
                    resultsList.style.display = 'block';
                  }
                }
  
                searchButton.addEventListener('click', function(e) {
                  e.preventDefault();
                  performSearch();
                });
  
                input.addEventListener('keyup', function(e) {
                  if (e.key === 'Enter') {
                    performSearch();
                  }
                });
  
                document.addEventListener('click', function(e) {
                  if (!wrapper.contains(e.target)) {
                    hideResults();
                  }
                });
  
                L.DomEvent.disableClickPropagation(wrapper);
                L.DomEvent.disableScrollPropagation(wrapper);
  
                return wrapper;
              }
            });
  
            map.addControl(zoomControl);
            map.addControl(new SearchControl());
          }
          initMap();
        })();
      </script>
    </body>
  </html>
  `;
    },
    [organismesMaroc, API_BASE_URL]
  );

  const handleMessage = (event: any) => {
    try {
      const data = typeof event === 'string' 
        ? JSON.parse(event) 
        : JSON.parse(event.nativeEvent?.data || event.data || '{}');
      if (data.type === "locationSelected") {
        const { lat, lng, locationName } = data;
        console.log("📍 Message reçu dans LocationMapModal:", { lat, lng, locationName });
        console.log("📍 Type de locationName reçu:", typeof locationName);
        console.log("📍 locationName valeur brute:", locationName);
        // S'assurer que locationName est bien passé (pas undefined, pas null, pas vide, pas "Position sélectionnée")
        // Si locationName est valide, le passer tel quel, sinon passer undefined
        const finalLocationName = (locationName && typeof locationName === 'string' && locationName.trim() && locationName.trim() !== "Position sélectionnée")
          ? locationName.trim()
          : undefined;
        console.log("📍 finalLocationName qui sera passé à onSelect:", finalLocationName);
        onSelect([lat, lng], finalLocationName);
      }
    } catch (e) {
      console.warn("Message WebView invalide", e);
    }
  };

  // Gestion du message pour le web (iframe)
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      const handleWindowMessage = (event: MessageEvent) => {
        if (event.data && typeof event.data === 'object' && event.data.type === "locationSelected") {
          handleMessage(event.data);
        } else if (typeof event.data === 'string') {
          try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === "locationSelected") {
              handleMessage(parsed);
            }
          } catch (e) {
            // Ignorer les messages non JSON
          }
        }
      };
      window.addEventListener('message', handleWindowMessage);
      return () => window.removeEventListener('message', handleWindowMessage);
    }
  }, [visible]);

  // Pour le web, créer l'iframe dynamiquement
  useEffect(() => {
    if (Platform.OS === 'web' && visible) {
      // Utiliser un timeout pour s'assurer que le DOM est monté
      const timeoutId = setTimeout(() => {
        const container = document.getElementById(mapContainerIdRef.current) as HTMLElement;
        if (container) {
          console.log("📍 Création de l'iframe pour la carte - container trouvé:", !!container);
          
          // Créer l'iframe
          const iframe = document.createElement('iframe');
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.border = 'none';
          iframe.srcdoc = html;
          iframe.title = 'Carte de géolocalisation';
          iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms allow-popups');
          
          // Vider le conteneur et ajouter l'iframe
          container.innerHTML = '';
          container.appendChild(iframe);
          console.log("✅ Iframe créée et ajoutée au container");
        } else {
          console.warn("⚠️ Container avec id", mapContainerIdRef.current, "non trouvé, impossible de créer l'iframe");
        }
      }, 200); // Délai pour s'assurer que le DOM est monté
      
      // Nettoyage
      return () => {
        clearTimeout(timeoutId);
        const container = document.getElementById(mapContainerIdRef.current) as HTMLElement;
        if (container) {
          const iframe = container.querySelector('iframe');
          if (iframe && container.contains(iframe)) {
            container.removeChild(iframe);
            console.log("🧹 Iframe supprimée");
          }
        }
      };
    }
  }, [html, visible]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      transparent
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Localisation de votre lieu de travail</Text>
              <Text style={styles.subtitle}>🔍 Recherchez l'adresse ou cliquez sur la carte</Text>
            </View>
            <TouchableOpacity onPress={() => {
              // Envoyer les informations du marqueur sélectionné avant de fermer
              if (Platform.OS === 'web') {
                // Pour le web, accéder à l'iframe et appeler la fonction
                const container = document.getElementById(mapContainerIdRef.current) as HTMLElement;
                const iframe = container?.querySelector('iframe');
                if (iframe && iframe.contentWindow) {
                  try {
                    // @ts-ignore - getSelectedPosition est ajouté dynamiquement dans le HTML
                    const position = (iframe.contentWindow as any).getSelectedPosition?.();
                    if (position && position.lat !== null && position.lng !== null) {
                      onSelect([position.lat, position.lng], position.locationName);
                    }
                  } catch (e) {
                    console.warn('Erreur récupération position:', e);
                  }
                }
              } else if (webViewRef.current) {
                // Pour React Native, injecter du JavaScript pour récupérer la position
                webViewRef.current.injectJavaScript(`
                  (function() {
                    if (window.getSelectedPosition) {
                      const pos = window.getSelectedPosition();
                      if (pos && pos.lat !== null && pos.lng !== null) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                          type: 'locationSelected',
                          lat: pos.lat,
                          lng: pos.lng,
                          locationName: pos.locationName
                        }));
                      }
                    }
                  })();
                `);
              }
              onClose();
            }}>
              <Text style={styles.closeText}>Valider</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mapContainer}>
            {Platform.OS === 'web' ? (
              <View 
                nativeID={mapContainerIdRef.current}
                style={[styles.mapContainer, { minHeight: 400 }]}
              />
            ) : WebView ? (
              <WebView
                ref={webViewRef}
                originWhitelist={["*"]}
                source={{ html }}
                style={{ flex: 1, backgroundColor: 'transparent' }}
                onMessage={handleMessage}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                onError={(syntheticEvent: any) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                }}
                onHttpError={(syntheticEvent: any) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView HTTP error: ', nativeEvent);
                }}
                onLoadStart={() => console.log('WebView load start')}
                onLoadEnd={() => console.log('WebView load end')}
              />
            ) : (
              <View style={styles.mapContainer}>
                <Text style={styles.errorText}>
                  WebView non disponible sur cette plateforme
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default LocationMapModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "95%",
    height: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  closeText: {
    color: "#007BFF",
    fontWeight: "600",
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
  },
  errorText: {
    textAlign: 'center',
    color: '#f44336',
    padding: 20,
  },
});