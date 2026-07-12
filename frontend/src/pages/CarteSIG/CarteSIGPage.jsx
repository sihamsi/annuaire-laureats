// CarteSIGPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Filter,
  Layers,
  Maximize2,
  Navigation,
  Mail,
  Phone,
  MapPinned,
} from "lucide-react";
import AppNavbar from "../../components/common/Navbar/AppNavbar";
import { API_BASE_URL } from "../../api/http";
import {
  getAllFiltres,
  getGeolocalisationLaureats,
  getLaureats,
  getOrganismes,
} from "../../api/laureats.api";

/** -----------------------------
 * Helpers (filtres robustes)
 * ----------------------------- */
const normalize = (v) => (v ?? "").toString().trim().toLowerCase();

const FILIERE_LABELS = {
  gc: "Génie civil",
  ge: "Génie électrique",
  gi: "Génie informatique",
  glt: "Génie logistique et transports",
  ihe: "Ingénierie hydraulique et environnement",
  sig: "Sciences de l'Information Géographique (SIG / Géomatique)",
  ive: "Ingénierie (IVE)",
  met: "MET",
  materialse: "MaterialSE",
  mathse: "MathSE",
};

function mapFiliere(raw) {
  const key = normalize(raw);
  if (!key) return "";
  if (FILIERE_LABELS[key]) return FILIERE_LABELS[key];
  return raw.toString().trim();
}

function normSecteur(raw) {
  const k = normalize(raw);
  if (!k) return "";
  if (k === "public") return "public";
  if (k === "prive" || k === "privé") return "prive";
  if (k.includes("pub")) return "public";
  if (k.includes("priv")) return "prive";
  return k;
}

function normGenre(raw) {
  const k = normalize(raw);
  if (!k) return "";
  if (["m", "h", "homme", "masculin"].includes(k)) return "m";
  if (["f", "femme", "féminin", "feminin"].includes(k)) return "f";
  return k;
}

/** -----------------------------
 * Couleurs stables
 * ----------------------------- */
const FILIERE_COLORS = {
  "Génie informatique": "#6B7F5C",
  "Génie civil": "#8A9B7A",
  "Génie électrique": "#556448",
  "Sciences de l'Information Géographique (SIG / Géomatique)": "#4F6B2B",
  "Ingénierie hydraulique et environnement": "#6B7F5C",
  "Génie logistique et transports": "#8A9B7A",
};
const getColorByFiliere = (filiereLabel) =>
  FILIERE_COLORS[filiereLabel] || "#6B7F5C";

/** ✅ Fond ESRI (Topographic) */
const ESRI_TOPO =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}";

/**
 * ✅ IMPORTANT POUR LE HOVER (popup ne disparaît plus)
 * Ajoute CE CSS une seule fois dans ton fichier global (App.css / index.css):
 *
 * html, body, #root { height: 100%; }
 * .custom-marker div { transition: transform .2s ease; }
 * .custom-marker:hover div { transform: scale(1.2); z-index: 1000; }
 */

const CarteSIGPage = () => {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const markerClusterGroupRef = useRef(null);
  const markersMapRef = useRef(new Map());
  const lastLocationParamsRef = useRef(null);

  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ ID sélectionné (envoyé depuis l'annuaire via ?laureatId=...)
  const selectedLaureatId = searchParams.get("laureatId");

  // Désactiver GeoServer par défaut pour éviter les erreurs 403 si non disponible
  const [showProvinces] = useState(false); // GeoServer désactivé par défaut
  const [showMarkers] = useState(true);

  const [filters, setFilters] = useState({
    filiere: searchParams.get("filiere") || "",
    promotion: searchParams.get("promotion") || "",
    secteur: searchParams.get("secteur") || "",
    genre: searchParams.get("genre") || "",
    province: searchParams.get("province") || "",
    search: searchParams.get("search") || "",
  });

  const [laureats, setLaureats] = useState([]);
  const [filteredLaureats, setFilteredLaureats] = useState([]);

  const [filieres, setFilieres] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ UI: full screen + panneau détail laureat
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [selectedLaureat, setSelectedLaureat] = useState(null);

  const GEOSERVER_CONFIG = {
    url: "http://localhost:8080/geoserver",
    workspace: "EHTP",
    layerProvinces: "Provinces",
    layerMaroc: "maroc_boundary",
  };

  const addGeoServerLayers = useCallback(
    (map, L) => {
      // Ne charger les couches GeoServer que si elles sont activées
      // et si GeoServer est configuré (pour éviter les erreurs 403)
      if (!showProvinces) {
        return; // GeoServer désactivé, utiliser uniquement le fond ESRI
      }

      try {
        // Vérifier si GeoServer est disponible avant d'ajouter les couches
        // Les erreurs 403 seront gérées silencieusement par Leaflet
        
        const provincesLayer = L.tileLayer.wms(`${GEOSERVER_CONFIG.url}/wms`, {
          layers: `${GEOSERVER_CONFIG.workspace}:${GEOSERVER_CONFIG.layerProvinces}`,
          format: "image/png",
          transparent: true,
          version: "1.1.0",
          attribution: "GeoServer - Provinces Maroc",
          // Image transparente pour les tuiles en erreur
          errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        });

        const marocLayer = L.tileLayer.wms(`${GEOSERVER_CONFIG.url}/wms`, {
          layers: `${GEOSERVER_CONFIG.workspace}:${GEOSERVER_CONFIG.layerMaroc}`,
          format: "image/png",
          transparent: true,
          version: "1.1.0",
          attribution: "GeoServer - Maroc",
          // Image transparente pour les tuiles en erreur
          errorTileUrl: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        });

        // Gérer les erreurs de chargement silencieusement
        provincesLayer.on('tileerror', (error, tile) => {
          // Ignorer silencieusement les erreurs (GeoServer non disponible ou 403)
          // Ne pas afficher dans la console
        });

        marocLayer.on('tileerror', (error, tile) => {
          // Ignorer silencieusement les erreurs (GeoServer non disponible ou 403)
          // Ne pas afficher dans la console
        });

        marocLayer.addTo(map);
        provincesLayer.addTo(map);

        map.provincesLayer = provincesLayer;
        map.marocLayer = marocLayer;
      } catch (e) {
        // Ignorer silencieusement si GeoServer n'est pas disponible
        // La carte fonctionnera toujours avec le fond ESRI
      }
    },
    [showProvinces]
  );

  const initializeMap = useCallback(() => {
    if (!mapRef.current || leafletMapRef.current || !window.L) return;

    const L = window.L;

    const map = L.map(mapRef.current, {
      center: [31.7917, -7.0926],
      zoom: 6,
      zoomControl: false,
    });

    leafletMapRef.current = map;

    /** ✅ ESRI fond */
    L.tileLayer(ESRI_TOPO, { attribution: "Tiles © Esri", maxZoom: 19 }).addTo(
      map
    );

    addGeoServerLayers(map, L);

    L.control.zoom({ position: "topright" }).addTo(map);
  }, [addGeoServerLayers]);

  /** ✅ Load Leaflet et Leaflet.markercluster */
  useEffect(() => {
    const loadLeafletAndCluster = () => {
      if (!window.L) {
        const leafletCSS = document.createElement("link");
        leafletCSS.rel = "stylesheet";
        leafletCSS.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(leafletCSS);

        const leafletJS = document.createElement("script");
        leafletJS.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        leafletJS.onload = () => loadMarkerCluster();
        document.body.appendChild(leafletJS);
      } else {
        loadMarkerCluster();
      }
    };

    const loadMarkerCluster = () => {
      if (window.L && window.L.markerClusterGroup) {
        initializeMap();
        return;
      }

      if (!document.querySelector('link[href*="leaflet.markercluster"]')) {
        const clusterCSS = document.createElement("link");
        clusterCSS.rel = "stylesheet";
        clusterCSS.href =
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css";
        document.head.appendChild(clusterCSS);

        const clusterDefaultCSS = document.createElement("link");
        clusterDefaultCSS.rel = "stylesheet";
        clusterDefaultCSS.href =
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css";
        document.head.appendChild(clusterDefaultCSS);
      }

      if (!document.querySelector('script[src*="leaflet.markercluster"]')) {
        const clusterJS = document.createElement("script");
        clusterJS.src =
          "https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js";
        clusterJS.onload = () => initializeMap();
        document.body.appendChild(clusterJS);
      } else if (window.L && window.L.markerClusterGroup) {
        initializeMap();
      }
    };

    loadLeafletAndCluster();

    return () => {
      if (markerClusterGroupRef.current && leafletMapRef.current) {
        try {
          leafletMapRef.current.removeLayer(markerClusterGroupRef.current);
        } catch (e) {
          console.warn("Erreur nettoyage cluster:", e);
        }
        markerClusterGroupRef.current = null;
      }

      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (e) {
          console.warn("Erreur nettoyage carte:", e);
        }
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** ✅ Load data */
  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [filtresRes, laureatsRes, organismesRes, geoRes] =
          await Promise.all([
            getAllFiltres(),
            getLaureats(),
            getOrganismes(),
            getGeolocalisationLaureats(),
          ]);

        const fdata = filtresRes.data || {};
        setFilieres((fdata.filieres || []).map(mapFiliere).filter(Boolean));
        setPromotions(fdata.promotions || []);
        setSecteurs((fdata.secteurs || []).map(normSecteur).filter(Boolean));
        setProvinces(fdata.provinces || []);

        const rawLaureats = Array.isArray(laureatsRes.data)
          ? laureatsRes.data
          : laureatsRes.data?.content || [];
        const laureatsMap = new Map(rawLaureats.map((l) => [l.id, l]));

        const organismes = Array.isArray(organismesRes.data)
          ? organismesRes.data
          : [];
        const organismesMap = new Map(
          organismes.map((org) => [org.id, org.nom])
        );

        const geoList = Array.isArray(geoRes.data) ? geoRes.data : [];

        const normalized = geoList.map((geo) => {
          const base = laureatsMap.get(geo.id) || {};
          const fullname = `${base.prenom || geo.prenom || ""} ${
            base.nom || geo.nom || ""
          }`.trim();

          let photoUrl = base.photoUrl || base.photo;
          // Si pas de photoUrl, générer le nom de fichier au format Prenom_Nom.png
          if (!photoUrl && fullname) {
            const nom = (base.nom || geo.nom || "").trim();
            const prenom = (base.prenom || geo.prenom || "").trim();
            // Format: Prenom_Nom.png (ex: Karim_Tazi.png)
            if (nom && prenom) photoUrl = `${prenom}_${nom}.png`;
          }
          const resolvedPhoto = photoUrl && photoUrl.trim() !== ""
            ? photoUrl.startsWith("http")
              ? photoUrl
              : photoUrl.startsWith("/")
              ? `${API_BASE_URL}${photoUrl}`
              : `${API_BASE_URL}/api/laureats/photo/${photoUrl}`
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                fullname
              )}`;

          const filiereLabel = mapFiliere(base.filiere ?? geo.filiere);
          const secteurNorm = normSecteur(base.secteur ?? geo.secteur);
          const genreNorm = normGenre(base.genre ?? geo.genre);

          return {
            ...base,
            ...geo,
            organisme:
              base.autreOrganisme ||
              organismesMap.get(base.organismeId) ||
              base.organisme ||
              "",
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
      } catch (err) {
        if (!cancelled) setError("Impossible de charger les données.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  /** ✅ Filtrage robuste */
  useEffect(() => {
    let filtered = laureats;

    if (filters.search) {
      const s = normalize(filters.search);
      filtered = filtered.filter(
        (l) =>
          normalize(l.nom).includes(s) ||
          normalize(l.prenom).includes(s) ||
          normalize(l.email).includes(s)
      );
    }

    if (filters.filiere) {
      const f = normalize(filters.filiere);
      filtered = filtered.filter((l) => normalize(l.filiereLabel) === f);
    }

    if (filters.promotion) {
      filtered = filtered.filter(
        (l) => String(l.promotion) === String(filters.promotion)
      );
    }

    if (filters.secteur) {
      const s = normSecteur(filters.secteur);
      filtered = filtered.filter((l) => l.secteurNorm === s);
    }

    if (filters.genre) {
      const g = normGenre(filters.genre);
      filtered = filtered.filter((l) => l.genreNorm === g);
    }

    if (filters.province) {
      filtered = filtered.filter(
        (l) => normalize(l.province) === normalize(filters.province)
      );
    }

    setFilteredLaureats(filtered);
  }, [filters, laureats]);

  /** ✅ helper: récupérer le lauréat depuis l'id */
  const resolveSelectedFromId = useCallback(
    (id) => {
      if (!id) return null;
      return (
        laureats.find((l) => String(l.id) === String(id)) ||
        filteredLaureats.find((l) => String(l.id) === String(id)) ||
        null
      );
    },
    [laureats, filteredLaureats]
  );

  /** ✅ Mettre à jour panneau détails si laureatId dans URL */
  useEffect(() => {
    if (!selectedLaureatId) {
      setSelectedLaureat(null);
      return;
    }
    const found = resolveSelectedFromId(selectedLaureatId);
    setSelectedLaureat(found);
  }, [selectedLaureatId, resolveSelectedFromId]);

  /** ✅ Update markers after filtering + marker rouge pour l'ID sélectionné */
  useEffect(() => {
    if (!leafletMapRef.current || !window.L || !window.L.markerClusterGroup) {
      return;
    }

    try {
      const map = leafletMapRef.current;
      const L = window.L;

      if (!L || !L.markerClusterGroup) return;

      if (markerClusterGroupRef.current) {
        map.removeLayer(markerClusterGroupRef.current);
        markerClusterGroupRef.current = null;
      }

      markersRef.current.forEach((m) => map.removeLayer(m));
      markersRef.current = [];
      markersMapRef.current.clear();

      if (!showMarkers) return;

      const markerClusterGroup = L.markerClusterGroup({
        chunkedLoading: true,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 15,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount();
          let size = "small";
          if (count > 100) size = "large";
          else if (count > 50) size = "medium";

          return L.divIcon({
            html: `<div style="
              background: #4F6B2B;
              color: white;
              border-radius: 50%;
              width: ${
                size === "large" ? "50px" : size === "medium" ? "45px" : "40px"
              };
              height: ${
                size === "large" ? "50px" : size === "medium" ? "45px" : "40px"
              };
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-size: ${
                size === "large" ? "16px" : size === "medium" ? "14px" : "12px"
              };
              border: 3px solid white;
              box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            ">${count}</div>`,
            className: "marker-cluster-custom",
            iconSize: L.point(
              size === "large" ? 50 : size === "medium" ? 45 : 40,
              size === "large" ? 50 : size === "medium" ? 45 : 40
            ),
          });
        },
      });

      filteredLaureats.forEach((laureat) => {
        if (!Number.isFinite(laureat.lat) || !Number.isFinite(laureat.lon))
          return;

        const isSelected =
          selectedLaureatId && String(laureat.id) === String(selectedLaureatId);

        const baseColor = getColorByFiliere(laureat.filiereLabel);
        const markerColor = isSelected ? "#DC2626" : baseColor;
        const size = isSelected ? 46 : 40;
        const border = isSelected ? 5 : 4;

        const shadow = isSelected
          ? "0 6px 12px rgba(220,38,38,0.45)"
          : "0 4px 6px rgba(0,0,0,0.3)";

        const ring = isSelected
          ? `box-shadow: 0 0 0 6px rgba(220,38,38,0.22), ${shadow};`
          : `box-shadow: ${shadow};`;

        const customIcon = L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: ${size}px;
              height: ${size}px;
              background: ${markerColor};
              border: ${border}px solid white;
              border-radius: 50%;
              ${ring}
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transform: translateZ(0);
            ">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size],
          popupAnchor: [0, -size],
        });

        const marker = L.marker([laureat.lat, laureat.lon], {
          icon: customIcon,
        });

        marker.bindPopup(`
          <div style="min-width: 220px; font-family: system-ui;">
            <div style="font-weight: 700; font-size: 16px; color: #1f2937; margin-bottom: 8px;">
              ${laureat.prenom ?? ""} ${laureat.nom ?? ""}
            </div>
            <div style="color: #6b7280; margin-bottom: 4px;">
              <strong>Filière:</strong> ${
                laureat.filiereLabel ?? laureat.filiere ?? ""
              }
            </div>
            <div style="color: #6b7280; margin-bottom: 4px;">
              <strong>Promotion:</strong> ${laureat.promotion ?? ""}
            </div>
            <div style="color: #6b7280; margin-bottom: 4px;">
              <strong>Secteur:</strong> ${
                laureat.secteurNorm === "public"
                  ? "Public"
                  : laureat.secteurNorm === "prive"
                  ? "Privé"
                  : laureat.secteur ?? ""
              }
            </div>
            <div style="color: #6b7280; margin-bottom: 4px;">
              <strong>Organisme:</strong> ${laureat.organisme ?? ""}
            </div>
            <div style="color: ${baseColor}; font-weight: 700;">
              📍 ${laureat.province ?? ""}
            </div>
          </div>
        `);

        // ✅ Click marker => set panel + update URL + open popup
        marker.on("click", function (e) {
          e.originalEvent?.stopPropagation?.();
          marker.openPopup();

          setSelectedLaureat(laureat);

          const params = new URLSearchParams(searchParams);
          params.set("laureatId", String(laureat.id));
          params.set("lat", String(laureat.lat));
          params.set("lon", String(laureat.lon));
          setSearchParams(params, { replace: true });
        });

        markersMapRef.current.set(laureat.id, marker);
        markerClusterGroup.addLayer(marker);
        markersRef.current.push(marker);
      });

      markerClusterGroup.on("clusterclick", function (a) {
        const cluster = a.layer;
        const markers = cluster.getAllChildMarkers();
        if (markers.length <= 10) cluster.spiderfy();
      });

      markerClusterGroup.addTo(map);
      markerClusterGroupRef.current = markerClusterGroup;

      // ✅ Centrer sur un lauréat spécifique si params présents
      const latParam = searchParams.get("lat");
      const lonParam = searchParams.get("lon");
      const laureatIdParam = searchParams.get("laureatId");

      if (latParam && lonParam && laureatIdParam) {
        const lat = parseFloat(latParam);
        const lon = parseFloat(lonParam);
        const laureatId = Number(laureatIdParam);

        if (
          Number.isFinite(lat) &&
          Number.isFinite(lon) &&
          Number.isFinite(laureatId)
        ) {
          setTimeout(() => {
            try {
              const targetMarker = markersMapRef.current.get(laureatId);
              if (targetMarker && markerClusterGroup) {
                // Vérifier que le marqueur est dans le cluster avant de zoomer
                const hasMarker = markerClusterGroup.hasLayer(targetMarker);
                if (hasMarker) {
                  markerClusterGroup.zoomToShowLayer(targetMarker, () => {
                    map.setView([lat, lon], 15, { animate: true, duration: 0.8 });
                    setTimeout(() => {
                      try {
                        if (targetMarker && map.hasLayer(targetMarker)) {
                          targetMarker.openPopup();
                        }
                      } catch (e) {
                        console.warn("Erreur openPopup:", e);
                      }
                    }, 1200);
                  });
                } else {
                  // Si le marqueur n'est pas dans le cluster, centrer directement
                  map.setView([lat, lon], 15, { animate: true, duration: 0.8 });
                  setTimeout(() => {
                    try {
                      if (targetMarker) {
                        targetMarker.openPopup();
                      }
                    } catch (e) {
                      console.warn("Erreur openPopup:", e);
                    }
                  }, 800);
                }
              } else if (targetMarker) {
                // Si pas de cluster mais marqueur existe, centrer directement
                map.setView([lat, lon], 15, { animate: true, duration: 0.8 });
                setTimeout(() => {
                  try {
                    targetMarker.openPopup();
                  } catch (e) {
                    console.warn("Erreur openPopup:", e);
                  }
                }, 800);
              }
            } catch (e) {
              console.error("Erreur centrage marqueur:", e);
            }
          }, 500);
        }
      }
    } catch (e) {
      console.error("Erreur lors de la mise à jour des marqueurs:", e);
    }
  }, [
    filteredLaureats,
    showMarkers,
    searchParams,
    selectedLaureatId,
    setSearchParams,
  ]);

  /** ✅ Écouter les changements de searchParams pour centrer la carte */
  useEffect(() => {
    const map = leafletMapRef.current;
    if (
      !map ||
      !window.L ||
      !window.L.markerClusterGroup ||
      !markerClusterGroupRef.current
    )
      return;

    const latParam = searchParams.get("lat");
    const lonParam = searchParams.get("lon");
    const laureatIdParam = searchParams.get("laureatId");

    const locationKey = `${latParam}_${lonParam}_${laureatIdParam}`;

    if (
      latParam &&
      lonParam &&
      laureatIdParam &&
      lastLocationParamsRef.current !== locationKey
    ) {
      lastLocationParamsRef.current = locationKey;

      const lat = parseFloat(latParam);
      const lon = parseFloat(lonParam);
      const laureatId = Number(laureatIdParam);

      if (
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        Number.isFinite(laureatId)
      ) {
        let timeoutId;
        let popupTimeoutId;

        try {
          timeoutId = setTimeout(() => {
            try {
              const targetMarker = markersMapRef.current.get(laureatId);
              if (targetMarker && markerClusterGroupRef.current && map) {
                // Vérifier que le marqueur est dans le cluster avant de zoomer
                const hasMarker = markerClusterGroupRef.current.hasLayer(targetMarker);
                if (hasMarker) {
                  markerClusterGroupRef.current.zoomToShowLayer(
                    targetMarker,
                    () => {
                      map.setView([lat, lon], 15, {
                        animate: true,
                        duration: 0.8,
                      });
                      popupTimeoutId = setTimeout(() => {
                        try {
                          if (targetMarker && map.hasLayer(targetMarker)) {
                            targetMarker.openPopup();
                          }
                        } catch (e) {
                          console.warn("Erreur openPopup:", e);
                        }
                      }, 1200);
                    }
                  );
                } else {
                  // Si le marqueur n'est pas dans le cluster, centrer directement
                  map.setView([lat, lon], 15, { animate: true, duration: 0.8 });
                  popupTimeoutId = setTimeout(() => {
                    try {
                      if (targetMarker) {
                        targetMarker.openPopup();
                      }
                    } catch (e) {
                      console.warn("Erreur openPopup:", e);
                    }
                  }, 800);
                }
              } else if (targetMarker && map) {
                // Si pas de cluster mais marqueur existe, centrer directement
                map.setView([lat, lon], 15, { animate: true, duration: 0.8 });
                popupTimeoutId = setTimeout(() => {
                  try {
                    targetMarker.openPopup();
                  } catch (e) {
                    console.warn("Erreur openPopup:", e);
                  }
                }, 800);
              }
            } catch (e) {
              console.error("Erreur centrage:", e);
            }
          }, 1500);
        } catch (e) {
          console.error("Erreur timeout:", e);
        }

        return () => {
          if (timeoutId) clearTimeout(timeoutId);
          if (popupTimeoutId) clearTimeout(popupTimeoutId);
        };
      }
    } else if (!latParam && !lonParam && !laureatIdParam) {
      lastLocationParamsRef.current = null;
    }
  }, [searchParams]);

  /** ✅ invalidateSize quand layout change */
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;
    const t = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {}
    }, 150);
    return () => clearTimeout(t);
  }, [isFullScreen]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetView = () => {
    leafletMapRef.current?.setView([31.7917, -7.0926], 6);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppNavbar />

      <div className="flex-1 pt-24">
        {loading && (
          <div className="mx-6 mb-4 bg-white rounded-xl shadow-sm p-4 text-gray-700">
            Chargement des données cartographiques…
          </div>
        )}
        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
            {error}
          </div>
        )}

        <div className="w-full px-6 pb-6">
          <div className="flex gap-6" style={{ height: "calc(100vh - 110px)" }}>
            {/* ✅ Sidebar gauche (cachée en fullscreen) */}
            {!isFullScreen && (
              <div className="w-[380px] shrink-0 overflow-y-auto space-y-6">
                {/* ✅ Détails du lauréat sélectionné */}
                {selectedLaureat && (
                  <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={selectedLaureat.photo}
                        alt={`${selectedLaureat.prenom || ""} ${
                          selectedLaureat.nom || ""
                        }`}
                        className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          const fullName = `${selectedLaureat.prenom || ""} ${
                            selectedLaureat.nom || ""
                          }`.trim();
                          e.currentTarget.src = `https://ui-avatars.com/api/?background=0D8A3B&color=fff&name=${encodeURIComponent(
                            fullName || "User"
                          )}`;
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 text-lg truncate">
                          {selectedLaureat.prenom} {selectedLaureat.nom}
                        </div>
                        <div className="text-sm text-gray-500 truncate">
                          {selectedLaureat.filiereLabel ||
                            selectedLaureat.filiere ||
                            "—"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Promo: {selectedLaureat.promotion || "—"}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPinned className="w-4 h-4 text-gray-400" />
                        <span>{selectedLaureat.province || "—"}</span>
                      </div>

                      {selectedLaureat.email && (
                        <div className="flex items-center gap-2 text-gray-700 break-all">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{selectedLaureat.email}</span>
                        </div>
                      )}

                      
                      <div className="pt-3 flex gap-2">
                        <button
                          onClick={() => {
                            if (
                              Number.isFinite(selectedLaureat.lat) &&
                              Number.isFinite(selectedLaureat.lon)
                            ) {
                              leafletMapRef.current?.setView(
                                [selectedLaureat.lat, selectedLaureat.lon],
                                15,
                                { animate: true, duration: 0.8 }
                              );
                            }
                          }}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow"
                        >
                          Recentrer
                        </button>

                        <button
                          onClick={() => {
                            const params = new URLSearchParams(searchParams);
                            params.delete("laureatId");
                            params.delete("lat");
                            params.delete("lon");
                            setSearchParams(params, { replace: true });
                            setSelectedLaureat(null);
                          }}
                          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold"
                        >
                          Effacer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ✅ Filtres */}
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
                        onChange={(e) =>
                          handleFilterChange("promotion", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                      >
                        <option value="">Toutes</option>
                        {promotions.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        FILIÈRE
                      </label>
                      <select
                        value={filters.filiere}
                        onChange={(e) =>
                          handleFilterChange("filiere", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                      >
                        <option value="">Toutes</option>
                        {filieres.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        SECTEUR
                      </label>
                      <select
                        value={filters.secteur}
                        onChange={(e) =>
                          handleFilterChange("secteur", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                      >
                        <option value="">Tous</option>
                        {(secteurs.length ? secteurs : ["public", "prive"]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {s === "public"
                                ? "Public"
                                : s === "prive"
                                ? "Privé"
                                : s}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                        PROVINCE
                      </label>
                      <select
                        value={filters.province}
                        onChange={(e) =>
                          handleFilterChange("province", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none bg-white font-medium"
                      >
                        <option value="">Toutes</option>
                        {provinces.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => {}}
                    className="w-full bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg"
                  >
                    Appliquer les filtres
                  </button>
                </div>

                {/* ✅ Légende */}
                <div className="bg-white rounded-2xl shadow-xl p-5 border border-gray-200">
                  <h3 className="font-bold text-black mb-4 flex items-center text-lg">
                    <Layers className="mr-2 text-primary" size={22} />
                    Légende
                  </h3>
                  <div className="space-y-3">
                    {filieres.map((filiere, idx) => {
                      const count = filteredLaureats.filter(
                        (l) => normalize(l.filiereLabel) === normalize(filiere)
                      ).length;
                      if (count === 0) return null;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center">
                            <div
                              className="w-5 h-5 rounded-full mr-3 shadow-md border-2 border-white"
                              style={{
                                backgroundColor: getColorByFiliere(filiere),
                              }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {filiere}
                            </span>
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
            )}

            {/* ✅ Carte prend tout l’espace */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 h-full">
                <div className="bg-primary px-6 py-4 flex justify-between items-center">
                  <div className="text-white">
                    <div className="font-bold text-lg">
                      Carte Interactive du Maroc
                    </div>
                    <div className="text-sm opacity-90">
                      Cliquez sur un marqueur pour plus d&apos;informations
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={resetView}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
                      title="Recentrer"
                    >
                      <Navigation size={20} />
                    </button>

                    <button
                      onClick={() => setIsFullScreen((v) => !v)}
                      className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center text-white transition-all"
                      title="Plein écran"
                    >
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>

                <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarteSIGPage;
