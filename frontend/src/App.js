import React, { useEffect, useState } from "react";
import Navbar from "./components/common/Navbar/Navbar";
import Footer from "./components/common/Footer/Footer";

function App() {
  const [activeSection, setActiveSection] = useState("hero");

  // Scrollspy : change activeSection selon la position du scroll
  useEffect(() => {
    const sectionIds = ["hero", "rechercher", "apropos", "contact"];

    const handleScroll = () => {
      const scrollPos = window.scrollY + 120; // on compense la hauteur du navbar
      let current = "hero";

      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          const offsetTop = el.offsetTop;
          if (scrollPos >= offsetTop) {
            current = id;
          }
        }
      });

      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // pour initialiser
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar activeSection={activeSection} />

      {/* on laisse de la place pour le navbar fixe */}
      <main id="hero" className="pt-24">
        {/* SECTION 1 : Titre + grosse image */}
        <section className="max-w-4xl mx-auto px-6 text-center mt-8" id="hero">
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-8">
            Connecter les lauréats d’hier,
            <br />
            d’aujourd’hui et de demain.
          </h1>

          <div className="flex flex-col items-center">
            {/* image carte */}
            <img
              src="/assets/images/hero-ehtp.png"
              alt="Réseau des lauréats EHTP"
              className="w-full max-w-3xl rounded-3xl shadow-sm"
            />
            <p className="mt-3 text-sm italic text-slate-600">
              L’annuaire officiel des lauréats de l’École Hassania
            </p>
          </div>
        </section>

        {/* SECTION 2 : Plateforme officielle + 4 blocs  */}
        <section
          className="max-w-5xl mx-auto px-6 mt-20"
          id="rechercher" /* on scrolle ici avec le lien "Rechercher" */
        >
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-left">
            Career Tracker EHTP est la plateforme officielle de mise en réseau
            des diplômés de l’École Hassania des Travaux Publics.
          </h2>

          <div className="border-t border-slate-200 mt-10 mb-8" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-left text-[14px]">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🔗</span>
                <h3 className="font-semibold text-sm">Rechercher des anciens</h3>
              </div>
              <p className="text-slate-600">
                Trouvez facilement vos anciens camarades par promotion,
                spécialité ou entreprise.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🌍</span>
                <h3 className="font-semibold text-sm">Réseautage</h3>
              </div>
              <p className="text-slate-600">
                Découvrez les expériences et les postes occupés par les diplômés
                à travers le monde.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">👥</span>
                <h3 className="font-semibold text-sm">Opportunités</h3>
              </div>
              <p className="text-slate-600">
                Échangez via la messagerie intégrée et développez votre réseau
                professionnel.
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">📈</span>
                <h3 className="font-semibold text-sm">Événements</h3>
              </div>
              <p className="text-slate-600">
                Retrouvailles et rencontres professionnelles. Les recruteurs
                peuvent identifier des profils formés à l’EHTP pour leurs
                besoins.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 mt-10 mb-8" />

          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-semibold mb-6">
              Map Your Success
            </h3>
            <button
              className="px-10 py-3 rounded-full bg-ehtpLightGreen text-sm font-semibold 
                       hover:bg-ehtpGreen hover:text-white transition-colors"
            >
              Discover More
            </button>
          </div>
        </section>

        {/* SECTION 3 : Rejoindre l’annuaire  */}
        <section
          className="max-w-5xl mx-auto px-6 mt-24 mb-24 grid grid-cols-1 md:grid-cols-[1fr,1.4fr] gap-12 items-center"
          id="apropos" /* le lien "À propos" scrolle ici */
        >
          <div className="flex justify-center md:justify-start">
            <img
              src="/assets/images/alumni-hero.png"
              alt="Lauréat EHTP"
              className="w-64 md:w-80 object-contain"
            />
          </div>

          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Vous êtes lauréat de l’EHTP ? Rejoignez l’annuaire !
            </h2>

            <p className="text-sm md:text-[15px] text-slate-700 mb-4">
              Vous avez obtenu votre diplôme à l’École Hassania des Travaux
              Publics et souhaitez rester connecté avec vos anciens camarades ?
              Rejoignez l’annuaire officiel des lauréats EHTP.
            </p>
            <p className="text-sm md:text-[15px] text-slate-700 mb-4">
              En vous inscrivant, vous retrouverez vos camarades de promotion,
              élargirez votre réseau professionnel et accéderez à des
              opportunités exclusives. De plus, vous profiterez de nombreux
              autres avantages en rejoignant notre communauté.
            </p>

            <p className="text-sm md:text-[15px] text-slate-700 mb-2 font-semibold">
              Comment nous rejoindre :
            </p>
            <ol className="list-decimal list-inside text-sm md:text-[15px] text-slate-700 mb-4 space-y-1">
              <li>Cliquez sur le bouton ci-dessous.</li>
              <li>Remplissez le formulaire d’inscription.</li>
              <li>Validez votre profil et commencez à explorer.</li>
            </ol>

            <p className="text-sm md:text-[15px] text-slate-700 mb-6">
              N’attendez plus, inscrivez-vous à l’annuaire EHTP dès aujourd’hui
              ! Vous êtes lauréat Hassania ?
            </p>

            <div className="flex justify-center md:justify-start">
              <button
                className="w-full md:w-auto px-12 py-3 rounded-full 
                         bg-ehtpGreen text-white text-sm font-semibold
                         hover:bg-white hover:text-ehtpGreen border border-ehtpGreen
                         transition-colors"
              >
                Se Connecter ↗
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer = section "Contact" pour le scrollspy */}
      <Footer />
    </div>
  );
}

export default App;
