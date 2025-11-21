import React from "react";

const Footer = () => {
  return (
    <footer id="contact" className="w-full bg-ehtpGreen text-white mt-10">
      <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[2fr,1.5fr] gap-8">
        {/* Bloc gauche : logo + infos */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <img
              src="/assets/images/logo-ehtp.png"
              alt="Career Tracker EHTP"
              className="w-10 h-10 rounded-full object-contain bg-white"
            />
            <span className="text-lg font-semibold">Career Tracker EHTP</span>
          </div>

          <p className="text-sm leading-relaxed">
            Ecole Hassania Travaux Publics KM 7 Route d’El Jadida<br />
            Casablanca BP 8108 Maroc<br />
            +212 520 42 05 12<br />
            <a href="mailto:contact@ehtp.ac.ma" className="underline">
              contact@ehtp.ac.ma
            </a>
          </p>
        </div>

        {/* Bloc droit : newsletter */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold">Contactez-nous</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Your email address..."
              className="flex-1 px-4 py-2 rounded-md text-slate-900 text-sm outline-none"
            />
            <button className="px-6 py-2 rounded-md bg-blue-500 text-sm font-semibold hover:bg-blue-600 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Ligne + liens bas */}
      <div className="max-w-6xl mx-auto px-6 pb-6 border-t border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 pt-4 text-xs text-white/80">
          <nav className="flex gap-4">
            <a href="#hero" className="hover:text-white">
              Accueil
            </a>
            <a href="#rechercher" className="hover:text-white">
              Rechercher
            </a>
            <a href="#apropos" className="hover:text-white">
              À propos
            </a>
            <a href="#contact" className="hover:text-white">
              Contactez-nous
            </a>
          </nav>
          <span>Career Tracker EHTP © 2025. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
