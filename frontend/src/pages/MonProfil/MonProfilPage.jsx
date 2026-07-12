import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getLaureatById, getSimilarLaureats, getOrganismes } from "../../api/laureats.api";
import { API_BASE_URL } from "../../api/http";
import AppNavbar from "../../components/common/Navbar/AppNavbar";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building2,
  Briefcase,
  MapPin,
  Users,
} from "lucide-react";

const COLOR_PRIMARY = "#4F6B2B"; // Couleur principale (vert olive)

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
  const key = (raw ?? "").toString().trim().toLowerCase();
  if (!key) return "";
  if (FILIERE_LABELS[key]) return FILIERE_LABELS[key];
  return raw.toString().trim();
}

function normSecteur(raw) {
  const k = (raw ?? "").toString().trim().toLowerCase();
  if (!k) return "";
  if (k === "public") return "Public";
  if (k === "prive" || k === "privé") return "Privé";
  return k.charAt(0).toUpperCase() + k.slice(1);
}

function normGenre(raw) {
  const k = (raw ?? "").toString().trim().toLowerCase();
  if (!k) return "";
  if (["m", "h", "homme", "masculin"].includes(k)) return "Homme";
  if (["f", "femme", "féminin", "feminin"].includes(k)) return "Femme";
  return k.charAt(0).toUpperCase() + k.slice(1);
}

const MonProfilPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [laureat, setLaureat] = useState(null);
  const [similarLaureats, setSimilarLaureats] = useState([]);
  const [organismesMap, setOrganismesMap] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      navigate("/login");
      return;
    }

    // Si l'utilisateur est un admin, rediriger
    if (user?.role === "admin") {
      navigate("/administration");
      return;
    }

    // Charger les données du lauréat
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Charger le lauréat et les organismes en parallèle
        const [laureatRes, organismesRes] = await Promise.all([
          getLaureatById(user.id),
          getOrganismes()
        ]);
        
        setLaureat(laureatRes.data);
        
        // Créer une map des organismes
        const organismes = Array.isArray(organismesRes.data) ? organismesRes.data : [];
        const orgMap = new Map(organismes.map((org) => [org.id, org.nom]));
        setOrganismesMap(orgMap);
        
        // Charger les personnes similaires
        try {
          setLoadingSimilar(true);
          const similarRes = await getSimilarLaureats(user.id);
          setSimilarLaureats(Array.isArray(similarRes.data) ? similarRes.data : []);
        } catch (err) {
          console.error("Erreur lors du chargement des personnes similaires:", err);
          setSimilarLaureats([]);
        } finally {
          setLoadingSimilar(false);
        }
      } catch (err) {
        console.error("Erreur lors du chargement du profil:", err);
        setError("Impossible de charger les informations du profil.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de votre profil...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !laureat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppNavbar />
        <div className="pt-24 pb-12 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-red-600">{error || "Profil non trouvé"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const photoUrl = laureat.photoUrl
    ? laureat.photoUrl.startsWith("http")
      ? laureat.photoUrl
      : laureat.photoUrl.startsWith("/")
      ? `${API_BASE_URL}${laureat.photoUrl}`
      : `${API_BASE_URL}/api/laureats/photo/${laureat.photoUrl}`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${laureat.prenom} ${laureat.nom}`
      )}&size=200`;

  const getOrganismeNom = () => {
    if (laureat.autreOrganisme) return laureat.autreOrganisme;
    if (laureat.organismeId) return organismesMap.get(laureat.organismeId) || `ID: ${laureat.organismeId}`;
    return "Non renseigné";
  };

  const getPersonOrganismeNom = (person) => {
    if (person.autreOrganisme) return person.autreOrganisme;
    if (person.organismeId) return organismesMap.get(person.organismeId) || `ID: ${person.organismeId}`;
    return "Non renseigné";
  };

  const getPersonPhotoUrl = (person) => {
    if (person.photoUrl) {
      if (person.photoUrl.startsWith("http")) return person.photoUrl;
      if (person.photoUrl.startsWith("/")) return `${API_BASE_URL}${person.photoUrl}`;
      return `${API_BASE_URL}/api/laureats/photo/${person.photoUrl}`;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${person.prenom} ${person.nom}`
    )}&size=80`;
  };

  // Filtrer les lauréats similaires - uniquement ceux avec la même filière
  const filteredSimilarLaureats = similarLaureats.filter((person) => {
    return person.filiere === laureat.filiere;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Informations du lauréat en horizontal */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
              {/* Photo */}
              <div className="flex-shrink-0">
                <img
                  src={photoUrl}
                  alt={`${laureat.prenom} ${laureat.nom}`}
                  className="w-32 h-32 rounded-full object-cover border-4"
                  style={{ borderColor: COLOR_PRIMARY }}
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      `${laureat.prenom} ${laureat.nom}`
                    )}&size=200`;
                  }}
                />
              </div>

              {/* Informations personnelles en horizontal */}
              <div className="flex-1 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nom complet</p>
                    <p className="text-gray-900 font-semibold text-lg">
                      {laureat.prenom} {laureat.nom}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Mail size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{laureat.email}</p>
                  </div>
                </div>

                {laureat.telephone && (
                  <div className="flex items-center gap-2">
                    <Phone size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Téléphone</p>
                      <p className="text-gray-900 font-medium">{laureat.telephone}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <User size={20} className="text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Genre</p>
                    <p className="text-gray-900 font-medium">{normGenre(laureat.genre)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sections en horizontal */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Formation */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <GraduationCap size={24} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Formation</h3>
                  <p className="text-gray-700">
                    {mapFiliere(laureat.filiere)} • Promotion {laureat.promotion || "—"}
                  </p>
                </div>
              </div>

              {/* Poste actuel */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <Briefcase size={24} className="text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Poste actuel</h3>
                  <p className="text-gray-700">{getOrganismeNom()}</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Secteur: {normSecteur(laureat.secteur) || "—"}
                  </p>
                </div>
              </div>

              {/* Localisation */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <MapPin size={24} className="text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 mb-1">Localisation</h3>
                  {laureat.description ? (
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">{laureat.description}</p>
                  ) : (
                    <p className="text-gray-500 text-sm">Non renseignée</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tableau des lauréats similaires avec photos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Users size={24} className="text-primary" style={{ color: COLOR_PRIMARY }} />
                Lauréats similaires
              </h2>
              <span className="text-sm text-gray-500">
                {filteredSimilarLaureats.length} personne{filteredSimilarLaureats.length > 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Personnes ayant la même filière
            </p>

            {loadingSimilar ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">Chargement...</p>
              </div>
            ) : filteredSimilarLaureats.length === 0 ? (
              <div className="text-center py-12">
                <Users size={48} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun lauréat avec la même filière</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Photo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Promotion
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Organisme
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSimilarLaureats.map((person) => (
                      <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <img
                            src={getPersonPhotoUrl(person)}
                            alt={`${person.prenom} ${person.nom}`}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                `${person.prenom} ${person.nom}`
                              )}&size=80`;
                            }}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {person.prenom} {person.nom}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{person.email || "-"}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{person.telephone || "-"}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{person.promotion || "-"}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {getPersonOrganismeNom(person)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonProfilPage;
