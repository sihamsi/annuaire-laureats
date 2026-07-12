// src/pages/annuaire/AnnuairePage.jsx  (TON FICHIER COMPLET, corrigé pour restriction)
// ⚠️ J’ai gardé 100% ton code, mais:
// ✅ 1) auth vient de useAuth()
// ✅ 2) si non connecté => colonne "Détails" devient "Localisation" (carte)
// ✅ 3) modal details n’existe QUE si connecté
import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Users,
  Filter,
  Download,
  Mail,
  Phone,
  MapPinned,
  CheckCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  Navigation,
} from "lucide-react";

import AppNavbar from "../../components/common/Navbar/AppNavbar";
import { useAuth } from "../../context/AuthContext";

import { API_BASE_URL } from "../../api/http";
import {
  getAllFiltres,
  getGeolocalisationLaureats,
  getOrganismes,
  getLaureatsByStatut,
} from "../../api/laureats.api";

import logoAlumni from "../../assets/styles/logo-ehtp.png";

/** ✅ Helpers */
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

const AnnuairePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [laureats, setLaureats] = useState([]);
  const [filteredLaureats, setFilteredLaureats] = useState([]);

  const [filieres, setFilieres] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [secteurs, setSecteurs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    filiere: searchParams.get("filiere") || "",
    promotion: searchParams.get("promotion") || "",
    secteur: searchParams.get("secteur") || "",
    genre: searchParams.get("genre") || "",
    province: searchParams.get("province") || "",
    search: searchParams.get("search") || "",
  });

  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ✅ Modal details
  const [selected, setSelected] = useState(null);

  // ✅ Selection pour export PDF
  const [selectedIds, setSelectedIds] = useState(new Set());

  const resolvePhotoUrl = (photoUrl, fallbackName) => {
    if (photoUrl) {
      // Si c'est déjà une URL complète, la retourner telle quelle
      if (photoUrl.startsWith("http")) return photoUrl;
      
      // Si ça commence par /, utiliser tel quel
      if (photoUrl.startsWith("/")) {
        // Si c'est déjà /api/laureats/photo/, utiliser tel quel
        if (photoUrl.startsWith("/api/laureats/photo/")) {
          return `${API_BASE_URL}${photoUrl}`;
        }
        // Sinon, essayer de construire l'URL correcte
        const filename = photoUrl.replace(/^\/+/, ""); // Enlever les / au début
        return `${API_BASE_URL}/api/laureats/photo/${filename}`;
      }
      
      // Si c'est juste un nom de fichier (ex: "Gvvs_Ccc.png")
      // Utiliser l'endpoint /api/laureats/photo/
      return `${API_BASE_URL}/api/laureats/photo/${photoUrl}`;
    }

    if (fallbackName) {
      const parts = fallbackName.trim().split(/\s+/);
      if (parts.length >= 2) {
        const prenom = parts[0];
        const nom = parts[parts.length - 1];
        // Format: Prenom_Nom.png (ex: Karim_Tazi.png)
        const filename1 = `${prenom}_${nom}.png`;
        return `${API_BASE_URL}/api/laureats/photo/${filename1}`;
      }
    }

    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fallbackName || "User"
    )}`;
  };

  /** ✅ 1) Charger filtres + laureats */
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        const [filtresRes, publishedRes, pendingRes, organismesRes, geoRes] =
          await Promise.all([
            getAllFiltres(),
            getLaureatsByStatut("published"),
            getLaureatsByStatut("pending"),
            getOrganismes(),
            getGeolocalisationLaureats(),
          ]);

        const fdata = filtresRes.data || {};

        setFilieres((fdata.filieres || []).map(mapFiliere).filter(Boolean));
        setProvinces(fdata.provinces || []);
        setPromotions(fdata.promotions || []);
        setSecteurs((fdata.secteurs || []).map(normSecteur).filter(Boolean));

        const organismes = Array.isArray(organismesRes.data)
          ? organismesRes.data
          : [];
        const organismesMap = new Map(
          organismes.map((org) => [org.id, org.nom])
        );

        const geoList = Array.isArray(geoRes.data) ? geoRes.data : [];
        const provinceMap = new Map(
          geoList.map((item) => [item.id, item.province])
        );
        const geoCoordsMap = new Map(
          geoList.map((item) => [
            item.id,
            { lat: Number(item.latitude), lon: Number(item.longitude) },
          ])
        );

        const normalizeLaureats = (list) =>
          list.map((l) => {
            const fullname = `${l.prenom || ""} ${l.nom || ""}`.trim();

            let photoUrl = l.photoUrl || l.photo;
            if (!photoUrl && fullname) {
              const nom = (l.nom || "").trim();
              const prenom = (l.prenom || "").trim();
              // Format: Prenom_Nom.png (ex: Karim_Tazi.png)
              if (nom && prenom) photoUrl = `${prenom}_${nom}.png`;
            }

            const organismeNom =
              l.autreOrganisme ||
              organismesMap.get(l.organismeId) ||
              l.organisme ||
              "";

            const filiereLabel = mapFiliere(l.filiere);
            const secteurNorm = normSecteur(l.secteur);
            const genreNorm = normGenre(l.genre);

            const geoCoords = geoCoordsMap.get(l.id);
            const lat = geoCoords?.lat || Number(l.latitude || l.lat);
            const lon = geoCoords?.lon || Number(l.longitude || l.lon);

            return {
              ...l,
              organisme: organismeNom,
              province: l.province || provinceMap.get(l.id) || "",
              filiereLabel,
              secteurNorm,
              genreNorm,
              photo: resolvePhotoUrl(photoUrl, fullname),
              lat: Number.isFinite(lat) ? lat : null,
              lon: Number.isFinite(lon) ? lon : null,
            };
          });

        const publishedList = Array.isArray(publishedRes.data)
          ? publishedRes.data
          : [];
        const pendingList = Array.isArray(pendingRes.data)
          ? pendingRes.data
          : [];

        const allLaureats = [
          ...normalizeLaureats(publishedList).map((l) => ({
            ...l,
            status: "published",
          })),
          ...normalizeLaureats(pendingList).map((l) => ({
            ...l,
            status: "pending",
          })),
        ];

        setLaureats(allLaureats);
        setFilteredLaureats(allLaureats);
      } catch (e) {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /** ✅ 2) Filtrage */
  useEffect(() => {
    let filtered = laureats;

    if (filters.search) {
      const s = normalize(filters.search);
      filtered = filtered.filter(
        (l) =>
          normalize(l.nom).includes(s) ||
          normalize(l.prenom).includes(s) ||
          normalize(l.email).includes(s) ||
          normalize(l.description || "").includes(s)
      );
    }

    if (filters.filiere) {
      const f = normalize(filters.filiere);
      filtered = filtered.filter(
        (l) =>
          normalize(l.filiereLabel) === f ||
          normalize(mapFiliere(l.filiere)) === f
      );
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
    setCurrentPage(1);
  }, [filters, laureats]);

  /** ✅ 3) Sync URL */
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      filiere: "",
      promotion: "",
      secteur: "",
      genre: "",
      province: "",
      search: "",
    });
    setCurrentPage(1);
  };

  // Pagination
  const totalPages = Math.ceil(filteredLaureats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLaureats = filteredLaureats.slice(startIndex, endIndex);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ✅ Selection helpers
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ✅ Select all ONLY on current page
  const selectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected =
        paginatedLaureats.length > 0 &&
        paginatedLaureats.every((l) => next.has(l.id));

      if (allSelected) paginatedLaureats.forEach((l) => next.delete(l.id));
      else paginatedLaureats.forEach((l) => next.add(l.id));

      return next;
    });
  };

  // ✅ Select all results
  const selectAllResults = () => {
    setSelectedIds(new Set(filteredLaureats.map((l) => l.id)));
  };

  const unselectAllResults = () => setSelectedIds(new Set());

  // ✅ PDF Export (inchangé)
  const imageToDataUrl = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = reject;
      img.src = src;
    });

  const exportSelectedToPDF = async () => {
    const selectedRows = laureats.filter((l) => selectedIds.has(l.id));

    if (!selectedRows.length) {
      alert("Veuillez sélectionner au moins un lauréat à exporter.");
      return;
    }

    // ✅ 1) Landscape = beaucoup plus lisible pour 9 colonnes
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const BRAND = { r: 79, g: 107, b: 43 };
    const SOFT = { r: 245, g: 247, b: 243 };

    let logoDataUrl = null;
    try {
      logoDataUrl = await imageToDataUrl(logoAlumni);
    } catch {
      logoDataUrl = null;
    }

    const today = new Date();
    const dateStr = today.toLocaleDateString("fr-FR");

    // ✅ Header
    const drawHeader = () => {
      doc.setFillColor(BRAND.r, BRAND.g, BRAND.b);
      doc.rect(0, 0, pageWidth, 22, "F");

      if (logoDataUrl) doc.addImage(logoDataUrl, "PNG", 10, 4, 14, 14);

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Export Annuaire des Lauréats", 28, 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Généré le : ${dateStr}`, pageWidth - 10, 14, {
        align: "right",
      });

      doc.setFillColor(SOFT.r, SOFT.g, SOFT.b);
      doc.rect(0, 22, pageWidth, 9, "F");

      doc.setTextColor(40, 40, 40);
      doc.setFontSize(9);
      doc.text(`Nombre de profils exportés : ${selectedRows.length}`, 10, 28);
    };

    // ✅ Footer
    const drawFooter = (pageNumber, totalPagesCount) => {
      doc.setDrawColor(220);
      doc.line(10, pageHeight - 12, pageWidth - 10, pageHeight - 12);

      doc.setFontSize(8);
      doc.setTextColor(90);
      doc.text("Contacts", 10, pageHeight - 8);

      doc.setTextColor(60);
      doc.text(
        "EHTP Alumni • contact@ehtp.ac.ma • +212 520 42 08 12",
        10,
        pageHeight - 4.5
      );

      doc.setTextColor(120);
      doc.text(
        `Page ${pageNumber}/${totalPagesCount}`,
        pageWidth - 10,
        pageHeight - 4.5,
        {
          align: "right",
        }
      );
    };

    const rows = selectedRows.map((l, idx) => [
      String(idx + 1),
      `${l.prenom || ""} ${l.nom || ""}`.trim() || "—",
      l.email || "—",
      l.filiereLabel || l.filiere || "—",
      l.promotion ? String(l.promotion) : "—",
      l.organisme || "—",
      l.status === "published" ? "Publié" : "En attente",
    ]);

    autoTable(doc, {
      startY: 34,

      head: [
        [
          "#",
          "Nom & Prénom",
          "Email",
          "Filière",
          "Promotion",
          "Organisme",
          "Statut",
        ],
      ],

      body: rows,

      // ✅ 2) Style + tailles (plus compact et stable)
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: { top: 1.2, right: 1.4, bottom: 1.2, left: 1.4 }, // ✅ padding plus fin
        valign: "middle",
        overflow: "linebreak",
      },

      headStyles: {
        fillColor: [BRAND.r, BRAND.g, BRAND.b],
        textColor: 255,
        fontStyle: "bold",
        halign: "center",
      },

      alternateRowStyles: { fillColor: [248, 248, 248] },

      // ✅ 3) Marges adaptées (header/footer)
      margin: { left: 10, right: 10, top: 34, bottom: 16 },

      // ✅ 4) Largeurs fixes -> plus de "Promotio\nn" etc.
      columnStyles: {
        0: { cellWidth: 8, halign: "center" }, // #
        1: { cellWidth: 34, halign: "left" }, // Nom & Prénom
        2: { cellWidth: 60, halign: "left" }, // Email
        3: { cellWidth: 60, halign: "left" }, // Filière
        4: { cellWidth: 20, halign: "center" }, // Promotion
        5: { cellWidth: 55, halign: "left" }, // Organisme
        6: { cellWidth: 22, halign: "center" }, // Statut
      },

      // ✅ 5) IMPORTANT : header/footer dessinés au bon moment
      didDrawPage: (data) => {
        drawHeader();
        const total = doc.getNumberOfPages();
        drawFooter(data.pageNumber, total);
      },
    });

    doc.save(`Annuaire_EHTP_Selection_${dateStr.replaceAll("/", "-")}.pdf`);
  };


  return (
    <div className="min-h-screen bg-white">
      <AppNavbar />

      <main className="w-full mx-auto px-6 py-8 pt-24">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-4xl font-serif text-black">
            Annuaire des Lauréats
          </h1>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 shadow"
            >
              <Filter className="w-4 h-4" />
              <span>
                {showFilters ? "Masquer filtres" : "Afficher filtres"}
              </span>
            </button>

            <button
              onClick={selectAllResults}
              className="flex items-center gap-2 bg-white text-green-800 px-4 py-2 rounded-full border border-green-200 hover:bg-green-50 shadow"
              title="Sélectionner tous les résultats (toutes les pages)"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Tout sélectionner</span>
            </button>

            <button
              onClick={unselectAllResults}
              className="flex items-center gap-2 bg-white text-green-800 px-4 py-2 rounded-full border border-green-200 hover:bg-green-50 shadow"
              title="Tout désélectionner"
            >
              <X className="w-4 h-4" />
              <span>Tout désélectionner</span>
            </button>

            <button
              onClick={exportSelectedToPDF}
              className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 shadow"
              title="Exporter la sélection en PDF"
            >
              <Download className="w-4 h-4" />
              <span>Exporter ({selectedIds.size})</span>
            </button>
          </div>
        </div>

        {loading && (
          <div className="mb-4 p-3 rounded bg-gray-50 border text-gray-700">
            Chargement…
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border text-red-700">
            {error}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-black text-lg flex items-center gap-2">
                <Filter className="w-5 h-5 text-green-700" />
                <span>Filtres de recherche</span>
              </h3>
              <button
                onClick={resetFilters}
                className="text-sm text-green-700 hover:text-green-900 font-semibold"
              >
                Réinitialiser tous les filtres
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  <Search className="w-4 h-4 inline mr-1" />
                  Recherche globale
                </label>
                <input
                  type="text"
                  placeholder="Nom, prénom, email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Filière
                </label>
                <select
                  value={filters.filiere}
                  onChange={(e) =>
                    handleFilterChange("filiere", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none"
                >
                  <option value="">Toutes les filières</option>
                  {filieres.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Promotion
                </label>
                <select
                  value={filters.promotion}
                  onChange={(e) =>
                    handleFilterChange("promotion", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none"
                >
                  <option value="">Toutes</option>
                  {(promotions.length
                    ? promotions
                    : ["2019", "2020", "2021", "2022", "2023"]
                  ).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Secteur
                </label>
                <select
                  value={filters.secteur}
                  onChange={(e) =>
                    handleFilterChange("secteur", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none"
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
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Genre
                </label>
                <select
                  value={filters.genre}
                  onChange={(e) => handleFilterChange("genre", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none"
                >
                  <option value="">Tous</option>
                  <option value="m">Masculin</option>
                  <option value="f">Féminin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Province
                </label>
                <select
                  value={filters.province}
                  onChange={(e) =>
                    handleFilterChange("province", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-700 focus:border-green-700 outline-none"
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

            <div className="mt-4 pt-4 border-t flex justify-between items-center flex-wrap gap-3">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-700 text-lg">
                  {filteredLaureats.length}
                </span>{" "}
                lauréat(s) trouvé(s)
              </div>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: "980px" }}>
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      onChange={selectAllOnPage}
                      checked={
                        paginatedLaureats.length > 0 &&
                        paginatedLaureats.every((l) => selectedIds.has(l.id))
                      }
                      title="Sélectionner / Désélectionner toute la page"
                    />
                  </th>

                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nom & Prénom
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Filière
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Ville
                  </th>

                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    {isAuthenticated ? "Détails" : "Localisation"}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {paginatedLaureats.map((laureat) => (
                  <tr key={laureat.id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-3 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(laureat.id)}
                        onChange={() => toggleSelect(laureat.id)}
                      />
                    </td>

                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900 text-sm">
                        {laureat.prenom} {laureat.nom}
                      </div>
                      <div className="text-xs text-gray-500">
                        {(() => {
                          // Afficher: Nom de l'organisme + Adresse complète (pas les coordonnées)
                          const organismeName = laureat.organisme || "";
                          const locationName = laureat.description || "";
                          
                          // Filtrer les coordonnées (Lat: ... Lng: ...)
                          const cleanLocationName = locationName && 
                            !locationName.trim().startsWith("Lat:") && 
                            !(locationName.trim().includes("Lat:") && locationName.trim().includes("Lng:"))
                            ? locationName.trim()
                            : "";
                          
                          if (organismeName && cleanLocationName) {
                            return `${organismeName}, ${cleanLocationName}`;
                          } else if (cleanLocationName) {
                            return cleanLocationName;
                          } else if (organismeName) {
                            return organismeName;
                          } else {
                            return "—";
                          }
                        })()}
                      </div>
                    </td>

                    <td className="px-3 py-3 text-xs text-gray-700">
                      {laureat.filiereLabel || laureat.filiere || "—"}
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1 text-xs text-gray-700">
                        <MapPinned className="w-3 h-3 text-gray-400" />
                        <span>{laureat.province || "—"}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-center">
                      {isAuthenticated ? (
                        <button
                          onClick={() => setSelected(laureat)}
                          className="inline-flex items-center justify-center w-9 h-9 bg-green-700 text-white rounded-full hover:bg-green-800 transition shadow-md"
                          title="Voir les détails"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      ) : (
                        <LocationButton laureat={laureat} />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {filteredLaureats.length > 0 && totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mt-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-gray-700">
                Affichage de{" "}
                <span className="font-semibold">
                  {startIndex + 1} à{" "}
                  {Math.min(endIndex, filteredLaureats.length)}
                </span>{" "}
                sur{" "}
                <span className="font-semibold">{filteredLaureats.length}</span>{" "}
                lauréat(s)
              </div>

              <div className="flex items-center space-x-2 flex-wrap justify-center">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-2 rounded-lg border transition ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                  title="Page précédente"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <span className="text-sm text-gray-700 px-2">
                  Page <b>{currentPage}</b> / {totalPages}
                </span>

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-2 rounded-lg border transition ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                  }`}
                  title="Page suivante"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {filteredLaureats.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center mt-4">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">
              Aucun lauréat trouvé
            </h3>
            <p className="text-gray-500">
              Essayez de modifier vos filtres de recherche
            </p>
            <button
              onClick={resetFilters}
              className="mt-4 px-6 py-2 bg-green-700 text-white rounded-full hover:bg-green-800"
            >
              Réinitialiser les filtres
            </button>
          </div>
        )}
      </main>

      {/* ✅ MODAL DETAILS : seulement si connecté */}
      {isAuthenticated && selected && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div className="flex items-center gap-4">
                <img
                  src={resolvePhotoUrl(
                    selected.photoUrl || selected.photo,
                    `${selected.prenom} ${selected.nom}`
                  )}
                  alt={`${selected.prenom} ${selected.nom}`}
                  className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-sm"
                  onError={(e) => {
                    // Fallback vers avatar si l'image ne charge pas
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${selected.prenom} ${selected.nom}`
                    )}`;
                  }}
                />

                <div>
                  <div className="font-bold text-gray-900 text-xl">
                    {selected.prenom} {selected.nom}
                  </div>
                  <div className="text-sm text-gray-500">
                    {(() => {
                      // Afficher: Nom de l'organisme + Adresse complète (pas les coordonnées)
                      const organismeName = selected.organisme || "";
                      const locationName = selected.description || "";
                      
                      // Filtrer les coordonnées (Lat: ... Lng: ...)
                      const cleanLocationName = locationName && 
                        !locationName.trim().startsWith("Lat:") && 
                        !(locationName.trim().includes("Lat:") && locationName.trim().includes("Lng:"))
                        ? locationName.trim()
                        : "";
                      
                      if (organismeName && cleanLocationName) {
                        return `${organismeName}, ${cleanLocationName}`;
                      } else if (cleanLocationName) {
                        return cleanLocationName;
                      } else if (organismeName) {
                        return organismeName;
                      } else {
                        return "—";
                      }
                    })()}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 grid md:grid-cols-2 gap-4">
              <InfoRow
                label="Filière"
                value={selected.filiereLabel || selected.filiere || "—"}
              />
              <InfoRow label="Promotion" value={selected.promotion || "—"} />
              <InfoRow label="Organisme" value={selected.organisme || "—"} />
              <InfoRow label="Province" value={selected.province || "—"} />
              <InfoRow
                label="Statut"
                value={
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                      selected.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selected.status === "published" ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <Clock className="w-3 h-3 mr-1" />
                    )}
                    {selected.status === "published" ? "Publié" : "En attente"}
                  </span>
                }
              />
              <InfoRow
                label="Email"
                value={
                  selected.email ? (
                    <span className="inline-flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {selected.email}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <InfoRow
                label="Téléphone"
                value={
                  selected.telephone ? (
                    <span className="inline-flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {selected.telephone}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
            </div>

            <div className="px-6 py-4 border-t flex items-center justify-between">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Fermer
              </button>

              {selected.status === "published" &&
              Number.isFinite(selected.lat) &&
              Number.isFinite(selected.lon) ? (
                <Link
                  to={`/carte-sig?lat=${selected.lat}&lon=${selected.lon}&laureatId=${selected.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 shadow"
                >
                  <Navigation className="w-4 h-4" />
                  Voir sur la carte
                </Link>
              ) : (
                <span className="text-sm text-gray-400">
                  Localisation indisponible
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function InfoRow({ label, value }) {
  return (
    <div className="text-sm">
      <div className="text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  );
}

/** ✅ Non connecté => carte localisation seulement */
/** ✅ Non connecté => bouton "Voir sur la carte" */
function LocationButton({ laureat }) {
  const canLocate =
    laureat.status === "published" &&
    Number.isFinite(laureat.lat) &&
    Number.isFinite(laureat.lon);

  if (!canLocate) {
    return (
      <span className="text-xs text-gray-400">
        Localisation indisponible
      </span>
    );
  }

  return (
    <Link
      to={`/carte-sig?lat=${laureat.lat}&lon=${laureat.lon}&laureatId=${laureat.id}`}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-green-700 text-white hover:bg-green-800 shadow-sm"
      title="Voir sur la carte"
    >
      <Navigation className="w-4 h-4" />
      <span className="text-xs font-semibold">Voir sur la carte</span>
    </Link>
  );
}


export default AnnuairePage;