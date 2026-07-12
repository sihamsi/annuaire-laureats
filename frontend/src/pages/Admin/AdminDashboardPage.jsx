import React from "react";
import { Link } from "react-router-dom";
import { Users, Map as MapIcon, Settings, ArrowRight } from "lucide-react";
import { ROUTES } from "../../utils/constants";
import AdminLayout from "../../layouts/AdminLayout";

const AdminDashboardPage = () => {
  const features = [
    {
      icon: Users,
      title: "Annuaire",
      description: "Gérez et consultez l'annuaire des lauréats",
      link: ROUTES.ANNUAIRE,
      color: "bg-blue-500",
    },
    {
      icon: MapIcon,
      title: "Carte SIG",
      description: "Visualisez et gérez les données géospatiales",
      link: ROUTES.CARTE_SIG,
      color: "bg-green-500",
    },
    {
      icon: Settings,
      title: "Administration",
      description: "Gérez les inscriptions et validations",
      link: ROUTES.ADMINISTRATION,
      color: "bg-purple-500",
    },
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-background to-background-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-black mb-4">
              Tableau de bord Administrateur
            </h1>
            <p className="text-xl text-gray-600">
              Gérez l'application et les données des lauréats
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
    </AdminLayout>
  );
};

export default AdminDashboardPage;
