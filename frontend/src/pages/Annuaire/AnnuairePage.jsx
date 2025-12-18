import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Users,
  Filter,
  Download,
  Mail,
  Phone,
  MapPinned,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Home,
  Map,
  BarChart3,
  Settings,
} from "lucide-react";
import { ROUTES } from "../../utils/constants";
import logoEhtp from "../../assets/styles/logo-ehtp.png";

import { API_BASE_URL } from "../../api/http";
import {
  getAllFiltres,
  getLaureats,
  getPhotoUrl,
} from "../../api/laureats.api";

const AnnuairePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ maintenant laureats vient du backend
  const [laureats, setLaureats] = useState([]);
  const [filteredLaureats, setFilteredLaureats] = useState([]);

  // ✅ listes filtres viennent du backend
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

  // ✅ 1) Charger filtres + laureats au début
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError("");
      try {
        // filtres
        const filtresRes = await getAllFiltres();
        const fdata = filtresRes.data || {};
        setFilieres(fdata.filieres || []);
        setProvinces(fdata.provinces || []);
        setPromotions(fdata.promotions || []);
        setSecteurs(fdata.secteurs || []);

        // laureats
        const laureatsRes = await getLaureats();

        // si pagination: res.data.content
        const list = Array.isArray(laureatsRes.data)
          ? laureatsRes.data
          : laureatsRes.data?.content || [];

        // normaliser photo
        const normalized = list.map((l) => ({
          ...l,
          photo: l.photo?.startsWith("http")
            ? l.photo
            : getPhotoUrl?.(l.photo, API_BASE_URL) ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                (l.prenom || "") + " " + (l.nom || "")
              )}`,
        }));

        setLaureats(normalized);
        setFilteredLaureats(normalized); // initial
      } catch (e) {
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ✅ 2) Filtrage LOCAL (comme avant)
  useEffect(() => {
    let filtered = laureats;

    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(
        (l) =>
          (l.nom || "").toLowerCase().includes(s) ||
          (l.prenom || "").toLowerCase().includes(s) ||
          (l.email || "").toLowerCase().includes(s)
      );
    }

    if (filters.filiere)
      filtered = filtered.filter((l) => l.filiere === filters.filiere);
    if (filters.promotion)
      filtered = filtered.filter(
        (l) => String(l.promotion) === String(filters.promotion)
      );
    if (filters.secteur)
      filtered = filtered.filter((l) => l.secteur === filters.secteur);
    if (filters.genre)
      filtered = filtered.filter((l) => l.genre === filters.genre);
    if (filters.province)
      filtered = filtered.filter((l) => l.province === filters.province);

    setFilteredLaureats(filtered);
  }, [filters, laureats]);

  // ✅ 3) Synchroniser URL (comme avant)
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
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-8 py-4 border-b shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logoEhtp} alt="EHTP Logo" className="w-10 h-10" />
          <span className="font-semibold text-lg">Career Tracker EHTP</span>
        </div>

        <nav className="flex items-center gap-8">
          <Link
            to={ROUTES.HOME}
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <Home size={18} />
            <span>Accueil</span>
          </Link>
          <Link
            to="/annuaire"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2 bg-green-100 px-3 py-1 rounded"
          >
            <Users size={18} />
            <span>Annuaire</span>
          </Link>
          <Link
            to="/carte-sig"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <Map size={18} />
            <span>Carte SIG</span>
          </Link>
          <Link
            to="/statistiques"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <BarChart3 size={18} />
            <span>Statistiques</span>
          </Link>
          <Link
            to="/administration"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <Settings size={18} />
            <span>Administration</span>
          </Link>
          <Link
            to={ROUTES.A_PROPOS}
            className="text-gray-700 hover:text-gray-900"
          >
            À propos
          </Link>
          <Link
            to={ROUTES.CONTACT}
            className="text-gray-700 hover:text-gray-900"
          >
            Contactez-nous
          </Link>
          <button className="bg-green-700 text-white px-6 py-2 rounded-full hover:bg-green-800">
            Se Connecter
          </button>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-4xl font-serif text-black">
              Annuaire des Lauréats
            </h1>
            <p className="text-gray-600 mt-2">
              Liste complète des membres de l'association
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 shadow"
            >
              <Filter className="w-4 h-4" />
              <span>
                {showFilters ? "Masquer filtres" : "Afficher filtres"}
              </span>
            </button>

            <button className="flex items-center space-x-2 bg-green-700 text-white px-4 py-2 rounded-full hover:bg-green-800 shadow">
              <Download className="w-4 h-4" />
              <span>Exporter</span>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-black text-lg flex items-center space-x-2">
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
                  <option value="">Toutes les promotions</option>
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
                  <option value="">Tous les secteurs</option>
                  {(secteurs.length ? secteurs : ["Public", "Privé"]).map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
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
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
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
                  <option value="">Toutes les provinces</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-green-700 text-lg">
                  {filteredLaureats.length}
                </span>{" "}
                lauréat(s) trouvé(s)
              </div>
              <div className="flex space-x-2">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  {filteredLaureats.filter((l) => l.statut === "validé").length}{" "}
                  Validés
                </span>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                  {
                    filteredLaureats.filter((l) => l.statut === "en_attente")
                      .length
                  }{" "}
                  En attente
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Photo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Nom & Prénom
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Filière
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Organisme
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredLaureats.map((laureat) => (
                  <tr key={laureat.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-4">
                      <img
                        src={laureat.photo}
                        alt={`${laureat.prenom} ${laureat.nom}`}
                        className="w-12 h-12 rounded-full border-2 border-green-100"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-semibold text-gray-800">
                        {laureat.prenom} {laureat.nom}
                      </div>
                      <div className="text-sm text-gray-500">
                        {laureat.description}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {laureat.filiere}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-700">
                      {laureat.promotion}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-700">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="truncate max-w-[180px]">
                          {laureat.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-700">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{laureat.telephone}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-gray-700">
                        {laureat.organisme}
                      </div>
                      <div className="text-xs text-gray-500">
                        {laureat.secteur}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-1 text-sm text-gray-700">
                        <MapPinned className="w-4 h-4 text-gray-400" />
                        <span>{laureat.province}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          laureat.statut === "validé"
                            ? "bg-green-100 text-green-800"
                            : laureat.statut === "en_attente"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {laureat.statut === "validé" ? (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        ) : laureat.statut === "en_attente" ? (
                          <Clock className="w-3 h-3 mr-1" />
                        ) : (
                          <XCircle className="w-3 h-3 mr-1" />
                        )}
                        {laureat.statut === "validé"
                          ? "Validé"
                          : laureat.statut === "en_attente"
                          ? "En attente"
                          : "Rejeté"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLaureats.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
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

      <footer
        className="bg-footer text-white py-12 px-8 mt-12"
        style={{ backgroundColor: "#4F6B2B" }}
      >
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
              <p className="text-sm text-green-200 mb-2">+212 520 42 08 12</p>
              <p className="text-sm text-green-200">contact@ehtp.ac.ma</p>
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
              <Link to={ROUTES.HOME} className="hover:text-white">
                Acceuil
              </Link>
              <Link to="/annuaire" className="hover:text-white">
                newsletter
              </Link>
              <Link to={ROUTES.A_PROPOS} className="hover:text-white">
                À propos
              </Link>
              <Link to={ROUTES.CONTACT} className="hover:text-white">
                Contactez-nous
              </Link>
            </div>
            <div>Career Tracker EHTP © 2025. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AnnuairePage;
