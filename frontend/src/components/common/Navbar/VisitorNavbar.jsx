import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Users, Map as MapIcon, BarChart3, Info, Mail } from "lucide-react";
import { ROUTES } from "../../../utils/constants";
import logoEhtp from "../../../assets/styles/logo-ehtp.png";

const VisitorNavbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const getLinkClassName = (path) => {
    const baseClass = "text-gray-700 hover:text-gray-900 flex items-center gap-2";
    const activeClass = isActive(path)
      ? "text-primary hover:text-primary-dark font-semibold"
      : "";
    return `${baseClass} ${activeClass}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-8 py-4 border-b shadow-sm">
      <div className="flex items-center gap-2">
        <img src={logoEhtp} alt="EHTP Logo" className="w-10 h-10" />
        <span className="font-semibold text-lg">Career Tracker EHTP</span>
      </div>

      <nav className="flex items-center gap-8">
        <Link to={ROUTES.ANNUAIRE} className={getLinkClassName(ROUTES.ANNUAIRE)}>
          <Users size={18} />
          <span>Annuaire</span>
        </Link>
        <Link to="/visiteur/carte" className={getLinkClassName("/visiteur/carte")}>
          <MapIcon size={18} />
          <span>Carte SIG</span>
        </Link>
        <Link
          to={ROUTES.STATISTIQUES}
          className={getLinkClassName(ROUTES.STATISTIQUES)}
        >
          <BarChart3 size={18} />
          <span>Statistiques</span>
        </Link>
        <Link
          to={ROUTES.A_PROPOS}
          className={getLinkClassName(ROUTES.A_PROPOS)}
        >
          <Info size={18} />
          <span>À propos</span>
        </Link>
        <Link to={ROUTES.CONTACT} className={getLinkClassName(ROUTES.CONTACT)}>
          <Mail size={18} />
          <span>Contactez-nous</span>
        </Link>
        <Link
          to="/"
          className="text-gray-600 hover:text-gray-900 text-sm"
        >
          ← Retour à l'accueil
        </Link>
      </nav>
    </header>
  );
};

export default VisitorNavbar;
