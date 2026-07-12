import React from "react";
import { Link } from "react-router-dom";
import { Award, Users, BookOpen, Target } from "lucide-react";
import { SCHOOL_INFO } from "../../utils/constants";
import AppNavbar from "../../components/common/Navbar/AppNavbar";

const AProposPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />
      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-black mb-2">À propos</h1>
          <p className="text-gray-600">
            Découvrez l'École Hassania des Travaux Publics et notre mission
          </p>
        </div>

        {/* Section EHTP */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-200">
          <h2 className="text-3xl font-serif text-black mb-6 text-center">
            L'École Hassania des Travaux Publics
          </h2>
          <div className="max-w-4xl mx-auto space-y-4">
            <p className="text-gray-700 text-lg leading-relaxed">
              L'École Hassania des Travaux Publics (EHTP) est une grande école d'ingénieurs
              marocaine créée en 1971. Elle est située à Casablanca et fait partie des grandes
              écoles d'ingénieurs les plus prestigieuses du Maroc.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              L'EHTP forme des ingénieurs de haut niveau dans les domaines du génie civil,
              du génie urbain et de la gestion, capables de répondre aux défis du développement
              durable et de l'aménagement du territoire.
            </p>
          </div>
        </section>

        {/* Section Mission */}
        <section className="mb-6">
          <h2 className="text-3xl font-serif text-black mb-6 text-center">
            Notre mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-serif text-black mb-3">Excellence académique</h3>
              <p className="text-gray-600 leading-relaxed">
                Former des ingénieurs d'excellence capables d'exceller dans leurs domaines
                respectifs et de contribuer au développement du pays.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-serif text-black mb-3">Réseau professionnel</h3>
              <p className="text-gray-600 leading-relaxed">
                Maintenir et renforcer les liens entre les différentes promotions et créer
                un réseau solide d'anciens élèves.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4">
                <BookOpen className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-serif text-black mb-3">Formation continue</h3>
              <p className="text-gray-600 leading-relaxed">
                Offrir des opportunités de formation continue et de développement professionnel
                aux lauréats.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center mx-auto mb-4">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-xl font-serif text-black mb-3">Innovation</h3>
              <p className="text-gray-600 leading-relaxed">
                Promouvoir l'innovation et la recherche dans les domaines de l'ingénierie
                et de l'aménagement du territoire.
              </p>
            </div>
          </div>
        </section>

        {/* Section Annuaire */}
        <section className="bg-white rounded-xl shadow-sm p-8 mb-6 border border-gray-200">
          <h2 className="text-3xl font-serif text-black mb-6 text-center">
            L'annuaire des lauréats
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-gray-700 text-lg mb-6 leading-relaxed">
              Cet annuaire en ligne a été créé pour faciliter la mise en relation entre les
              lauréats de l'EHTP. Il permet de :
            </p>
            <ul className="space-y-3 text-gray-700 text-lg">
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Rechercher et contacter d'anciens camarades de promotion</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Découvrir les parcours professionnels des lauréats</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Maintenir un réseau professionnel actif</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Partager des opportunités professionnelles</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-3 mt-1">•</span>
                <span>Organiser des événements et retrouvailles</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Section Contact */}
        <section className="bg-gradient-to-br from-primary-light to-primary rounded-xl shadow-sm p-8 mb-6">
          <h2 className="text-3xl font-serif text-white mb-6 text-center">
            Informations de contact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg p-5 text-center">
              <strong className="block text-primary font-semibold mb-2">Adresse</strong>
              <p className="text-gray-700 text-sm">{SCHOOL_INFO.address}</p>
            </div>
            <div className="bg-white rounded-lg p-5 text-center">
              <strong className="block text-primary font-semibold mb-2">Email</strong>
              <p className="text-gray-700">
                <a
                  href={`mailto:${SCHOOL_INFO.email}`}
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  {SCHOOL_INFO.email}
                </a>
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 text-center">
              <strong className="block text-primary font-semibold mb-2">Téléphone</strong>
              <p className="text-gray-700">
                <a
                  href={`tel:${SCHOOL_INFO.phone}`}
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  {SCHOOL_INFO.phone}
                </a>
              </p>
            </div>
            <div className="bg-white rounded-lg p-5 text-center">
              <strong className="block text-primary font-semibold mb-2">Site web</strong>
              <p className="text-gray-700">
                <a
                  href={SCHOOL_INFO.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark hover:underline"
                >
                  {SCHOOL_INFO.website}
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AProposPage;
