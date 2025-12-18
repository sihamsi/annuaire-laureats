import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Map as MapIcon,
  BarChart3,
  Settings,
  Home,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  Briefcase,
  MapPin,
  Award,
} from "lucide-react";

import { ROUTES } from "../../utils/constants";
import logoEhtp from "../../assets/styles/logo-ehtp.png";

const API_BASE = import.meta?.env?.VITE_API_BASE_URL || "http://localhost:8080";

// Helpers
const normalize = (v) => (v ?? "").toString().trim().toLowerCase();

const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

// Map codes/enums → labels (important si ton back renvoie "gc", "ge", "sig"...)
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

const SECTEUR_LABELS = {
  public: "Public",
  prive: "Privé",
};

const GENRE_LABELS = {
  homme: "Hommes",
  femme: "Femmes",
  // si DB contient "M/F" ou "H/F"
  m: "Hommes",
  f: "Femmes",
};

const STATUS_LABELS = {
  pending: "pending",
  published: "published",
  rejected: "rejected",
};

function mapFiliere(raw) {
  const key = normalize(raw);
  // si le back renvoie déjà "Génie civil", on le garde
  if (!key) return "Non renseignée";
  if (FILIERE_LABELS[key]) return FILIERE_LABELS[key];
  return raw; // fallback
}

function mapSecteur(raw) {
  const key = normalize(raw);
  if (!key) return "Non renseigné";
  if (SECTEUR_LABELS[key]) return SECTEUR_LABELS[key];
  return titleCase(key);
}

function mapGenre(raw) {
  const key = normalize(raw);
  if (!key) return "Non renseigné";
  if (GENRE_LABELS[key]) return GENRE_LABELS[key];
  return titleCase(key);
}

function mapStatus(raw) {
  const key = normalize(raw);
  if (!key) return "pending";
  if (STATUS_LABELS[key]) return key;
  return key;
}

// groupBy count
function countBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const k = keyFn(item);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

// Top N from map
function topN(map, n = 5) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([nom, valeur]) => ({ nom, valeur }));
}

const StatistiquesPage = () => {
  const [animateCharts, setAnimateCharts] = useState(false);
  const [laureats, setLaureats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setAnimateCharts(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/api/laureats`, {
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} - ${res.statusText}`);
        }

        const data = await res.json();
        if (!cancelled) setLaureats(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Erreur lors du chargement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Calculs dynamiques
  const computed = useMemo(() => {
    const total = laureats.length;

    const statusCount = countBy(laureats, (l) => mapStatus(l.status));
    const valides = statusCount.get("published") || 0;
    const enAttente = statusCount.get("pending") || 0;
    const rejected = statusCount.get("rejected") || 0;
    const tauxValidation = total > 0 ? Math.round((valides / total) * 100) : 0;

    // Filières
    const filiereMap = countBy(laureats, (l) => mapFiliere(l.filiere));
    const filiereArr = Array.from(filiereMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nom, valeur]) => ({
        nom,
        valeur,
        pourcentage: total > 0 ? Math.round((valeur / total) * 100) : 0,
      }));

    // Promotions (on trie par année)
    const promoMap = countBy(
      laureats,
      (l) => (l.promotion ?? "").toString().trim() || "N/A"
    );
    const promoArr = Array.from(promoMap.entries())
      .filter(([annee]) => annee !== "N/A")
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([annee, valeur]) => ({ annee, valeur }));

    // Secteur (public / prive)
    const secteurMap = countBy(
      laureats,
      (l) => normalize(l.secteur) || "non_renseigne"
    );
    const statsParSecteur = {
      public: secteurMap.get("public") || 0,
      prive: secteurMap.get("prive") || 0,
      nonRenseigne: secteurMap.get("non_renseigne") || 0,
    };

    // Genre
    const genreMap = countBy(laureats, (l) => mapGenre(l.genre));
    const genreArr = Array.from(genreMap.entries()).map(([nom, valeur]) => ({
      nom,
      valeur,
      pourcentage: total > 0 ? Math.round((valeur / total) * 100) : 0,
    }));

    // Top organismes (si ton champ s’appelle organisme / autreOrganisme)
    const orgMap = countBy(laureats, (l) => {
      const org = (l.organisme?.nom || l.autreOrganisme || l.organisme || "")
        .toString()
        .trim();
      return org || "Non renseigné";
    });
    const topOrganismes = topN(orgMap, 5).map((x, idx) => ({
      nom: x.nom,
      laureats: x.valeur,
      secteur: "—", // optionnel: tu peux calculer secteur dominant
      rank: idx + 1,
    }));

    // Top provinces (si tu as province.nom ou juste provinceId)
    const provMap = countBy(laureats, (l) => {
      const p = (l.province?.nom || l.province || "").toString().trim();
      return p || "Non renseignée";
    });
    const topProvinces = topN(provMap, 5).map((x, idx) => ({
      nom: x.nom,
      laureats: x.valeur,
      rank: idx + 1,
    }));

    // Distribution géographique simple: on regroupe par province (à la place de ville)
    const geoMap = countBy(laureats, (l) =>
      (l.province?.nom || l.province || "Non renseignée").toString().trim()
    );
    const distributionGeo = Array.from(geoMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([ville, totalVille]) => {
        // split public/prive pour cette ville
        const inVille = laureats.filter(
          (l) =>
            (l.province?.nom || l.province || "Non renseignée")
              .toString()
              .trim() === ville
        );
        const pub = inVille.filter(
          (l) => normalize(l.secteur) === "public"
        ).length;
        const prv = inVille.filter(
          (l) => normalize(l.secteur) === "prive"
        ).length;
        return { ville, public: pub, prive: prv, total: totalVille };
      });

    return {
      total,
      valides,
      enAttente,
      rejected,
      tauxValidation,
      statsParFiliere: filiereArr,
      statsParPromotion: promoArr.length
        ? promoArr
        : [{ annee: "—", valeur: 0 }],
      statsParSecteur,
      statsParGenre: genreArr.length
        ? genreArr
        : [{ nom: "Non renseigné", valeur: 0, pourcentage: 0 }],
      distributionGeo: distributionGeo.length
        ? distributionGeo
        : [{ ville: "—", public: 0, prive: 0 }],
      topOrganismes,
      topProvinces,
    };
  }, [laureats]);

  const stats = {
    total: computed.total,
    valides: computed.valides,
    enAttente: computed.enAttente,
    tauxValidation: computed.tauxValidation,
  };

  const kpis = [
    {
      label: "Total Lauréats",
      value: stats.total,
      icon: Users,
      gradient: "from-primary to-primary-dark",
      change: "",
      changePositive: true,
    },
    {
      label: "Profils Validés",
      value: stats.valides,
      icon: CheckCircle,
      gradient: "from-primary to-primary-dark",
      change: "",
      changePositive: true,
    },
    {
      label: "En Attente",
      value: stats.enAttente,
      icon: Clock,
      gradient: "from-primary-light to-primary",
      change: "",
      changePositive: false,
    },
    {
      label: "Taux Validation",
      value: `${stats.tauxValidation}%`,
      icon: TrendingUp,
      gradient: "from-primary to-primary-dark",
      change: "",
      changePositive: true,
    },
  ];

  const statsParFiliere = computed.statsParFiliere;
  const statsParPromotion = computed.statsParPromotion;
  const statsParSecteur = {
    public: computed.statsParSecteur.public,
    prive: computed.statsParSecteur.prive,
  };
  const statsParGenre = computed.statsParGenre;
  const distributionGeo = computed.distributionGeo;
  const topOrganismes = computed.topOrganismes;
  const topProvinces = computed.topProvinces;

  const maxPromotion = Math.max(...statsParPromotion.map((s) => s.valeur), 1);
  const maxGeo = Math.max(
    ...distributionGeo.flatMap((d) => [d.public, d.prive]),
    1
  );

  return (
    <div className="min-h-screen bg-background">
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
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <Users size={18} />
            <span>Annuaire</span>
          </Link>
          <Link
            to="/carte-sig"
            className="text-gray-700 hover:text-gray-900 flex items-center gap-2"
          >
            <MapIcon size={18} />

            <span>Carte SIG</span>
          </Link>
          <Link
            to="/statistiques"
            className="text-primary hover:text-primary-dark flex items-center gap-2 font-semibold"
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
          <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark">
            Se Connecter
          </button>
        </nav>
      </header>

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-6">
          <h1 className="text-4xl font-serif text-black mb-2">
            Tableau de Bord & Statistiques
          </h1>
          <p className="text-gray-600">
            Analyses et indicateurs clés de notre réseau de lauréats
          </p>
        </div>

        {/* Etat chargement */}
        {loading && (
          <div className="bg-white rounded-xl shadow-sm p-5 mb-6 text-gray-700">
            Chargement des statistiques…
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6 text-red-700">
            Erreur: {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`w-12 h-12 bg-gradient-to-br ${kpi.gradient} rounded-lg flex items-center justify-center`}
                >
                  <kpi.icon className="text-white" size={22} />
                </div>
              </div>
              <div className="text-3xl font-bold text-black mb-1">
                {kpi.value}
              </div>
              <div className="text-sm text-gray-600">{kpi.label}</div>
            </div>
          ))}
        </div>

        {/* Graphiques Principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Promotions */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <GraduationCap className="mr-2 text-primary" size={18} />
              Promotions
            </h3>
            <div className="relative h-56">
              <div className="flex items-end justify-around h-52 pt-2 relative">
                {statsParPromotion.map((promo, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end"
                    style={{ width: "14%" }}
                  >
                    <div
                      className="w-full bg-gradient-to-t from-primary-dark via-primary to-primary-light rounded-t transition-all duration-700 hover:opacity-80 cursor-pointer"
                      style={{
                        height: animateCharts
                          ? `${(promo.valeur / maxPromotion) * 170}px`
                          : "0px",
                        transitionDelay: `${idx * 50}ms`,
                      }}
                    />
                    <div className="text-xs font-medium text-gray-600 mt-2">
                      {promo.annee}
                    </div>
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

            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-black">
                  {statsParSecteur.public}
                </div>
                <div className="text-xs text-gray-600">Public</div>
              </div>
              <div className="text-center p-3 bg-background rounded-lg">
                <div className="text-2xl font-bold text-black">
                  {statsParSecteur.prive}
                </div>
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
                    <span className="text-sm font-medium text-gray-700">
                      {filiere.nom}
                    </span>
                    <span className="text-base font-bold text-black">
                      {filiere.valeur}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{
                          width: animateCharts
                            ? `${filiere.pourcentage}%`
                            : "0%",
                          transitionDelay: `${idx * 80}ms`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-9 text-right">
                      {filiere.pourcentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Distribution Geo & Genre */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Distribution Geo */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <MapPin className="mr-2 text-primary" size={18} />
              Distribution Géographique (Top 4)
            </h3>

            <div className="flex items-end justify-around h-56">
              {distributionGeo.map((data, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center"
                  style={{ width: "20%" }}
                >
                  <div className="w-full flex space-x-1 items-end h-48">
                    <div
                      className="flex-1 bg-primary-dark rounded-t transition-all duration-700"
                      style={{
                        height: animateCharts
                          ? `${(data.public / maxGeo) * 180}px`
                          : "0px",
                        transitionDelay: `${idx * 100}ms`,
                      }}
                    />
                    <div
                      className="flex-1 bg-primary-light rounded-t transition-all duration-700"
                      style={{
                        height: animateCharts
                          ? `${(data.prive / maxGeo) * 180}px`
                          : "0px",
                        transitionDelay: `${idx * 100 + 50}ms`,
                      }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-600 mt-2">
                    {data.ville}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Genre */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <Users className="mr-2 text-primary" size={18} />
              Répartition Genre
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {statsParGenre.slice(0, 2).map((g, idx) => (
                <div key={idx} className="p-4 bg-background rounded-lg">
                  <div className="text-sm font-medium text-gray-700">
                    {g.nom}
                  </div>
                  <div className="text-2xl font-bold text-black">
                    {g.valeur}
                  </div>
                  <div className="text-xs text-gray-500">{g.pourcentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Organismes & Provinces */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <Briefcase className="mr-2 text-primary" size={18} />
              Top 5 Organismes Employeurs
            </h3>
            <div className="space-y-3">
              {topOrganismes.map((org, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-black text-sm">
                        {org.nom}
                      </div>
                      <div className="text-xs text-gray-500">{org.secteur}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {org.laureats}
                    </div>
                    <div className="text-xs text-gray-500">lauréats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-base font-bold text-black mb-4 flex items-center">
              <MapPin className="mr-2 text-primary" size={18} />
              Top 5 Provinces
            </h3>
            <div className="space-y-3">
              {topProvinces.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-background rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center text-white text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div className="font-semibold text-black text-sm">
                      {p.nom}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">
                      {p.laureats}
                    </div>
                    <div className="text-xs text-gray-500">lauréats</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer (inchangé) */}
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
                <button className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark">
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

export default StatistiquesPage;
