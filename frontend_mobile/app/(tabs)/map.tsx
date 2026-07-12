import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Header from "../../components/Header";
// La carte est accessible sans authentification
// import { useAuth } from "../../contexts/AuthContext";
import { useFilters } from "../../contexts/FiltersContext";
import { Colors, Spacing, BorderRadius, Shadows, Typography } from "../../constants/theme";
import { normalize, mapFiliere, normSecteur, normGenre, getColorByFiliere } from "../../utils/helpers";
import { getAllFiltres } from "../../services/filtres.api";
import { getLaureats, getLaureatsByStatut } from "../../services/laureats.api";
import { getOrganismes } from "../../services/organismes.api";
import { getGeolocalisationLaureats } from "../../services/geolocalisation.api";
import { API_BASE_URL } from "../../services/api";

// Import conditionnel de WebView (uniquement pour mobile natif)
let WebView: any = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require("react-native-webview").WebView;
  } catch (e) {
    console.warn("WebView non disponible");
  }
}

export default function MapScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  // La carte est accessible sans authentification
  // const { isAuthenticated } = useAuth();
  const { filters: sharedFilters } = useFilters();
  
  const [laureats, setLaureats] = useState<any[]>([]);
  const [filteredLaureats, setFilteredLaureats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // ✅ ID sélectionné (envoyé depuis l'annuaire via params)
  const selectedLaureatId = params.laureatId ? String(params.laureatId) : null;

  // Référence pour le conteneur de la carte sur le web
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // ✅ 1) Charger les données (accessible sans authentification)
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [filtresRes, laureatsRes, organismesRes, geoRes] = await Promise.all([
          getAllFiltres(),
          getLaureatsByStatut("published"), // ✅ Seulement les lauréats publiés (validés)
          getOrganismes(),
          getGeolocalisationLaureats(true), // publishedOnly = true
        ]);

        const fdata = filtresRes || {};
        
        // Type guard pour gérer les différents formats de réponse
        let rawLaureats: any[] = [];
        if (Array.isArray(laureatsRes)) {
          rawLaureats = laureatsRes;
        } else if (laureatsRes && typeof laureatsRes === 'object') {
          rawLaureats = (laureatsRes as any).data || (laureatsRes as any).content || [];
        }
        const laureatsMap = new Map(rawLaureats.map((l: any) => [l.id, l]));

        const organismes = Array.isArray(organismesRes) ? organismesRes : [];
        const organismesMap = new Map(organismes.map((org: any) => [org.id, org.nom]));

        const geoList = Array.isArray(geoRes) ? geoRes : [];

        // ✅ Fusionner les données géographiques avec les données de base (identique au web)
        const normalized = geoList.map((geo: any) => {
          const base: any = laureatsMap.get(geo.id) || {};
          const fullname = `${base.prenom || geo.prenom || ""} ${base.nom || geo.nom || ""}`.trim();

          const photoUrl = base.photoUrl || base.photo;
          const resolvedPhoto = photoUrl
            ? photoUrl.startsWith("http")
              ? photoUrl
              : photoUrl.startsWith("/")
              ? `${API_BASE_URL}${photoUrl}`
              : `${API_BASE_URL}/${photoUrl}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(fullname)}`;

          const filiereLabel = mapFiliere(base.filiere ?? geo.filiere);
          const secteurNorm = normSecteur(base.secteur ?? geo.secteur);
          const genreNorm = normGenre(base.genre ?? geo.genre);

          // Priorité: autreOrganisme > organisme_nom (depuis API) > organisme depuis organismeId > organisme depuis base
          const organismeName = geo.autre_organisme || 
                               geo.organisme_nom || 
                               base.autreOrganisme || 
                               organismesMap.get(base.organismeId) || 
                               base.organisme || 
                               "";

          return {
            ...base,
            ...geo,
            organisme: organismeName,
            province: geo.province || base.province || "",
            lat: Number(geo.latitude ?? base.latitude),
            lon: Number(geo.longitude ?? base.longitude),
            photo: resolvedPhoto,
            filiereLabel,
            secteurNorm,
            genreNorm,
          };
        });

        if (!cancelled) {
          setLaureats(normalized);
          setFilteredLaureats(normalized);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError("Impossible de charger les données.");
          console.error("Erreur chargement carte:", err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, [sharedFilters, selectedLaureatId]);

  // ✅ 2) Filtrage (identique au web)
  useEffect(() => {
    let filtered = laureats;

    if (sharedFilters.filiere) {
      const f = normalize(sharedFilters.filiere);
      filtered = filtered.filter((l: any) => normalize(l.filiereLabel) === f);
    }

    if (sharedFilters.promotion) {
      filtered = filtered.filter(
        (l: any) => String(l.promotion) === String(sharedFilters.promotion)
      );
    }

    if (sharedFilters.secteur) {
      const s = normSecteur(sharedFilters.secteur);
      filtered = filtered.filter((l: any) => l.secteurNorm === s);
    }

    if (sharedFilters.genre) {
      const g = normGenre(sharedFilters.genre);
      filtered = filtered.filter((l: any) => l.genreNorm === g);
    }

    if (sharedFilters.province) {
      filtered = filtered.filter(
        (l: any) => normalize(l.province) === normalize(sharedFilters.province)
      );
    }

    if (sharedFilters.organisme) {
      filtered = filtered.filter(
        (l: any) => normalize(l.organisme || "") === normalize(sharedFilters.organisme || "")
      );
    }

    setFilteredLaureats(filtered);
  }, [sharedFilters, laureats]);


  // ✅ Générer le HTML de la carte (identique au web : ESRI + Clusters + Marqueurs personnalisés + Rouge pour sélectionné)
  const mapHTML = useMemo(() => {
    const points = filteredLaureats
      .filter((l) => l.lat && l.lon && !isNaN(Number(l.lat)) && !isNaN(Number(l.lon)))
      .map((l) => ({
      id: l.id,
        lat: Number(l.lat || l.latitude),
        lng: Number(l.lon || l.longitude),
        prenom: l.prenom || "",
        nom: l.nom || "",
        filiere: l.filiereLabel || l.filiere || "",
        promotion: l.promotion || "",
        secteur: l.secteurNorm || l.secteur || "",
        organisme: l.organisme || "",
        province: l.province || "",
        isSelected: selectedLaureatId && String(l.id) === String(selectedLaureatId),
      }));

    // Couleurs par filière (identique au web)
    const filiereColors: Record<string, string> = {
      "Génie informatique": "#6B7F5C",
      "Génie civil": "#8A9B7A",
      "Génie électrique": "#556448",
      "Sciences de l'Information Géographique (SIG / Géomatique)": "#6B7F5C", // --color-primary
      "Ingénierie hydraulique et environnement": "#6B7F5C",
      "Génie logistique et transports": "#8A9B7A",
    };
    const getColorByFiliereFn = (filiere: string): string => {
      return filiereColors[filiere] || "#6B7F5C";
    };

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css" />
<style>
    body { margin: 0; padding: 0; overflow: hidden; }
    #map { width: 100%; height: 100vh; }
    .custom-marker div { transition: transform .2s ease; }
    .custom-marker:hover div { transform: scale(1.2); z-index: 1000; }
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
<script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
<script>
    var API_BASE_URL = '${API_BASE_URL}';
    var ESRI_TOPO = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

  var map = L.map('map', {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: true
    });
    
    L.tileLayer(ESRI_TOPO, {
      attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      maxZoom: 19
    }).addTo(map);
    
    // ✅ Charger et afficher la couche des provinces du Maroc
    fetch(API_BASE_URL + '/api/geolocalisation/provinces/geojson')
      .then(function(response) {
        return response.json();
      })
      .then(function(geojson) {
        if (geojson && geojson.features && geojson.features.length > 0) {
          var provincesLayer = L.geoJSON(geojson, {
            style: function(feature) {
              return {
                color: '#6B7F5C',        // Couleur des bordures (vert principal)
                weight: 1.5,              // Épaisseur des bordures
                fillColor: '#8A9B7A',     // Couleur de remplissage (vert clair)
                fillOpacity: 0.2,         // Transparence du remplissage (20%)
                opacity: 0.8               // Transparence des bordures (80%)
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
    
    var points = ${JSON.stringify(points)};
    var filiereColors = ${JSON.stringify(filiereColors)};
    
    function getColorByFiliere(filiere) {
      return filiereColors[filiere] || "#6B7F5C";
    }
    
    // Fonction pour retirer le préfixe "Province " d'un nom de province
    function formatProvinceName(province) {
      if (!province) return "";
      return province.replace(/^Province\s+/i, '').trim();
    }
    
    var markerClusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 15,
      iconCreateFunction: function(cluster) {
        const count = cluster.getChildCount();
        let size = "small";
        if (count > 100) size = "large";
        else if (count > 50) size = "medium";

        return L.divIcon({
          html: '<div style="background: #6B7F5C; color: white; border-radius: 50%; width: ' + // --color-primary 
            (size === "large" ? "50px" : size === "medium" ? "45px" : "40px") + 
            '; height: ' + (size === "large" ? "50px" : size === "medium" ? "45px" : "40px") + 
            '; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: ' + 
            (size === "large" ? "16px" : size === "medium" ? "14px" : "12px") + 
            '; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">' + count + '</div>',
          className: 'marker-cluster-custom',
          iconSize: L.point(
            size === "large" ? 50 : size === "medium" ? 45 : 40,
            size === "large" ? 50 : size === "medium" ? 45 : 40
          )
        });
      }
    });
    
    points.forEach(function(p) {
      const baseColor = getColorByFiliere(p.filiere);
      const markerColor = p.isSelected ? "#DC2626" : baseColor;
      const size = p.isSelected ? 46 : 40;
      const border = p.isSelected ? 5 : 4;
      const shadow = p.isSelected ? "0 6px 12px rgba(220,38,38,0.45)" : "0 4px 6px rgba(0,0,0,0.3)";
      const ring = p.isSelected ? "box-shadow: 0 0 0 6px rgba(220,38,38,0.22), " + shadow + ";" : "box-shadow: " + shadow + ";";

      const customIcon = L.divIcon({
        className: "custom-marker",
        html: '<div style="width: ' + size + 'px; height: ' + size + 'px; background: ' + markerColor + 
          '; border: ' + border + 'px solid white; border-radius: 50%; ' + ring + 
          ' display: flex; align-items: center; justify-content: center; cursor: pointer; transform: translateZ(0);">' +
            '<svg width="24" height="24" viewBox="0 0 24 24" fill="white">' +
              '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>' +
          '</svg></div>',
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size]
      });
      
      const secteurText = p.secteur === "public" ? "Public" : p.secteur === "prive" ? "Privé" : p.secteur || "";
      const popupHTML = '<div style="min-width: 220px; font-family: system-ui;">' +
        '<div style="font-weight: 700; font-size: 16px; color: #1f2937; margin-bottom: 8px;">' + (p.prenom + " " + p.nom).trim() + '</div>' +
        '<div style="color: #6b7280; margin-bottom: 4px;"><strong>Filière:</strong> ' + p.filiere + '</div>' +
        '<div style="color: #6b7280; margin-bottom: 4px;"><strong>Promotion:</strong> ' + p.promotion + '</div>' +
        '<div style="color: #6b7280; margin-bottom: 4px;"><strong>Secteur:</strong> ' + secteurText + '</div>' +
        '<div style="color: #6b7280; margin-bottom: 4px;"><strong>Organisme:</strong> ' + p.organisme + '</div>' +
        '<div style="color: ' + baseColor + '; font-weight: 700;">📍 ' + formatProvinceName(p.province) + '</div>' +
        '</div>';
      
      const marker = L.marker([p.lat, p.lng], {
        icon: customIcon
      }).bindPopup(popupHTML, {
        maxWidth: 280,
        className: 'custom-popup'
      });
      
      // Le popup Leaflet s'ouvre automatiquement au clic - pas besoin de handler supplémentaire
      
      markerClusterGroup.addLayer(marker);
    });
    
    map.addLayer(markerClusterGroup);
    
    // ✅ Centrer sur le lauréat sélectionné si présent (priorité)
    const selectedPoint = points.find(function(p) { return p.isSelected; });
    if (selectedPoint) {
      setTimeout(function() {
        map.setView([selectedPoint.lat, selectedPoint.lng], 15, { animate: true, duration: 0.8 });
      }, 500);
    }
    // Sinon, la carte reste centrée sur le Maroc (coordonnées initiales : [31.7917, -7.0926], zoom: 6)
</script>
</body>
</html>
    `;
  }, [filteredLaureats, selectedLaureatId, API_BASE_URL]);

  // Initialiser la carte sur le web
  useEffect(() => {
    if (Platform.OS === 'web' && !loading && mapContainerRef.current) {
      const iframe = document.createElement('iframe');
      iframe.style.width = '100%';
      iframe.style.height = '100%';
      iframe.style.border = 'none';
      iframe.srcdoc = mapHTML;
      
      const container = mapContainerRef.current;
      container.innerHTML = '';
      container.appendChild(iframe);

      return () => {
        if (container && container.contains(iframe)) {
          container.removeChild(iframe);
        }
      };
    }
  }, [mapHTML, loading, Platform.OS]);


  return (
    <View style={styles.container}>
      <Header title="Carte des lauréats" />
      
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="map" size={48} color={Colors.gray400} />
            <Text style={styles.loadingText}>Carte interactive</Text>
            <Text style={styles.loadingSubtext}>Géolocalisation des lauréats</Text>
            <ActivityIndicator size="large" color={Colors.secondary} style={{ marginTop: Spacing.lg }} />
          </View>
        ) : error ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="alert-circle" size={48} color={Colors.error} />
            <Text style={styles.loadingText}>{error}</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          <View 
            ref={mapContainerRef as any}
            style={styles.webview}
          />
        ) : WebView ? (
          <WebView
            source={{ html: mapHTML }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
          />
        ) : (
          <View style={styles.loadingContainer}>
            <Ionicons name="map" size={48} color={Colors.gray400} />
            <Text style={styles.loadingText}>Carte non disponible</Text>
            <Text style={styles.loadingSubtext}>WebView non supporté sur cette plateforme</Text>
            </View>
          )}
        
        <Pressable 
          style={styles.filterButton}
          onPress={() => router.push("/(tabs)/filters")}
        >
          <Ionicons name="filter" size={20} color={Colors.secondary} />
        </Pressable>
        
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.infoCount}>{filteredLaureats.length} lauréats</Text>
            <Text style={styles.infoLabel}>affichés sur la carte</Text>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.gray600,
    marginTop: Spacing.md,
  },
  loadingSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray500,
    marginTop: Spacing.xs,
  },
  webview: { 
    flex: 1,
  },
  filterButton: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  infoCard: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray800,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray500,
  },
});