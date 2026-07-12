import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Users, Map as MapIcon, Settings, LogOut } from "lucide-react";
import { ROUTES } from "../../../utils/constants";
import { useAuth } from "../../../context/AuthContext";
import logoEhtp from "../../../assets/styles/logo-ehtp.png";

const AdminNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const getLinkClassName = (path) => {
    const baseClass = "text-gray-700 hover:text-gray-900 flex items-center gap-2";
    const activeClass = isActive(path)
      ? "text-primary hover:text-primary-dark font-semibold"
      : "";
    return `${baseClass} ${activeClass}`;
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white flex items-center justify-between px-8 py-4 border-b shadow-sm">
      <div className="flex items-center gap-2">
        <img src={logoEhtp} alt="EHTP Logo" className="w-10 h-10" />
        <span className="font-semibold text-lg">Espace Administrateur</span>
      </div>

      <nav className="flex items-center gap-8">
        <Link to="/admin/annuaire" className={getLinkClassName("/admin/annuaire")}>
          <Users size={18} />
          <span>Annuaire</span>
        </Link>
        <Link to="/admin/carte-sig" className={getLinkClassName("/admin/carte-sig")}>
          <MapIcon size={18} />
          <span>Carte SIG</span>
        </Link>
        <Link
          to="/admin/administration"
          className={getLinkClassName("/admin/administration")}
        >
          <Settings size={18} />
          <span>Administration</span>
        </Link>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors flex items-center gap-2"
          title="Déconnexion"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </nav>
    </header>
  );
};

export default AdminNavbar;
