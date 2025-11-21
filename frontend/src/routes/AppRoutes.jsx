import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/Home/HomePage';
import AnnuairePage from '../pages/Annuaire/AnnuairePage';
import CarteSIGPage from '../pages/CarteSIG/CarteSIGPage';
import StatistiquesPage from '../pages/Statistiques/StatistiquesPage';
import AdministrationPage from '../pages/Administration/AdministrationPage';
import RecherchePage from '../pages/Rechercher/RecherchePage';
import AProposPage from '../pages/APropos/AProposPage';
import ContactPage from '../pages/Contact/ContactPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* HomePage a son propre header et footer intégrés */}
      <Route path="/" element={<HomePage />} />
      
      {/* AnnuairePage a son propre header et footer */}
      <Route path="annuaire" element={<AnnuairePage />} />
      
      {/* CarteSIGPage a son propre header et footer */}
      <Route path="carte-sig" element={<CarteSIGPage />} />
      
      {/* StatistiquesPage a son propre header et footer */}
      <Route path="statistiques" element={<StatistiquesPage />} />
      
      {/* AdministrationPage a son propre header et footer */}
      <Route path="administration" element={<AdministrationPage />} />
      
      {/* Les autres pages utilisent MainLayout */}
      <Route path="rechercher" element={<MainLayout><RecherchePage /></MainLayout>} />
      <Route path="a-propos" element={<MainLayout><AProposPage /></MainLayout>} />
      <Route path="contact" element={<MainLayout><ContactPage /></MainLayout>} />
    </Routes>
  );
};

export default AppRoutes;
