import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  Building2,
  MapPin,
  ArrowRight,
} from "lucide-react";

import AppNavbar from "../../components/common/Navbar/AppNavbar";
import { ROUTES } from "../../utils/constants";

// Images
import heroEhtp from "../../assets/styles/hero-ehtp.png";
import logoEhtp from "../../assets/styles/logo-ehtp.png";
import alumniHero from "../../assets/styles/alumni-hero.png";

// APIs (celles qui fonctionnent chez toi)
import {
  getGeolocalisationLaureats,
  getLaureats,
  getOrganismes,
} from "../../api/laureats.api";

// Helpers
const normalize = (v) => (v ?? "").toString().trim().toLowerCase();

const STATUS_LABELS = {
  pending: "pending",
  published: "published",
  rejected: "rejected",
};

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

// UI
const Pill = ({ children }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl text-white/90">
    {children}
  </div>
);

const StatCard = ({ label, value, icon: Icon, hint }) => (
  <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-white/75 text-sm">{label}</div>
        <div className="mt-2 text-3xl md:text-4xl font-semibold text-white">
          {value}
        </div>
        {hint ? <div className="mt-2 text-xs text-white/60">{hint}</div> : null}
      </div>
      <div className="h-11 w-11 rounded-2xl bg-white/15 flex items-center justify-center">
        <Icon className="text-white" size={20} />
      </div>
    </div>
  </div>
);

const FeatureCard = ({ title, desc, icon: Icon }) => (
  <div className="group rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm transition hover:shadow-lg">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
        <Icon className="text-neutral-900" size={22} />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
    </div>
    <p className="mt-3 text-sm leading-6 text-neutral-600">{desc}</p>
    <div className="mt-6 h-[2px] w-10 bg-neutral-200 transition group-hover:w-16" />
  </div>
);

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [laureats, setLaureats] = useState([]);
  const [organismes, setOrganismes] = useState([]);
  const [geoList, setGeoList] = useState([]);

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

        const orgs = Array.isArray(organismesRes.data)
          ? organismesRes.data
          : [];
        const geo = Array.isArray(geoRes.data) ? geoRes.data : [];

        const orgMap = new Map(orgs.map((o) => [o.id, o.nom]));
        const provinceMap = new Map(geo.map((g) => [g.id, g.province]));

        const normalized = rawLaureats.map((l) => ({
          ...l,
          organismeNom: l.autreOrganisme || orgMap.get(l.organismeId) || "",
          province: (l.province || provinceMap.get(l.id) || "")
            .toString()
            .trim(),
        }));

        if (!cancelled) {
          setLaureats(normalized);
          setOrganismes(orgs);
          setGeoList(geo);
        }
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

  // ✅ Stats réelles (à partir des mêmes règles que ta page statistiques)
  const computed = useMemo(() => {
    const total = laureats.length;

    const statusCount = countBy(laureats, (l) => mapStatus(l.status));
    const valides = statusCount.get("published") || 0;
    const enAttente = statusCount.get("pending") || 0;

    const tauxValidation = total > 0 ? Math.round((valides / total) * 100) : 0;

    const orgMap = countBy(laureats, (l) => {
      const v = (l.organismeNom || l.autreOrganisme || "").toString().trim();
      return v || "Non renseigné";
    });

    const provMap = countBy(laureats, (l) => {
      const p = (l.province || "").toString().trim();
      return p || "Non renseigné";
    });

    const topOrganismes = topN(orgMap, 3);
    const topProvinces = topN(
      new Map(
        Array.from(provMap.entries()).filter(
          ([k]) => k && normalize(k) !== "non renseigné"
        )
      ),
      3
    );

    return {
      total,
      valides,
      enAttente,
      tauxValidation,
      nbOrganismes: organismes.length,
      nbProvinces: new Set(
        Array.from(provMap.keys()).filter(
          (k) => k && normalize(k) !== "non renseigné"
        )
      ).size,
      topOrganismes,
      topProvinces,
    };
  }, [laureats, organismes]);

  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <AppNavbar />
      {/* ✅ HERO: 100% hauteur & image full cover */}
      <header className="relative min-h-screen w-full">
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${heroEhtp})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/70" />

        <div className="relative min-h-screen w-full flex items-center">
          <div className="w-full px-5 md:px-10 lg:px-16 pt-24">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                {/* Texte */}
                <div className="lg:col-span-7">
                  <Pill>
                    <img
                      src={logoEhtp}
                      alt="EHTP"
                      className="w-7 h-7 rounded-full"
                    />
                    <span className="text-sm">
                      Career Tracker EHTP • Réseau officiel des lauréats
                    </span>
                  </Pill>

                  <h1 className="mt-6 text-white font-serif tracking-tight text-4xl md:text-6xl leading-[1.05]">
                    Connecter les lauréats d’hier,
                    <br className="hidden md:block" />
                    d’aujourd’hui et de demain.
                  </h1>

                  <p className="mt-5 text-white/80 max-w-2xl leading-7">
                    Une plateforme professionnelle pour retrouver vos camarades,
                    visualiser la présence des lauréats sur la carte SIG et
                    développer votre réseau.
                  </p>

                  <div className="mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={ROUTES.ANNUAIRE || "/annuaire"}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-neutral-900 px-7 py-3 font-semibold hover:bg-neutral-100 transition"
                    >
                      Explorer l’annuaire <ArrowRight size={18} />
                    </Link>

                    <Link
                      to={ROUTES.CARTE_SIG || "/carte-sig"}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-xl text-white px-7 py-3 font-semibold hover:bg-white/15 transition"
                    >
                      Ouvrir la Carte SIG <MapPin size={18} />
                    </Link>
                  </div>

                  {error ? (
                    <div className="mt-6 rounded-2xl border border-red-300/30 bg-red-500/10 text-red-100 px-4 py-3 text-sm">
                      {error}
                    </div>
                  ) : null}
                </div>

                {/* Stats réelles */}
                <div className="lg:col-span-5">
                  <div className="grid grid-cols-2 gap-4">
                    <StatCard
                      label="Total lauréats"
                      value={loading ? "…" : computed.total}
                      icon={Users}
                      hint="Profils enregistrés"
                    />
                    <StatCard
                      label="Profils validés"
                      value={loading ? "…" : computed.valides}
                      icon={CheckCircle}
                      hint="Statut publié"
                    />
                    <StatCard
                      label="En attente"
                      value={loading ? "…" : computed.enAttente}
                      icon={Clock}
                      hint="À valider"
                    />
                    <StatCard
                      label="Taux validation"
                      value={loading ? "…" : `${computed.tauxValidation}%`}
                      icon={TrendingUp}
                      hint="Validés / total"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="text-white/75 text-sm">Organismes</div>
                        <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                          <Building2 className="text-white" size={18} />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {loading ? "…" : computed.nbOrganismes}
                      </div>
                      <div className="mt-3 text-xs text-white/60">
                        {computed.topOrganismes?.length
                          ? `Top: ${computed.topOrganismes
                              .map((x) => x.nom)
                              .slice(0, 2)
                              .join(" • ")}`
                          : "—"}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
                      <div className="flex items-center justify-between">
                        <div className="text-white/75 text-sm">Provinces</div>
                        <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center">
                          <MapPin className="text-white" size={18} />
                        </div>
                      </div>
                      <div className="mt-2 text-2xl font-semibold text-white">
                        {loading ? "…" : computed.nbProvinces}
                      </div>
                      <div className="mt-3 text-xs text-white/60">
                        {computed.topProvinces?.length
                          ? `Top: ${computed.topProvinces
                              .map((x) => x.nom)
                              .slice(0, 2)
                              .join(" • ")}`
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
      </header>
      {/* ✅ FEATURES */}
      <section className="w-full py-16 md:py-20 px-5 md:px-10 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-neutral-900">
              Une expérience claire, moderne et professionnelle
            </h2>
            <p className="mt-3 text-neutral-600 max-w-3xl mx-auto">
              Les fonctionnalités essentielles, organisées pour une navigation
              fluide.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={Users}
              title="Recherche avancée"
              desc="Trouvez vos anciens par promotion, filière, organisme ou localisation."
            />
            <FeatureCard
              icon={MapPin}
              title="Carte SIG"
              desc="Explorez la répartition géographique des lauréats avec précision."
            />
            <FeatureCard
              icon={Building2}
              title="Organismes"
              desc="Identifiez les employeurs majeurs et suivez la présence des profils."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Statistiques"
              desc="Visualisez l’évolution et les indicateurs clés en temps réel."
            />
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              to={ROUTES.STATISTIQUES || "/statistiques"}
              className="rounded-full bg-neutral-900 text-white px-8 py-3 font-semibold hover:bg-neutral-800 transition"
            >
              Accéder au tableau de bord
            </Link>
          </div>
        </div>
      </section>
      {/* ✅ CTA */}
      <section className="py-16 px-8 bg-gray-50">
        {" "}
        <div className="max-w-4xl mx-auto flex items-center gap-20">
          {" "}
          <div className="flex-shrink-0">
            {" "}
            <img
              src={alumniHero}
              alt="Lauréat EHTP"
              className="w-220 h-120 object-contain rounded-lg"
            />{" "}
          </div>{" "}
          <div className="flex-1">
            {" "}
            <h2 className="text-2xl font-semibold text-black mb-6">
              {" "}
              Vous êtes lauréat de l'EHTP ? Rejoignez l'annuaire !{" "}
            </h2>{" "}
            <p className="text-gray-700 mb-4">
              {" "}
              Vous avez obtenu votre diplôme à École Hassania des Travaux
              Publics et souhaitez rester connecté avec vos anciens camarades ?
              Saisissez l'annuaire officiel des lauréats de EHTP.{" "}
            </p>{" "}
            <p className="text-gray-700 mb-4">
              {" "}
              En vous inscrivant, vous retrouverez vos camarades de promotion,
              élargirez votre réseau professionnel et accéderez à des
              opportunités exclusives. De plus, vous profiterez de nombreux
              autres avantages en rejoignant notre communauté. Comment nous
              rejoindre :{" "}
            </p>{" "}
            <ol className="text-gray-700 mb-4 space-y-2">
              {" "}
              <li>1. Cliquez sur le bouton ci-dessous</li>{" "}
              <li>2. Remplissez le formulaire d'inscription</li>{" "}
              <li>3. Validez votre profil et commencez à explorer.</li>{" "}
            </ol>{" "}
            <p className="text-gray-700 mb-6">
              {" "}
              N'attendez plus, inscrivez-vous à l'annuaire EHTP dès aujourd'hui
              ! Vous êtes lauréat de l'école Hassania ?{" "}
            </p>{" "}
          </div>{" "}
        </div>{" "}
      </section>
      {/* Footer */}{" "}
      <footer
        className="bg-footer text-white py-12 px-8"
        style={{ backgroundColor: "#4F6B2B" }}
      >
        {" "}
        <div className="max-w-6xl mx-auto">
          {" "}
          <div className="flex justify-between items-start mb-8">
            {" "}
            <div>
              {" "}
              <div className="flex items-center gap-2 mb-4">
                {" "}
                <img src={logoEhtp} alt="EHTP Logo" className="w-8 h-8" />{" "}
                <span className="font-semibold">Career Tracker EHTP</span>{" "}
              </div>{" "}
              <p className="text-sm text-white mb-2">
                {" "}
                École Hassania Travaux Publics KM 7 Route{" "}
              </p>{" "}
              <p className="text-sm text-white mb-2">
                {" "}
                d'El Jadida Casablanca BP 8108 Maroc{" "}
              </p>{" "}
              <p className="text-sm text-white mb-2">+212 520 42 08 12</p>{" "}
              <p className="text-sm text-white">contact@ehtp.ac.ma</p>{" "}
            </div>{" "}
            <div>
              {" "}
              <Link
                to={ROUTES.CONTACT}
                className="bg-white text-green-800 px-6 py-2 rounded-full hover:bg-gray-100 transition-colors font-semibold inline-block"
              >
                {" "}
                Contactez-nous{" "}
              </Link>{" "}
            </div>{" "}
          </div>{" "}
          <div className="border-t border-green-700 pt-8 flex justify-between text-sm text-white">
            {" "}
            <div className="flex gap-6">
              {" "}
              <Link to={ROUTES.HOME} className="hover:text-gray-200">
                {" "}
                Acceuil{" "}
              </Link>{" "}
              <Link to="/annuaire" className="hover:text-gray-200">
                {" "}
                Annuaire{" "}
              </Link>{" "}
              <Link to={ROUTES.A_PROPOS} className="hover:text-gray-200">
                {" "}
                À propos{" "}
              </Link>{" "}
              <Link to={ROUTES.CONTACT} className="hover:text-gray-200">
                {" "}
                Contactez-nous{" "}
              </Link>{" "}
            </div>{" "}
            <div>Career Tracker EHTP © 2025. All rights reserved.</div>{" "}
          </div>{" "}
        </div>{" "}
      </footer>{" "}
    </div>
  );
}
