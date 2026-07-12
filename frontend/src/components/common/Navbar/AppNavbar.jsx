import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Map as MapIcon,
  BarChart3,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { ROUTES } from "../../../utils/constants";
import { useAuth } from "../../../context/AuthContext";
import logoEhtp from "../../../assets/styles/logo-ehtp.png";

const AppNavbar = () => {
  const location = useLocation();
  const { isAuthenticated, logout, user, isAdmin } = useAuth();

  const isActive = (path) => {
    if (path === ROUTES.HOME) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const getLinkClassName = (path, hasIcon = false) => {
    const baseClass = hasIcon
      ? "text-gray-700 hover:text-gray-900 flex items-center gap-2"
      : "text-gray-700 hover:text-gray-900";
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
        {isAuthenticated ? (
          <>
            {/* Navbar commune pour connectés */}
            <Link to="/annuaire" className={getLinkClassName("/annuaire", true)}>
              <Users size={18} />
              <span>Annuaire</span>
            </Link>
            <Link to="/carte-sig" className={getLinkClassName("/carte-sig", true)}>
              <MapIcon size={18} />
              <span>Carte SIG</span>
            </Link>
            <Link
              to="/statistiques"
              className={getLinkClassName("/statistiques", true)}
            >
              <BarChart3 size={18} />
              <span>Statistiques</span>
            </Link>
            {/* Lien spécifique selon le type d'utilisateur */}
            {isAdmin ? (
              <Link
                to="/administration"
                className={getLinkClassName("/administration", true)}
              >
                <Settings size={18} />
                <span>Administration</span>
              </Link>
            ) : (
              <Link
                to="/mon-profil"
                className={getLinkClassName("/mon-profil", true)}
              >
                <User size={18} />
                <span>Mon profil</span>
              </Link>
            )}
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2"
              title="Déconnexion"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </>
        ) : (
          <>
            {/* Navbar pour visiteur (non connecté) */}
            <Link to={ROUTES.HOME} className={getLinkClassName(ROUTES.HOME, true)}>
              <Home size={18} />
              <span>Accueil</span>
            </Link>
            <Link to="/annuaire" className={getLinkClassName("/annuaire", true)}>
              <Users size={18} />
              <span>Annuaire</span>
            </Link>
            <Link to="/carte-sig" className={getLinkClassName("/carte-sig", true)}>
              <MapIcon size={18} />
              <span>Carte SIG</span>
            </Link>
            <Link
              to="/statistiques"
              className={getLinkClassName("/statistiques", true)}
            >
              <BarChart3 size={18} />
              <span>Statistiques</span>
            </Link>
            <Link
              to={ROUTES.A_PROPOS}
              className={getLinkClassName(ROUTES.A_PROPOS)}
            >
              À propos
            </Link>
            <Link to={ROUTES.CONTACT} className={getLinkClassName(ROUTES.CONTACT)}>
              Contactez-nous
            </Link>
            <Link
              to="/login"
              className="bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors"
            >
              Se Connecter
            </Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default AppNavbar;

