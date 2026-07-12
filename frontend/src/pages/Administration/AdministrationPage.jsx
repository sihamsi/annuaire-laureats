// src/pages/admin/AdministrationPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Mail, // ✅ Messages tab icon
  Trash2, // optionnel
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import AppNavbar from "../../components/common/Navbar/AppNavbar";
import { API_BASE_URL } from "../../api/http";
import {
  getGeolocalisationLaureats,
  getLaureatsByStatut,
  rejeterLaureat,
  validerLaureat,
  getOrganismes, // ✅ on garde juste pour enrich laureats (organismeNom)
} from "../../api/laureats.api";

// ✅ Nouveau: API messages
import { getMessages, deleteMessage } from "../../api/messages.api";

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

const AdministrationPage = () => {
  const { user: _user } = useAuth();

  // ✅ Tabs: inscriptions / rejets / messages
  const [activeTab, setActiveTab] = useState("inscriptions");

  // ✅ Modals inscriptions
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [modalMode, setModalMode] = useState("details"); // "details" | "rejet"
  const [motifRejet, setMotifRejet] = useState("");
  const [motifsRejet, setMotifsRejet] = useState({
    "Promotion incorrecte": false,
    "Filière incorrecte": false,
    "Compte existant": false,
    "Nom/Prénom incorrect": false,
    "Non-lauréat": false,
    "Autres": false,
  });
  const [detailsRejet, setDetailsRejet] = useState("");

  // ✅ DATA
  const [inscriptionsEnAttente, setInscriptionsEnAttente] = useState([]);
  const [historiqueRejets, setHistoriqueRejets] = useState([]);
  const [messages, setMessages] = useState([]); // ✅ NOUVEAU

  const [loading, setLoading] = useState({
    inscriptions: false,
    rejets: false,
    messages: false,
    action: false,
  });

  const [error, setError] = useState({
    inscriptions: "",
    rejets: "",
    messages: "",
    action: "",
  });

  // petit search (inscriptions)
  const [q, setQ] = useState("");

  // Filtre par motif de rejet
  const [filtreMotifRejet, setFiltreMotifRejet] = useState("");

  // Pagination
  const itemsPerPage = 5;
  const [pageInscriptions, setPageInscriptions] = useState(1);
  const [pageRejets, setPageRejets] = useState(1);
  const [pageMessages, setPageMessages] = useState(1);

  const setLoad = (key, val) => setLoading((p) => ({ ...p, [key]: val }));
  const setErr = (key, val) => setError((p) => ({ ...p, [key]: val }));

  // ✅ Maps pour enrich laureats (organisme + province)
  const [organismesMap, setOrganismesMap] = useState(new Map());
  const [provinceMap, setProvinceMap] = useState(new Map());

  // ✅ Resolve photo URL
  const resolvePhotoUrl = (photoUrl, fallbackName) => {
    // Si photoUrl est fourni et valide
    if (photoUrl && photoUrl.trim() !== "") {
      let resolvedUrl;
      
      // Si l'URL commence par "photos/", utiliser l'endpoint API
      if (photoUrl.startsWith("photos/")) {
        const filename = photoUrl.replace("photos/", "");
        resolvedUrl = `${API_BASE_URL}/api/laureats/photo/${filename}`;
      } else if (photoUrl.startsWith("/api/laureats/photo/")) {
        // Format déjà avec /api/laureats/photo/
        resolvedUrl = `${API_BASE_URL}${photoUrl}`;
      } else if (photoUrl.startsWith("http")) {
        resolvedUrl = photoUrl;
      } else if (photoUrl.startsWith("/")) {
        resolvedUrl = `${API_BASE_URL}${photoUrl}`;
      } else {
        resolvedUrl = `${API_BASE_URL}/${photoUrl}`;
      }
      return resolvedUrl;
    }

    // Fallback: chercher la photo par nom (format Prenom_Nom.png)
    if (fallbackName) {
      const parts = fallbackName.trim().split(/\s+/);
      if (parts.length >= 2) {
        const prenom = parts[0].trim();
        const nom = parts[parts.length - 1].trim();
        
        // Nettoyer les noms (enlever les accents, espaces, etc.)
        const cleanPrenom = prenom
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, "");
        const cleanNom = nom
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-zA-Z0-9]/g, "");
        
        // Capitaliser la première lettre (comme dans le backend)
        const capPrenom = cleanPrenom.length > 0 
          ? cleanPrenom.charAt(0).toUpperCase() + cleanPrenom.slice(1).toLowerCase()
          : "";
        const capNom = cleanNom.length > 0
          ? cleanNom.charAt(0).toUpperCase() + cleanNom.slice(1).toLowerCase()
          : "";
        
        if (capPrenom && capNom) {
          // Essayer d'abord .png, puis .jpg
          const filenamePng = `${capPrenom}_${capNom}.png`;
          return `${API_BASE_URL}/api/laureats/photo/${filenamePng}`;
        }
      }
    }

    // Dernier recours: avatar généré
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      fallbackName || "User"
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (value) => {
    if (!value) return { date: "—", time: "—" };
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return { date: value, time: "—" };
    return {
      date: date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const enrichLaureats = (data) =>
    (data || []).map((l) => ({
      ...l,
      organismeNom:
        l.autreOrganisme ||
        organismesMap.get(l.organismeId) ||
        l.organisme ||
        "",
      province: l.province || provinceMap.get(l.id) || "—",
    }));

  // ✅ Charger données de référence (organismes + geoloc pour province)
  useEffect(() => {
    let cancelled = false;

    const loadReferenceData = async () => {
      try {
        const [organismesRes, geoRes] = await Promise.all([
          getOrganismes(),
          getGeolocalisationLaureats(),
        ]);

        const organismesData = Array.isArray(organismesRes.data)
          ? organismesRes.data
          : [];
        const organismesLookup = new Map(
          organismesData.map((org) => [org.id, org.nom])
        );

        const geoData = Array.isArray(geoRes.data) ? geoRes.data : [];
        const provinceLookup = new Map(
          geoData.map((item) => [item.id, item.province])
        );

        if (!cancelled) {
          setOrganismesMap(organismesLookup);
          setProvinceMap(provinceLookup);
        }
      } catch (e) {
        // pas bloquant
      }
    };

    loadReferenceData();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Fetch inscriptions / rejets / messages
  const fetchInscriptions = async () => {
    setLoad("inscriptions", true);
    setErr("inscriptions", "");
    try {
      const res = await getLaureatsByStatut("pending");
      const data = Array.isArray(res.data) ? res.data : [];
      setInscriptionsEnAttente(enrichLaureats(data));
    } catch (e) {
      setErr(
        "inscriptions",
        e?.response?.data?.message || "Erreur chargement inscriptions"
      );
    } finally {
      setLoad("inscriptions", false);
    }
  };

  const fetchRejets = async () => {
    setLoad("rejets", true);
    setErr("rejets", "");
    try {
      const res = await getLaureatsByStatut("rejected");
      const data = Array.isArray(res.data) ? res.data : [];
      setHistoriqueRejets(enrichLaureats(data));
    } catch (e) {
      setErr(
        "rejets",
        e?.response?.data?.message || "Erreur chargement rejets"
      );
    } finally {
      setLoad("rejets", false);
    }
  };

  const fetchMessages = async () => {
    setLoad("messages", true);
    setErr("messages", "");
    try {
      const res = await getMessages();
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setErr(
        "messages",
        e?.response?.data?.message || "Erreur chargement messages"
      );
    } finally {
      setLoad("messages", false);
    }
  };

  // ✅ Précharger stats au montage
  useEffect(() => {
    fetchInscriptions();
    fetchRejets();
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Ré-enrichir quand les maps changent
  useEffect(() => {
    setInscriptionsEnAttente((prev) => enrichLaureats(prev));
    setHistoriqueRejets((prev) => enrichLaureats(prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organismesMap, provinceMap]);

  // ✅ Actions inscriptions
  const validerInscription = async (id) => {
    setLoad("action", true);
    setErr("action", "");
    try {
      await validerLaureat(id);
      setInscriptionsEnAttente((prev) => prev.filter((i) => i.id !== id));
    } catch (e) {
      setErr("action", e?.response?.data?.message || "Erreur validation");
      alert("❌ Erreur validation");
    } finally {
      setLoad("action", false);
    }
  };

  const rejeterInscription = async (id) => {
    // Récupérer les motifs sélectionnés
    const selectedMotifs = Object.keys(motifsRejet).filter(key => motifsRejet[key]);
    if (selectedMotifs.length === 0)
      return alert("⚠️ Veuillez sélectionner au moins un motif de rejet");

    // Si "Autres" est sélectionné, vérifier que les détails sont remplis
    if (motifsRejet["Autres"] && !detailsRejet.trim()) {
      return alert("⚠️ Veuillez préciser les détails du motif 'Autres'");
    }

    // Joindre les motifs avec "|"
    let motifsStr = selectedMotifs.join("|");
    
    // Ajouter les détails s'ils sont remplis (pour tous les motifs, pas seulement "Autres")
    if (detailsRejet.trim()) {
      motifsStr += `|Détails: ${detailsRejet.trim()}`;
    }

    setLoad("action", true);
    setErr("action", "");
    try {
      await rejeterLaureat(id, motifsStr);
      setInscriptionsEnAttente((prev) => prev.filter((i) => i.id !== id));
      await fetchRejets();
      setSelectedInscription(null);
      setMotifRejet("");
      setDetailsRejet("");
      setMotifsRejet({
        "Promotion incorrecte": false,
        "Filière incorrecte": false,
        "Compte existant": false,
        "Nom/Prénom incorrect": false,
        "Non-lauréat": false,
        "Autres": false,
      });
      setModalMode("details");
    } catch (e) {
      setErr("action", e?.response?.data?.message || "Erreur rejet");
      alert("❌ Erreur rejet");
    } finally {
      setLoad("action", false);
    }
  };

  // ✅ filtre local inscriptions
  const inscriptionsFiltered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return inscriptionsEnAttente;
    return inscriptionsEnAttente.filter((i) =>
      [
        i.nom,
        i.prenom,
        i.email,
        i.telephone,
        mapFiliere(i.filiere),
        i.promotion,
        i.organismeNom,
        i.secteur,
        i.province,
      ]
        .filter(Boolean)
        .some((x) => String(x).toLowerCase().includes(s))
    );
  }, [q, inscriptionsEnAttente]);

  useEffect(() => {
    setPageInscriptions(1);
  }, [q]);

  // ✅ Pagination calculations
  const totalPagesInscriptions = Math.ceil(
    inscriptionsFiltered.length / itemsPerPage
  );
  const startIndexInscriptions = (pageInscriptions - 1) * itemsPerPage;
  const endIndexInscriptions = startIndexInscriptions + itemsPerPage;
  const paginatedInscriptions = inscriptionsFiltered.slice(
    startIndexInscriptions,
    endIndexInscriptions
  );

  // Filtrage des rejets par motif
  const rejetsFiltered = useMemo(() => {
    if (!filtreMotifRejet) return historiqueRejets;
    return historiqueRejets.filter((rejet) => {
      const motif = (rejet.motifRejet || "").toLowerCase();
      return motif.includes(filtreMotifRejet.toLowerCase());
    });
  }, [historiqueRejets, filtreMotifRejet]);

  const totalPagesRejets = Math.ceil(rejetsFiltered.length / itemsPerPage);
  const startIndexRejets = (pageRejets - 1) * itemsPerPage;
  const endIndexRejets = startIndexRejets + itemsPerPage;
  const paginatedRejets = rejetsFiltered.slice(
    startIndexRejets,
    endIndexRejets
  );

  const totalPagesMessages = Math.ceil(messages.length / itemsPerPage);
  const startIndexMessages = (pageMessages - 1) * itemsPerPage;
  const endIndexMessages = startIndexMessages + itemsPerPage;
  const paginatedMessages = messages.slice(
    startIndexMessages,
    endIndexMessages
  );

  const goToPage = (page, setter, totalPages) => {
    if (page >= 1 && page <= totalPages) {
      setter(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    setPageInscriptions(1);
    setPageRejets(1);
    setPageMessages(1);
  }, [activeTab]);

  // ✅ delete message
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Supprimer ce message ?")) return;
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      alert("❌ Erreur suppression message");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      <div className="w-full mx-auto px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-black mb-2">
            Panneau d'Administration
          </h1>
          <p className="text-gray-600 text-lg">
            Gestion des inscriptions, messages et traçabilité
          </p>
          {error.action && (
            <div className="mt-3 text-sm text-red-600">{error.action}</div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div
            className={`rounded-2xl shadow-xl p-6 text-white transition-all duration-300 ${
              activeTab === "inscriptions"
                ? "bg-primary shadow-2xl scale-105"
                : "bg-primary opacity-70 hover:opacity-90"
            }`}
          >
            <Clock className="mb-3" size={32} />
            <div className="text-4xl font-bold mb-2">
              {inscriptionsEnAttente.length}
            </div>
            <div className="text-sm opacity-90 font-medium">
              Inscriptions en attente
            </div>
          </div>

          <div
            className={`rounded-2xl shadow-xl p-6 text-white transition-all duration-300 ${
              activeTab === "rejets"
                ? "bg-red-600 shadow-2xl scale-105"
                : "bg-red-600 opacity-70 hover:opacity-90"
            }`}
          >
            <XCircle className="mb-3" size={32} />
            <div className="text-4xl font-bold mb-2">
              {historiqueRejets.length}
            </div>
            <div className="text-sm opacity-90 font-medium">
              Rejets (historique)
            </div>
          </div>

          <div
            className={`rounded-2xl shadow-xl p-6 text-white transition-all duration-300 ${
              activeTab === "messages"
                ? "shadow-2xl scale-105"
                : "opacity-70 hover:opacity-90"
            }`}
            style={{ backgroundColor: "#77B254" }}
          >
            <Mail className="mb-3" size={32} />
            <div className="text-4xl font-bold mb-2">{messages.length}</div>
            <div className="text-sm opacity-90 font-medium">Messages reçus</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="flex border-b-2 border-gray-100">
            <button
              onClick={() => setActiveTab("inscriptions")}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "inscriptions"
                  ? "bg-primary text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Clock className="inline mr-2" size={20} />
              Inscriptions en Attente
            </button>

            <button
              onClick={() => setActiveTab("rejets")}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "rejets"
                  ? "bg-red-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <XCircle className="inline mr-2" size={20} />
              Historique des Rejets
            </button>

            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 px-6 py-4 font-semibold transition-all duration-300 ${
                activeTab === "messages"
                  ? "text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
              style={
                activeTab === "messages" ? { backgroundColor: "#77B254" } : {}
              }
            >
              <Mail className="inline mr-2" size={20} />
              Messages
            </button>
          </div>

          <div className="p-6">
            {/* -------------------- INSCRIPTIONS -------------------- */}
            {activeTab === "inscriptions" && (
              <div>
                <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                  <h2 className="text-2xl font-bold text-primary">
                    Inscriptions en Attente de Validation
                  </h2>

                  <div className="flex items-center gap-3 flex-wrap">
                    <input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Rechercher (nom, email, filière...)"
                      className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={fetchInscriptions}
                      disabled={loading.inscriptions}
                      className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-60"
                    >
                      {loading.inscriptions ? "Chargement..." : "Rafraîchir"}
                    </button>
                    <span className="px-4 py-2 bg-primary text-white rounded-xl font-bold">
                      {inscriptionsFiltered.length} demandes
                    </span>
                  </div>
                </div>

                {error.inscriptions && (
                  <div className="mb-4 text-sm text-red-600">
                    {error.inscriptions}
                  </div>
                )}

                {loading.inscriptions ? (
                  <div className="py-10 text-gray-500">
                    Chargement des inscriptions…
                  </div>
                ) : inscriptionsFiltered.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle
                      size={48}
                      className="mx-auto mb-4 text-primary"
                    />
                    <p className="text-lg font-semibold">
                      Aucune inscription en attente
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedInscriptions.map((inscription) => (
                        <div
                          key={inscription.id}
                          className="bg-background rounded-xl p-4 border-2 border-gray-200 hover:border-primary hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between gap-4 flex-wrap">
                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                  Identité
                                </div>
                                <div className="font-bold text-black text-base">
                                  {inscription.prenom} {inscription.nom}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {inscription.email}
                                </div>
                                {inscription.telephone && (
                                  <div className="text-sm text-gray-600">
                                    {inscription.telephone}
                                  </div>
                                )}
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                  Formation
                                </div>
                                <div className="text-sm font-semibold text-black">
                                  {mapFiliere(inscription.filiere)}
                                </div>
                                <div className="text-sm text-primary font-bold">
                                  Promo {inscription.promotion}
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => {
                                setSelectedInscription(inscription);
                                setModalMode("details");
                                setMotifRejet("");
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center space-x-2 font-medium text-sm"
                            >
                              <Eye size={16} />
                              <span>Détails</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination inscriptions */}
                    {inscriptionsFiltered.length > 0 &&
                      totalPagesInscriptions > 1 && (
                        <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mt-4">
                          <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="text-sm text-gray-700">
                              Affichage de{" "}
                              <span className="font-semibold">
                                {startIndexInscriptions + 1} à{" "}
                                {Math.min(
                                  endIndexInscriptions,
                                  inscriptionsFiltered.length
                                )}
                              </span>{" "}
                              sur{" "}
                              <span className="font-semibold">
                                {inscriptionsFiltered.length}
                              </span>{" "}
                              inscription(s)
                            </div>

                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  goToPage(
                                    pageInscriptions - 1,
                                    setPageInscriptions,
                                    totalPagesInscriptions
                                  )
                                }
                                disabled={pageInscriptions === 1}
                                className={`px-3 py-2 rounded-lg border transition ${
                                  pageInscriptions === 1
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>

                              <span className="text-sm text-gray-700 px-2">
                                Page <b>{pageInscriptions}</b> /{" "}
                                {totalPagesInscriptions}
                              </span>

                              <button
                                onClick={() =>
                                  goToPage(
                                    pageInscriptions + 1,
                                    setPageInscriptions,
                                    totalPagesInscriptions
                                  )
                                }
                                disabled={
                                  pageInscriptions === totalPagesInscriptions
                                }
                                className={`px-3 py-2 rounded-lg border transition ${
                                  pageInscriptions === totalPagesInscriptions
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                                }`}
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                  </>
                )}

                {/* Modal détails / rejet */}
                {selectedInscription && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-8 my-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-black">
                          {modalMode === "details"
                            ? "Détails de l'Inscription"
                            : "Rejet de l'Inscription"}
                        </h3>
                        <button
                          onClick={() => {
                            setSelectedInscription(null);
                            setMotifRejet("");
                            setModalMode("details");
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XCircle size={28} />
                        </button>
                      </div>

                      {modalMode === "details" && (
                        <>
                          <div className="mb-6 p-6 bg-primary/10 border-2 border-primary/20 rounded-xl">
                            <div className="flex items-start gap-4 mb-6 pb-4 border-b border-primary/20">
                              <img
                                src={resolvePhotoUrl(
                                  selectedInscription.photoUrl ||
                                    selectedInscription.photo,
                                  `${selectedInscription.prenom} ${selectedInscription.nom}`
                                )}
                                alt={`${selectedInscription.prenom} ${selectedInscription.nom}`}
                                className="w-24 h-24 rounded-2xl object-cover border-2 border-primary/30 shadow-md"
                                onError={(e) => {
                                  console.error("❌ Erreur chargement image:", {
                                    src: e.target.src,
                                    photoUrl: selectedInscription.photoUrl,
                                    photo: selectedInscription.photo,
                                    prenom: selectedInscription.prenom,
                                    nom: selectedInscription.nom,
                                  });
                                  // Si l'image ne charge pas, essayer avec le fallback
                                  const fullName = `${
                                    selectedInscription.prenom || ""
                                  } ${selectedInscription.nom || ""}`.trim();
                                  e.currentTarget.src = `https://ui-avatars.com/api/?background=0D8A3B&color=fff&name=${encodeURIComponent(
                                    fullName || "User"
                                  )}`;
                                }}
                              />
                              <div className="flex-1">
                                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                  Identité
                                </div>
                                <div className="font-bold text-black text-2xl mb-2">
                                  {selectedInscription.prenom}{" "}
                                  {selectedInscription.nom}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {selectedInscription.email}
                                </div>
                                {selectedInscription.telephone && (
                                  <div className="text-sm text-gray-600">
                                    {selectedInscription.telephone}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                  Formation
                                </div>
                                <div className="text-sm font-semibold text-black mb-1">
                                  {mapFiliere(selectedInscription.filiere)}
                                </div>
                                <div className="text-sm text-primary font-bold">
                                  Promo {selectedInscription.promotion}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                  Professionnel
                                </div>
                                <div className="text-sm font-semibold text-black mb-1">
                                  {selectedInscription.organismeNom ||
                                    selectedInscription.autreOrganisme ||
                                    "—"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {selectedInscription.secteur || "—"}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {selectedInscription.province || "—"}
                                </div>
                              </div>

                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                  Technique
                                </div>
                                <div className="text-xs text-gray-600 mb-1">
                                  Date:{" "}
                                  {formatDate(
                                    selectedInscription.dateInscription
                                  )}
                                </div>
                                <div className="text-xs text-gray-600">
                                  Device: {selectedInscription.deviceId || "—"}
                                </div>
                                {selectedInscription.description && (
                                  <div className="mt-2 text-xs text-gray-600">
                                    <div className="font-semibold mb-1">
                                      Description:
                                    </div>
                                    {selectedInscription.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
                            <button
                              onClick={() => {
                                setSelectedInscription(null);
                                setMotifRejet("");
                                setModalMode("details");
                              }}
                              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                            >
                              Fermer
                            </button>

                            <button
                              onClick={() => setModalMode("rejet")}
                              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all flex items-center justify-center space-x-2"
                            >
                              <XCircle size={20} />
                              <span>Rejeter</span>
                            </button>

                            <button
                              onClick={() => {
                                validerInscription(selectedInscription.id);
                                setSelectedInscription(null);
                                setModalMode("details");
                              }}
                              disabled={loading.action}
                              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary-dark transition-all disabled:opacity-60 flex items-center justify-center space-x-2"
                            >
                              <CheckCircle size={20} />
                              <span>
                                {loading.action ? "Validation..." : "Valider"}
                              </span>
                            </button>
                          </div>
                        </>
                      )}

                      {modalMode === "rejet" && (
                        <>
                          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                            <div className="flex items-start space-x-4">
                              <img
                                src={resolvePhotoUrl(
                                  selectedInscription.photoUrl ||
                                    selectedInscription.photo,
                                  `${selectedInscription.prenom} ${selectedInscription.nom}`
                                )}
                                alt={`${selectedInscription.prenom} ${selectedInscription.nom}`}
                                className="w-16 h-16 rounded-xl object-cover border-2 border-red-200 shadow-sm"
                                onError={(e) => {
                                  const fullName = `${
                                    selectedInscription.prenom || ""
                                  } ${selectedInscription.nom || ""}`.trim();
                                  e.currentTarget.src = `https://ui-avatars.com/api/?background=DC2626&color=fff&name=${encodeURIComponent(
                                    fullName || "User"
                                  )}`;
                                }}
                              />
                              <div className="flex-1">
                                <AlertCircle
                                  className="text-red-600 inline-block mr-2 mb-1"
                                  size={20}
                                />
                                <div className="font-bold text-red-800 mb-1">
                                  {selectedInscription.prenom}{" "}
                                  {selectedInscription.nom}
                                </div>
                                <div className="text-sm text-red-700">
                                  {selectedInscription.email}
                                </div>
                                <div className="text-xs text-red-600 mt-1">
                                  {mapFiliere(selectedInscription.filiere)} - Promo{" "}
                                  {selectedInscription.promotion}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-black mb-3">
                              Motif(s) du Rejet * (vous pouvez en sélectionner plusieurs)
                            </label>
                            <div className="space-y-2">
                              {Object.keys(motifsRejet).map((motif) => (
                                <label
                                  key={motif}
                                  className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={motifsRejet[motif]}
                                    onChange={(e) => {
                                      const isChecked = e.target.checked;
                                      if (motif === "Autres" && isChecked) {
                                        // Si "Autres" est sélectionné, désélectionner tous les autres
                                        setMotifsRejet({
                                          "Promotion incorrecte": false,
                                          "Filière incorrecte": false,
                                          "Compte existant": false,
                                          "Nom/Prénom incorrect": false,
                                          "Non-lauréat": false,
                                          "Autres": true,
                                        });
                                      } else if (motif === "Autres" && !isChecked) {
                                        // Si "Autres" est désélectionné, vider les détails
                                        setMotifsRejet((prev) => ({
                                          ...prev,
                                          "Autres": false,
                                        }));
                                        setDetailsRejet("");
                                      } else if (motif !== "Autres" && isChecked) {
                                        // Si un autre motif est sélectionné, désélectionner "Autres" et vider les détails
                                        setMotifsRejet((prev) => {
                                          const newState = {
                                            ...prev,
                                            "Autres": false,
                                            [motif]: true,
                                          };
                                          if (prev["Autres"]) {
                                            setDetailsRejet("");
                                          }
                                          return newState;
                                        });
                                      } else {
                                        // Désélection normale
                                        setMotifsRejet((prev) => ({
                                          ...prev,
                                          [motif]: false,
                                        }));
                                      }
                                    }}
                                    className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                  />
                                  <span className="text-sm font-medium text-black">{motif}</span>
                                </label>
                              ))}
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              Le lauréat recevra une notification avec le(s) motif(s) sélectionné(s)
                            </div>
                          </div>

                          {/* Box de détails (disponible pour tous les motifs, obligatoire pour "Autres") */}
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-black mb-3">
                              Détails supplémentaires {motifsRejet["Autres"] && <span className="text-red-600">*</span>}
                              {!motifsRejet["Autres"] && <span className="text-gray-500 text-xs font-normal"> (optionnel)</span>}
                            </label>
                            <textarea
                              value={detailsRejet}
                              onChange={(e) => setDetailsRejet(e.target.value)}
                              placeholder={motifsRejet["Autres"] ? "Veuillez préciser la raison du rejet en détail..." : "Vous pouvez ajouter des détails supplémentaires sur le motif de rejet (optionnel)..."}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                              rows="4"
                            />
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-xs text-gray-500">
                                {motifsRejet["Autres"] 
                                  ? "Ces détails sont obligatoires et seront inclus dans la notification envoyée au lauréat"
                                  : "Ces détails optionnels seront inclus dans la notification envoyée au lauréat"}
                              </div>
                              {motifsRejet["Autres"] && (
                                <div className={`text-xs font-semibold ${detailsRejet.trim().length >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                  {detailsRejet.length} caractères (minimum 10)
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col md:flex-row gap-3">
                            <button
                              onClick={() => {
                                setModalMode("details");
                                setMotifRejet("");
                                setDetailsRejet("");
                                setMotifsRejet({
                                  "Promotion incorrecte": false,
                                  "Filière incorrecte": false,
                                  "Compte existant": false,
                                  "Nom/Prénom incorrect": false,
                                  "Non-lauréat": false,
                                  "Autres": false,
                                });
                              }}
                              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                            >
                              Retour aux Détails
                            </button>

                            <button
                              onClick={() => {
                                setSelectedInscription(null);
                                setMotifRejet("");
                                setDetailsRejet("");
                                setMotifsRejet({
                                  "Promotion incorrecte": false,
                                  "Filière incorrecte": false,
                                  "Compte existant": false,
                                  "Nom/Prénom incorrect": false,
                                  "Non-lauréat": false,
                                  "Autres": false,
                                });
                                setModalMode("details");
                              }}
                              className="flex-1 px-6 py-3 bg-gray-400 text-white rounded-xl font-semibold hover:bg-gray-500 transition-all"
                            >
                              Annuler
                            </button>

                            <button
                              onClick={() =>
                                rejeterInscription(selectedInscription.id)
                              }
                              disabled={
                                loading.action || 
                                Object.values(motifsRejet).every(v => !v) ||
                                (motifsRejet["Autres"] && !detailsRejet.trim())
                              }
                              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {loading.action ? "..." : "Confirmer le Rejet"}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* -------------------- REJETS -------------------- */}
            {activeTab === "rejets" && (
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 className="text-2xl font-bold text-red-600">
                    Historique des Rejets
                  </h2>
                  <button
                    onClick={fetchRejets}
                    disabled={loading.rejets}
                    className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-60"
                  >
                    {loading.rejets ? "Chargement..." : "Rafraîchir"}
                  </button>
                </div>

                {/* Filtre par motif */}
                <div className="mb-4 flex items-center gap-3 flex-wrap">
                  <label className="text-sm font-semibold text-gray-700">
                    Filtrer par motif:
                  </label>
                  <select
                    value={filtreMotifRejet}
                    onChange={(e) => {
                      setFiltreMotifRejet(e.target.value);
                      setPageRejets(1);
                    }}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none text-sm"
                  >
                    <option value="">Tous les motifs</option>
                    <option value="Promotion incorrecte">Promotion incorrecte</option>
                    <option value="Filière incorrecte">Filière incorrecte</option>
                    <option value="Compte existant">Compte existant</option>
                    <option value="Nom/Prénom incorrect">Nom/Prénom incorrect</option>
                    <option value="Non-lauréat">Non-lauréat</option>
                  </select>
                  {filtreMotifRejet && (
                    <button
                      onClick={() => {
                        setFiltreMotifRejet("");
                        setPageRejets(1);
                      }}
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                    >
                      ✕ Effacer le filtre
                    </button>
                  )}
                </div>

                {error.rejets && (
                  <div className="mb-4 text-sm text-red-600">
                    {error.rejets}
                  </div>
                )}

                {loading.rejets ? (
                  <div className="py-10 text-gray-500">
                    Chargement des rejets…
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {paginatedRejets.map((rejet) => {
                        const dateTime = formatDateTime(
                          rejet.updatedAt || rejet.dateRejet
                        );
                        const motifs = (rejet.motifRejet || "")
                          .split("|")
                          .map((m) => m.trim())
                          .filter((m) => m);
                        
                        return (
                          <div
                            key={rejet.id}
                            className="bg-white rounded-lg p-4 border-l-4 border-red-500 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <XCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-3 flex-wrap">
                                  <div className="flex-1 min-w-0">
                                    <div className="font-bold text-black text-base mb-1">
                                      {rejet.prenom} {rejet.nom}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                      {rejet.email}
                                    </div>
                                    
                                    {/* Motif du rejet */}
                                    {motifs.length > 0 && (
                                      <div className="mb-2">
                                        <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                          Motif du Rejet
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                          {motifs.map((motif, idx) => (
                                            <span
                                              key={idx}
                                              className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded"
                                            >
                                              {motif}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Date et heure */}
                                    <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                                      <div>
                                        <span className="font-semibold">Date:</span>{" "}
                                        {dateTime.date}
                                      </div>
                                      <div>
                                        <span className="font-semibold">Heure:</span>{" "}
                                        {dateTime.time}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {rejetsFiltered.length === 0 && (
                        <div className="text-gray-500 py-8 text-center">
                          {filtreMotifRejet
                            ? `Aucun rejet avec le motif "${filtreMotifRejet}".`
                            : "Aucun rejet."}
                        </div>
                      )}
                    </div>

                    {/* Pagination rejets */}
                    {rejetsFiltered.length > 0 && totalPagesRejets > 1 && (
                      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mt-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="text-sm text-gray-700">
                            Affichage de{" "}
                            <span className="font-semibold">
                              {startIndexRejets + 1} à{" "}
                              {Math.min(
                                endIndexRejets,
                                rejetsFiltered.length
                              )}
                            </span>{" "}
                            sur{" "}
                            <span className="font-semibold">
                              {rejetsFiltered.length}
                            </span>{" "}
                            rejet(s)
                            {filtreMotifRejet && (
                              <span className="text-gray-500">
                                {" "}(filtré par: {filtreMotifRejet})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                goToPage(
                                  pageRejets - 1,
                                  setPageRejets,
                                  totalPagesRejets
                                )
                              }
                              disabled={pageRejets === 1}
                              className={`px-3 py-2 rounded-lg border transition ${
                                pageRejets === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            <span className="text-sm text-gray-700 px-2">
                              Page <b>{pageRejets}</b> / {totalPagesRejets}
                            </span>

                            <button
                              onClick={() =>
                                goToPage(
                                  pageRejets + 1,
                                  setPageRejets,
                                  totalPagesRejets
                                )
                              }
                              disabled={pageRejets === totalPagesRejets}
                              className={`px-3 py-2 rounded-lg border transition ${
                                pageRejets === totalPagesRejets
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* -------------------- MESSAGES -------------------- */}
            {activeTab === "messages" && (
              <div>
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2
                    className="text-2xl font-bold"
                    style={{ color: "#77B254" }}
                  >
                    Messages reçus
                  </h2>

                  <button
                    onClick={fetchMessages}
                    disabled={loading.messages}
                    className="px-4 py-2 bg-gray-100 rounded-xl hover:bg-gray-200 disabled:opacity-60"
                  >
                    {loading.messages ? "Chargement..." : "Rafraîchir"}
                  </button>
                </div>

                {error.messages && (
                  <div className="mb-4 text-sm text-red-600">
                    {error.messages}
                  </div>
                )}

                {loading.messages ? (
                  <div className="py-10 text-gray-500">
                    Chargement des messages…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle
                      size={48}
                      className="mx-auto mb-4"
                      style={{ color: "#77B254" }}
                    />
                    <p className="text-lg font-semibold">
                      Aucun message pour le moment
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      {paginatedMessages.map((m) => (
                        <div
                          key={m.id}
                          className="bg-background rounded-2xl p-6 border-2 border-gray-200 hover:shadow-md transition-all"
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.borderColor = "#77B254")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.borderColor = "#E5E7EB")
                          }
                        >
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            <div className="flex-1 min-w-[260px]">
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Expéditeur
                              </div>
                              <div className="font-bold text-black text-lg">
                                {m.nom || "—"}
                              </div>
                              <div className="text-sm text-gray-600">
                                {m.email || "—"}
                              </div>

                              <div className="mt-4">
                                <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                  Sujet
                                </div>
                                <div className="text-sm font-semibold text-black">
                                  {m.sujet || "—"}
                                </div>
                              </div>

                              <div className="mt-4 bg-white rounded-xl p-4 border border-gray-200">
                                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                  Message
                                </div>
                                <div className="text-sm text-black whitespace-pre-wrap">
                                  {m.message || "—"}
                                </div>
                              </div>

                              <div className="mt-3 text-xs text-gray-500">
                                Reçu le :{" "}
                                {formatDate(m.createdAt || m.dateEnvoi)}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteMessage(m.id)}
                              className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all text-sm flex items-center gap-2"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                              Supprimer
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination messages */}
                    {messages.length > 0 && totalPagesMessages > 1 && (
                      <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 mt-4">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="text-sm text-gray-700">
                            Affichage de{" "}
                            <span className="font-semibold">
                              {startIndexMessages + 1} à{" "}
                              {Math.min(endIndexMessages, messages.length)}
                            </span>{" "}
                            sur{" "}
                            <span className="font-semibold">
                              {messages.length}
                            </span>{" "}
                            message(s)
                          </div>

                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                goToPage(
                                  pageMessages - 1,
                                  setPageMessages,
                                  totalPagesMessages
                                )
                              }
                              disabled={pageMessages === 1}
                              className={`px-3 py-2 rounded-lg border transition ${
                                pageMessages === 1
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>

                            <span className="text-sm text-gray-700 px-2">
                              Page <b>{pageMessages}</b> / {totalPagesMessages}
                            </span>

                            <button
                              onClick={() =>
                                goToPage(
                                  pageMessages + 1,
                                  setPageMessages,
                                  totalPagesMessages
                                )
                              }
                              disabled={pageMessages === totalPagesMessages}
                              className={`px-3 py-2 rounded-lg border transition ${
                                pageMessages === totalPagesMessages
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                                  : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdministrationPage;
