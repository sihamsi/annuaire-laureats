import React, { useEffect, useMemo, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  GraduationCap,
  TrendingUp,
  CheckCircle,
  Clock,
  Briefcase,
  MapPin,
  Award,
} from "lucide-react";

import AppNavbar from "../../components/common/Navbar/AppNavbar";
import {
  getGeolocalisationLaureats,
  getLaureats,
  getOrganismes,
} from "../../api/laureats.api";

/* =========================================================
   THEME (PALETTE HOMOGÈNE autour de #4F6B2B)
   ✅ 0 rouge / 0 bleu : uniquement olive + neutrals + gold doux
========================================================= */
const THEME = {
  brand: "#4F6B2B", // base
  brand650: "#446126",
  brand700: "#3E5523",
  brand800: "#2E3F1A",

  // tints (fonds)
  brand50: "#F3F6F1",
  brand100: "#E7EDE3",
  brand200: "#D0DBC7",

  // olive accents (variation)
  olive300: "#A9C08A",
  olive400: "#7A9653",
  olive500: "#5E7C3A",

  // gold accent (soft, premium)
  gold: "#B08D2C",
  goldSoft: "rgba(176,141,44,0.14)",

  // neutrals
  ink: "#0F172A",
  text: "#1F2937",
  muted: "#6B7280",
};

const PALETTE_OLIVE = [
  THEME.brand800,
  THEME.brand700,
  THEME.brand,
  THEME.olive500,
  THEME.olive400,
  THEME.olive300,
];

/* -----------------------------
   Helpers
------------------------------ */
const normalize = (v) => (v ?? "").toString().trim().toLowerCase();
const titleCase = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

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

const GENRE_LABELS = {
  homme: "Hommes",
  femme: "Femmes",
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
  if (!key) return "Non renseignée";
  if (FILIERE_LABELS[key]) return FILIERE_LABELS[key];
  return raw;
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

function countBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const k = keyFn(item);
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

function topN(map, n = 5) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([nom, valeur]) => ({ nom, valeur }));
}

/* -----------------------------
   UI helpers
------------------------------ */
function Card({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl border border-black/5 bg-white/85 backdrop-blur",
        "shadow-[0_12px_34px_-22px_rgba(0,0,0,0.35)]",
        "hover:shadow-[0_20px_55px_-30px_rgba(0,0,0,0.40)] transition-shadow",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(79,107,43,0.12)" }}
        >
          <Icon size={18} style={{ color: THEME.brand }} />
        </span>
        <h3 className="text-base font-semibold" style={{ color: THEME.ink }}>
          {title}
        </h3>
      </div>
      {subtitle ? (
        <p className="mt-1 text-sm" style={{ color: THEME.muted }}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

const kpiTone = (tone) => {
  // tone: "brand" | "gold"
  if (tone === "gold") return { bg: THEME.goldSoft, color: THEME.gold };
  return { bg: "rgba(79,107,43,0.12)", color: THEME.brand };
};

// ✅ charts colors (no red/blue)
const getPieColorByIndex = (index) =>
  PALETTE_OLIVE[index % PALETTE_OLIVE.length];

// ✅ Two-tone “stack” bars but still olive (public/prive removed)
const GEO_COL_A = THEME.brand; // olive
const GEO_COL_B = THEME.olive400; // lighter olive

const StatistiquesPage = () => {
  const [animateCharts, setAnimateCharts] = useState(false);
  const [laureats, setLaureats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setAnimateCharts(true), 250);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [laureatsRes, organismesRes, geoRes] = await Promise.all([
          getLaureats(),
          getOrganismes(),
          getGeolocalisationLaureats(),
        ]);

        const rawLaureats = Array.isArray(laureatsRes.data)
          ? laureatsRes.data
          : laureatsRes.data?.content || [];

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

        const normalized = rawLaureats.map((l) => ({
          ...l,
          organismeNom:
            l.autreOrganisme || organismesMap.get(l.organismeId) || "",
          province: l.province || provinceMap.get(l.id),
        }));

        if (!cancelled) setLaureats(normalized);
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

  const computed = useMemo(() => {
    const total = laureats.length;

    const statusCount = countBy(laureats, (l) => mapStatus(l.status));
    const valides = statusCount.get("published") || 0;
    const enAttente = statusCount.get("pending") || 0;
    const rejected = statusCount.get("rejected") || 0;
    const tauxValidation = total > 0 ? Math.round((valides / total) * 100) : 0;

    // Filières
    const filiereMap = countBy(laureats, (l) => mapFiliere(l.filiere));
    const statsParFiliere = Array.from(filiereMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nom, valeur], idx) => ({
        nom,
        valeur,
        pourcentage: total > 0 ? Math.round((valeur / total) * 100) : 0,
        color: PALETTE_OLIVE[idx % PALETTE_OLIVE.length],
      }));

    // Promotions
    const promoMap = countBy(
      laureats,
      (l) => (l.promotion ?? "").toString().trim() || "N/A"
    );
    const statsParPromotion = Array.from(promoMap.entries())
      .filter(([annee]) => annee !== "N/A")
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([annee, valeur]) => ({ annee, valeur }));

    // Secteur (public/prive) => PIE chart olive (2 slices olive)
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
    const statsParGenre = Array.from(genreMap.entries()).map(
      ([nom, valeur]) => ({
        nom,
        valeur,
        pourcentage: total > 0 ? Math.round((valeur / total) * 100) : 0,
      })
    );

    // Top organismes
    const orgMap = countBy(laureats, (l) => {
      const org = (l.organismeNom || l.autreOrganisme || l.organismeId || "")
        .toString()
        .trim();
      return org || "Non renseigné";
    });
    const topOrganismes = topN(orgMap, 5).map((x, idx) => ({
      nom: x.nom,
      laureats: x.valeur,
      secteur: "—",
      rank: idx + 1,
    }));

    // Top provinces
    const provMap = countBy(laureats, (l) =>
      (l.province || "").toString().trim()
    );
    const filteredProvEntries = Array.from(provMap.entries()).filter(
      ([province]) => province && province.toLowerCase() !== "non renseignée"
    );
    const topProvinces = filteredProvEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([nom, valeur], idx) => ({
        nom,
        laureats: valeur,
        rank: idx + 1,
      }));

    // Distribution geo (Top 4 provinces) => 2 barres olive (au lieu de public/prive)
    const geoMap = countBy(laureats, (l) =>
      (l.province || "Non renseignée").toString().trim()
    );

    const distributionGeo = Array.from(geoMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([ville, totalVille]) => {
        // on garde 2 sous-barres: validés vs en attente (toujours olive)
        const inVille = laureats.filter(
          (l) => (l.province || "Non renseignée").toString().trim() === ville
        );

        const valid = inVille.filter(
          (l) => mapStatus(l.status) === "published"
        ).length;
        const pend = inVille.filter(
          (l) => mapStatus(l.status) === "pending"
        ).length;

        return { ville, a: valid, b: pend, total: totalVille };
      });

    return {
      total,
      valides,
      enAttente,
      rejected,
      tauxValidation,
      statsParFiliere,
      statsParPromotion: statsParPromotion.length
        ? statsParPromotion
        : [{ annee: "—", valeur: 0 }],
      statsParSecteur,
      statsParGenre: statsParGenre.length
        ? statsParGenre
        : [{ nom: "Non renseigné", valeur: 0, pourcentage: 0 }],
      distributionGeo: distributionGeo.length
        ? distributionGeo
        : [{ ville: "—", a: 0, b: 0 }],
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
    { label: "Total Lauréats", value: stats.total, icon: Users, tone: "brand" },
    {
      label: "Profils Validés",
      value: stats.valides,
      icon: CheckCircle,
      tone: "brand",
    },
    { label: "En Attente", value: stats.enAttente, icon: Clock, tone: "gold" },
    {
      label: "Taux Validation",
      value: `${stats.tauxValidation}%`,
      icon: TrendingUp,
      tone: "brand",
    },
  ];

  const statsParFiliere = computed.statsParFiliere;
  const statsParPromotion = computed.statsParPromotion;

  // ✅ Secteur pie: 2 slices olive (no red/blue)
  const secteurTotal =
    computed.statsParSecteur.public + computed.statsParSecteur.prive;
  const secteurChartData = [
    { name: "Public", value: computed.statsParSecteur.public },
    { name: "Privé", value: computed.statsParSecteur.prive },
  ]
    .filter((x) => x.value > 0)
    .map((x) => ({
      ...x,
      percent:
        secteurTotal > 0 ? Math.round((x.value / secteurTotal) * 100) : 0,
    }));

  // ✅ Genre pie: 2 slices olive (no red/blue)
  const genreTotal = computed.statsParGenre
    .slice(0, 2)
    .reduce((s, g) => s + g.valeur, 0);
  const genreChartData = computed.statsParGenre
    .slice(0, 2)
    .map((g) => ({ name: g.nom, value: g.valeur }))
    .filter((x) => x.value > 0)
    .map((x, idx) => ({
      ...x,
      percent: genreTotal > 0 ? Math.round((x.value / genreTotal) * 100) : 0,
      color: PALETTE_OLIVE[idx + 2], // keep it olive
    }));

  const distributionGeo = computed.distributionGeo;
  const topOrganismes = computed.topOrganismes;
  const topProvinces = computed.topProvinces;

  const maxPromotion = Math.max(...statsParPromotion.map((s) => s.valeur), 1);
  const maxGeo = Math.max(...distributionGeo.flatMap((d) => [d.a, d.b]), 1);

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(180deg, ${THEME.brand50} 0%, #FFFFFF 45%, ${THEME.brand100} 100%)`,
      }}
    >
      <AppNavbar />

      {/* soft accents */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -right-32 h-96 w-96 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-black/5 blur-3xl" />
      </div>

      <div className="w-full mx-auto px-5 md:px-8 lg:px-10 pt-24 pb-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1
              className="text-4xl md:text-5xl font-serif tracking-tight"
              style={{ color: THEME.ink }}
            >
              Tableau de Bord
            </h1>
          </div>
        </div>

        {loading && (
          <Card className="p-5 mb-6">
            <div style={{ color: THEME.text }}>
              Chargement des statistiques…
            </div>
          </Card>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 mb-6 text-red-700">
            Erreur: {error}
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {kpis.map((kpi, idx) => {
            const t = kpiTone(kpi.tone);
            return (
              <Card key={idx} className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm" style={{ color: THEME.muted }}>
                      {kpi.label}
                    </div>
                    <div
                      className="mt-2 text-3xl font-bold"
                      style={{ color: THEME.ink }}
                    >
                      {kpi.value}
                    </div>
                  </div>

                  <div
                    className="h-11 w-11 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: t.bg }}
                  >
                    <kpi.icon size={20} style={{ color: t.color }} />
                  </div>
                </div>

                <div className="mt-4 h-[1px] bg-black/5" />
              </Card>
            );
          })}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Promotions */}
          <Card className="p-5">
            <SectionTitle
              icon={GraduationCap}
              title="Promotions"
              subtitle="Évolution du nombre de lauréats par année"
            />
            <div className="relative h-56">
              <div className="flex items-end justify-around h-52 pt-2">
                {statsParPromotion.map((promo, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center justify-end"
                    style={{ width: "14%" }}
                  >
                    <div
                      className="w-full rounded-t-xl transition-all duration-700 hover:opacity-90 cursor-pointer"
                      style={{
                        height: animateCharts
                          ? `${(promo.valeur / maxPromotion) * 170}px`
                          : "0px",
                        background: `linear-gradient(to top, ${THEME.brand800}, ${THEME.brand}, ${THEME.olive300})`,
                        transitionDelay: `${idx * 45}ms`,
                      }}
                      title={`${promo.annee} : ${promo.valeur}`}
                    />
                    <div
                      className="text-[11px] font-medium mt-2"
                      style={{ color: THEME.muted }}
                    >
                      {promo.annee}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Secteurs (pie olive only) */}
          <Card className="p-5">
            <SectionTitle
              icon={Briefcase}
              title="Secteurs"
              subtitle="Répartition Public / Privé "
            />
            {secteurChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={secteurChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {secteurChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={getPieColorByIndex(index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} lauréat(s)`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const data = secteurChartData.find(
                        (d) => d.name === value
                      );
                      return data ? `${value} (${data.percent}%)` : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-48"
                style={{ color: THEME.muted }}
              >
                Aucune donnée disponible
              </div>
            )}
          </Card>

          {/* Filières */}
          <Card className="p-5">
            <SectionTitle
              icon={Award}
              title="Filières"
              subtitle="Poids relatif par spécialité"
            />
            <div className="space-y-4">
              {statsParFiliere.map((f, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: THEME.text }}
                    >
                      {f.nom}
                    </span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: THEME.ink }}
                    >
                      {f.valeur}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-black/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: animateCharts ? `${f.pourcentage}%` : "0%",
                          background: `linear-gradient(90deg, ${THEME.brand800}, ${f.color}, ${THEME.olive300})`,
                          transitionDelay: `${idx * 80}ms`,
                        }}
                      />
                    </div>
                    <span
                      className="text-xs w-10 text-right"
                      style={{ color: THEME.muted }}
                    >
                      {f.pourcentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Geo + Genre */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          {/* Geo (validés vs en attente, olive only) */}
          <Card className="p-5">
            <SectionTitle
              icon={MapPin}
              title="Distribution Géographique"
              subtitle="Top 4 provinces (Validés vs En attente)"
            />

            <div className="flex items-end justify-around h-56">
              {distributionGeo.map((d, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center"
                  style={{ width: "22%" }}
                >
                  <div className="w-full flex gap-2 items-end h-48">
                    <div
                      className="flex-1 rounded-t-xl transition-all duration-700"
                      style={{
                        height: animateCharts
                          ? `${(d.a / maxGeo) * 180}px`
                          : "0px",
                        background: `linear-gradient(to top, ${THEME.brand800}, ${GEO_COL_A})`,
                        transitionDelay: `${idx * 90}ms`,
                      }}
                      title={`Validés: ${d.a}`}
                    />
                    <div
                      className="flex-1 rounded-t-xl transition-all duration-700"
                      style={{
                        height: animateCharts
                          ? `${(d.b / maxGeo) * 180}px`
                          : "0px",
                        background: `linear-gradient(to top, ${THEME.brand700}, ${GEO_COL_B})`,
                        transitionDelay: `${idx * 90 + 45}ms`,
                      }}
                      title={`En attente: ${d.b}`}
                    />
                  </div>
                  <div
                    className="mt-2 text-[11px] font-medium text-center line-clamp-2"
                    style={{ color: THEME.text }}
                  >
                    {d.ville}
                  </div>
                </div>
              ))}
            </div>

            <div
              className="mt-3 flex items-center gap-4 text-xs"
              style={{ color: THEME.muted }}
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: GEO_COL_A }}
                />
                Validés
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: GEO_COL_B }}
                />
                En attente
              </div>
            </div>
          </Card>

          {/* Genre (pie olive only) */}
          <Card className="p-5">
            <SectionTitle
              icon={Users}
              title="Répartition Genre"
              subtitle="Hommes / Femmes "
            />

            {genreChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={genreChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={false}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {genreChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || getPieColorByIndex(index)}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [`${value} lauréat(s)`, name]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => {
                      const data = genreChartData.find((d) => d.name === value);
                      return data ? `${value} (${data.percent}%)` : value;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div
                className="flex items-center justify-center h-48"
                style={{ color: THEME.muted }}
              >
                Aucune donnée disponible
              </div>
            )}
          </Card>
        </div>

        {/* Top lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <SectionTitle
              icon={Briefcase}
              title="Top Organismes Employeurs"
              subtitle="5 organismes les plus représentés"
            />
            <div className="space-y-3">
              {topOrganismes.map((org) => (
                <div
                  key={org.rank}
                  className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background:
                          org.rank <= 2
                            ? `linear-gradient(180deg, ${THEME.brand800}, ${THEME.brand})`
                            : `linear-gradient(180deg, ${THEME.brand700}, ${THEME.olive500})`,
                      }}
                    >
                      {org.rank}
                    </div>
                    <div>
                      <div
                        className="font-semibold text-sm"
                        style={{ color: THEME.ink }}
                      >
                        {org.nom}
                      </div>
                      <div className="text-xs" style={{ color: THEME.muted }}>
                        {org.secteur}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-xl font-bold"
                      style={{ color: THEME.brand }}
                    >
                      {org.laureats}
                    </div>
                    <div className="text-xs" style={{ color: THEME.muted }}>
                      lauréats
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle
              icon={MapPin}
              title="Top Provinces"
              subtitle="5 provinces les plus représentées"
            />
            <div className="space-y-3">
              {topProvinces.map((p) => (
                <div
                  key={p.rank}
                  className="flex items-center justify-between rounded-2xl border border-black/5 bg-white p-4"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-bold"
                      style={{
                        background:
                          p.rank <= 2
                            ? `linear-gradient(180deg, ${THEME.brand800}, ${THEME.brand})`
                            : `linear-gradient(180deg, ${THEME.brand700}, ${THEME.olive500})`,
                      }}
                    >
                      {p.rank}
                    </div>
                    <div
                      className="font-semibold text-sm"
                      style={{ color: THEME.ink }}
                    >
                      {p.nom}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className="text-xl font-bold"
                      style={{ color: THEME.brand }}
                    >
                      {p.laureats}
                    </div>
                    <div className="text-xs" style={{ color: THEME.muted }}>
                      lauréats
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
};

export default StatistiquesPage;
