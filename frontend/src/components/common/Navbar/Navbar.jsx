import React from "react";

const Navbar = ({ activeSection }) => {
  return (
    <header className="w-full bg-white/90 backdrop-blur fixed top-0 left-0 z-50 shadow-sm">
      <div className="w-full px-6 py-3">
        <div className="flex items-center w-full">
          {/* LOGO + TEXTE - tout à gauche */}
          <div className="flex items-center gap-3 flex-none">
            <img
              src="/assets/images/logo-ehtp.png"
              alt="Career Tracker EHTP"
              className="w-11 h-11 rounded-full object-contain"
            />
            <span className="text-[18px] font-semibold text-black">
              Career Tracker EHTP
            </span>
          </div>

          {/* LIENS au centre */}
          <nav className="hidden md:flex flex-1 justify-center items-center gap-16 text-[15px] text-black font-semibold">
            <a
              href="#hero"
              className={`hover:text-ehtpGreen transition-colors ${
                activeSection === "hero" ? "text-ehtpGreen" : ""
              }`}
            >
              Accueil
            </a>
            <a
              href="#rechercher"
              className={`hover:text-ehtpGreen transition-colors ${
                activeSection === "rechercher" ? "text-ehtpGreen" : ""
              }`}
            >
              Rechercher
            </a>
            <a
              href="#apropos"
              className={`hover:text-ehtpGreen transition-colors ${
                activeSection === "apropos" ? "text-ehtpGreen" : ""
              }`}
            >
              À propos
            </a>
            <a
              href="#contact"
              className={`hover:text-ehtpGreen transition-colors ${
                activeSection === "contact" ? "text-ehtpGreen" : ""
              }`}
            >
              Contactez-nous
            </a>
          </nav>

          {/* Bouton Se Connecter à droite */}
          <button
            className="flex-none inline-flex items-center px-6 py-2 rounded-full 
                       bg-ehtpGreen text-white text-sm font-medium 
                       border border-ehtpGreen
                       hover:bg-white hover:text-ehtpGreen
                       transition-colors"
          >
            Se Connecter ↗
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
