import React from "react";
import { Routes, Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import HomePage from "../pages/Home/HomePage";
import AnnuairePage from "../pages/Annuaire/AnnuairePage";
import CarteSIGPage from "../pages/CarteSIG/CarteSIGPage";
import StatistiquesPage from "../pages/Statistiques/StatistiquesPage";
import AdministrationPage from "../pages/Administration/AdministrationPage";
import AProposPage from "../pages/APropos/AProposPage";
import ContactPage from "../pages/Contact/ContactPage";
import LoginPage from "../pages/Auth/LoginPage";
import MonProfilPage from "../pages/MonProfil/MonProfilPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Page publique - HomePage a son propre header et footer intégrés */}
      <Route path="/" element={<HomePage />} />

      {/* Pages protégées - nécessitent une connexion */}

      <Route
        path="administration"
        element={
          <AdminProtectedRoute>
            <AdministrationPage />
          </AdminProtectedRoute>
        }
      />

      <Route
        path="mon-profil"
        element={
          <ProtectedRoute>
            <MonProfilPage />
          </ProtectedRoute>
        }
      />

      {/* Pages publiques */}
      <Route path="a-propos" element={<AProposPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="statistiques" element={<StatistiquesPage />} />
      <Route path="carte-sig" element={<CarteSIGPage />} />
      <Route path="annuaire" element={<AnnuairePage />} />

      {/* Les autres pages utilisent MainLayout */}
    </Routes>
  );
};

export default AppRoutes;
