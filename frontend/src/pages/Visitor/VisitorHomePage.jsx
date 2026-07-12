import React from "react";
import { Link } from "react-router-dom";
import { Users, Map as MapIcon, BarChart3, Info, Mail, ArrowRight } from "lucide-react";
import { ROUTES } from "../../utils/constants";
import VisitorLayout from "../../layouts/VisitorLayout";

const VisitorHomePage = () => {
  const features = [
    {
      icon: Users,
      title: "Annuaire",
      description: "Consultez l'annuaire complet des lauréats de l'EHTP",
      link: "/visiteur/annuaire",
      color: "bg-blue-500",
    },
    {
      icon: MapIcon,
      title: "Carte SIG",
      description: "Explorez la géolocalisation des lauréats sur une carte interactive",
      link: "/visiteur/carte",
      color: "bg-green-500",
    },
    {
      icon: BarChart3,
      title: "Statistiques",
      description: "Découvrez les statistiques et analyses des parcours des lauréats",
      link: "/visiteur/statistiques",
      color: "bg-purple-500",
    },
    {
      icon: Info,
      title: "À propos",
      description: "En savoir plus sur l'EHTP et le Career Tracker",
      link: "/visiteur/a-propos",
      color: "bg-orange-500",
    },
    {
      icon: Mail,
      title: "Contactez-nous",
      description: "Prenez contact avec nous pour toute question",
      link: "/visiteur/contact",
      color: "bg-red-500",
    },
  ];

  return (
    <VisitorLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-black mb-4">
              Espace Visiteur
            </h1>
            <p className="text-xl text-gray-600">
              Explorez les ressources et informations sur les lauréats de l'EHTP
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.link}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {feature.description}
                  </p>
                  <div className="flex items-center text-primary font-medium">
                    <span>Accéder</span>
                    <ArrowRight className="ml-2" size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </VisitorLayout>
  );
};

export default VisitorHomePage;
