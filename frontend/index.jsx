import React, { useState } from 'react';
import { Users, Map, BarChart3, Settings, Home, GraduationCap, CheckCircle, XCircle, Clock, Eye, UserPlus, Shield, AlertCircle, Key, Link as LinkIcon } from 'lucide-react';

const PageAdministration = () => {
  const [activeTab, setActiveTab] = useState('inscriptions');
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [motifRejet, setMotifRejet] = useState('');
  const [showUserModal, setShowUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    nom: '',
    prenom: '',
    login: '',
    password: '',
    role: 'Membre Bureau',
    email: '',
    idAnnuaire: ''
  });

  const [inscriptionsEnAttente, setInscriptionsEnAttente] = useState([
    {
      id: 1,
      nom: 'Amrani',
      prenom: 'Salma',
      email: 's.amrani@email.com',
      telephone: '0645678901',
      promotion: '2020',
      filiere: 'Génie Informatique',
      organisme: 'Capgemini',
      secteur: 'Privé',
      province: 'Casablanca',
      dateInscription: '2024-11-15 14:30',
      imei: 'IMEI-1234567890',
      statut: 'en_attente'
    },
    {
      id: 2,
      nom: 'Berrada',
      prenom: 'Omar',
      email: 'o.berrada@email.com',
      telephone: '0656789012',
      promotion: '2021',
      filiere: 'Génie Civil',
      organisme: 'ONEE',
      secteur: 'Public',
      province: 'Rabat',
      dateInscription: '2024-11-16 09:15',
      imei: 'IMEI-0987654321',
      statut: 'en_attente'
    },
    {
      id: 3,
      nom: 'Ziani',
      prenom: 'Leila',
      email: 'l.ziani@email.com',
      telephone: '0667890123',
      promotion: '2022',
      filiere: 'Génie Électrique',
      organisme: 'Maroc Telecom',
      secteur: 'Privé',
      province: 'Marrakech',
      dateInscription: '2024-11-17 16:45',
      imei: 'IMEI-1122334455',
      statut: 'en_attente'
    }
  ]);

  const [historiqueRejets, setHistoriqueRejets] = useState([
    {
      id: 1,
      nom: 'Alaoui Hassan',
      email: 'h.alaoui@email.com',
      dateRejet: '2024-11-10',
      motif: 'Informations incomplètes - Organisme non spécifié',
      administrateur: 'Admin Principal'
    },
    {
      id: 2,
      nom: 'Benkirane Sara',
      email: 's.benkirane@email.com',
      dateRejet: '2024-11-08',
      motif: 'Photo de profil non conforme',
      administrateur: 'Admin Principal'
    },
    {
      id: 3,
      nom: 'Tahiri Karim',
      email: 'k.tahiri@email.com',
      dateRejet: '2024-11-05',
      motif: 'Email non valide - domaine suspect',
      administrateur: 'Bureau Association'
    }
  ]);

  const [utilisateurs, setUtilisateurs] = useState([
    {
      id: 1,
      nom: 'El Mansouri',
      prenom: 'Ahmed',
      login: 'admin.principal',
      password: '********',
      role: 'Administrateur',
      email: 'a.elmansouri@ehtp.ac.ma',
      statut: 'Actif',
      derniereConnexion: '2024-11-20 10:30',
      idAnnuaire: null
    },
    {
      id: 2,
      nom: 'Benani',
      prenom: 'Fatima',
      login: 'bureau.asso',
      password: '********',
      role: 'Membre Bureau',
      email: 'f.benani@ehtp.ac.ma',
      statut: 'Actif',
      derniereConnexion: '2024-11-19 15:20',
      idAnnuaire: 'LAU-2018-0245'
    }
  ]);

  const validerInscription = (id) => {
    const inscription = inscriptionsEnAttente.find(i => i.id === id);
    if (!inscription) return;

    // Mise à jour du statut
    setInscriptionsEnAttente(prev => prev.filter(i => i.id !== id));
    
    // ✅ Publication dans l'annuaire
    const nouveauLaureat = {
      ...inscription,
      statut: 'publié',
      datePublication: new Date().toISOString(),
      idAnnuaire: `LAU-${inscription.promotion}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`
    };
    
    alert(`✅ Inscription validée et publiée !\n\nLauréat: ${inscription.prenom} ${inscription.nom}\nID Annuaire: ${nouveauLaureat.idAnnuaire}\n\n📧 Notification envoyée à ${inscription.email}`);
  };

  const rejeterInscription = (id) => {
    // ✅ Validation du motif (minimum 20 caractères)
    if (!motifRejet.trim()) {
      alert('⚠️ Veuillez saisir un motif de rejet');
      return;
    }
    
    if (motifRejet.trim().length < 20) {
      alert('⚠️ Le motif doit contenir au minimum 20 caractères');
      return;
    }

    const inscription = inscriptionsEnAttente.find(i => i.id === id);
    if (!inscription) return;

    // Ajout à l'historique des rejets
    const nouveauRejet = {
      id: historiqueRejets.length + 1,
      nom: `${inscription.prenom} ${inscription.nom}`,
      email: inscription.email,
      dateRejet: new Date().toLocaleDateString('fr-FR'),
      motif: motifRejet,
      administrateur: 'Admin Principal'
    };

    setHistoriqueRejets(prev => [nouveauRejet, ...prev]);
    setInscriptionsEnAttente(prev => prev.filter(i => i.id !== id));
    
    // ✅ Notification au lauréat
    alert(`❌ Inscription rejetée\n\nLauréat: ${inscription.prenom} ${inscription.nom}\nMotif: ${motifRejet}\n\n📧 Email de notification envoyé à ${inscription.email}`);
    
    setSelectedInscription(null);
    setMotifRejet('');
  };

  const ajouterUtilisateur = () => {
    // Validation
    if (!newUser.nom || !newUser.prenom || !newUser.login || !newUser.password || !newUser.email) {
      alert('⚠️ Tous les champs obligatoires doivent être remplis');
      return;
    }

    if (newUser.password.length < 8) {
      alert('⚠️ Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    // ✅ Validation ID Annuaire pour Membre Bureau
    if (newUser.role === 'Membre Bureau' && !newUser.idAnnuaire) {
      alert('⚠️ L\'ID Annuaire est obligatoire pour un Membre Bureau');
      return;
    }

    const nouvelUtilisateur = {
      id: utilisateurs.length + 1,
      ...newUser,
      password: '********', // Masqué pour l'affichage
      statut: 'Actif',
      derniereConnexion: 'Jamais connecté',
      idAnnuaire: newUser.role === 'Membre Bureau' ? newUser.idAnnuaire : null
    };

    setUtilisateurs(prev => [...prev, nouvelUtilisateur]);
    setShowUserModal(false);
    setNewUser({
      nom: '',
      prenom: '',
      login: '',
      password: '',
      role: 'Membre Bureau',
      email: '',
      idAnnuaire: ''
    });

    alert(`✅ Utilisateur créé avec succès !\n\nLogin: ${newUser.login}\nRôle: ${newUser.role}${newUser.idAnnuaire ? `\nID Annuaire: ${newUser.idAnnuaire}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-green-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="text-white" size={28} />
              </div>
              <div>
                <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Career Tracker EHTP
                </div>
                <div className="text-xs text-gray-500">Plateforme des Lauréats</div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-green-50 transition-all">
                <Home size={18} />
                <span className="font-medium">Accueil</span>
              </button>
              <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-green-50 transition-all">
                <Users size={18} />
                <span className="font-medium">Annuaire</span>
              </button>
              <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-green-50 transition-all">
                <Map size={18} />
                <span className="font-medium">Carte SIG</span>
              </button>
              <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-green-50 transition-all">
                <BarChart3 size={18} />
                <span className="font-medium">Statistiques</span>
              </button>
              <button className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                <Settings size={18} />
                <span className="font-medium">Admin</span>
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-800">Admin Principal</div>
                <div className="text-xs text-gray-500">Administrateur</div>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                AP
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Contenu Principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Panneau d'Administration
          </h1>
          <p className="text-gray-600 text-lg">Gestion des inscriptions, utilisateurs et traçabilité</p>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white">
            <Clock className="mb-3" size={32} />
            <div className="text-4xl font-bold mb-2">{inscriptionsEnAttente.length}</div>
            <div className="text-sm opacity-90 font-medium">Inscriptions en attente</div>
          </div>
          <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
            <XCircle className="mb-3" size={32} />
            <div className="text-4xl font-bold mb-2">{historiqueRejets.length}</div>
            <div className="text-sm opacity-90 font-medium">Rejets ce mois</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
            <Shield className="mb-3" size={32} />
            <div className="text-4xl font-bold mb-2">{utilisateurs.length}</div>
            <div className="text-sm opacity-90 font-medium">Utilisateurs actifs</div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-2xl shadow-xl border border-green-100 overflow-hidden">
          <div className="flex border-b-2 border-gray-100">
            <button
              onClick={() => setActiveTab('inscriptions')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'inscriptions'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-green-50'
              }`}
            >
              <Clock className="inline mr-2" size={20} />
              Inscriptions en Attente
            </button>
            <button
              onClick={() => setActiveTab('rejets')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'rejets'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-green-50'
              }`}
            >
              <XCircle className="inline mr-2" size={20} />
              Historique des Rejets
            </button>
            <button
              onClick={() => setActiveTab('utilisateurs')}
              className={`flex-1 px-6 py-4 font-semibold transition-all ${
                activeTab === 'utilisateurs'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-green-50'
              }`}
            >
              <UserPlus className="inline mr-2" size={20} />
              Gestion Utilisateurs
            </button>
          </div>

          <div className="p-6">
            {/* Tab: Inscriptions en Attente */}
            {activeTab === 'inscriptions' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Inscriptions en Attente de Validation
                  </h2>
                  <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-xl font-bold">
                    {inscriptionsEnAttente.length} demandes
                  </span>
                </div>

                {inscriptionsEnAttente.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
                    <p className="text-lg font-semibold">Aucune inscription en attente</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inscriptionsEnAttente.map((inscription) => (
                      <div key={inscription.id} className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-green-300 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 grid grid-cols-4 gap-4">
                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Identité
                              </div>
                              <div className="font-bold text-gray-800 text-lg">
                                {inscription.prenom} {inscription.nom}
                              </div>
                              <div className="text-sm text-gray-600">{inscription.email}</div>
                              <div className="text-sm text-gray-600">{inscription.telephone}</div>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Formation
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {inscription.filiere}
                              </div>
                              <div className="text-sm text-green-600 font-bold">
                                Promo {inscription.promotion}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Professionnel
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                {inscription.organisme}
                              </div>
                              <div className="text-xs text-gray-600">{inscription.secteur}</div>
                              <div className="text-xs text-gray-600">{inscription.province}</div>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Technique
                              </div>
                              <div className="text-xs text-gray-600">
                                Date: {inscription.dateInscription}
                              </div>
                              <div className="text-xs text-gray-600">
                                Device: {inscription.imei}
                              </div>
                            </div>
                          </div>

                          <div className="ml-6 flex flex-col space-y-2">
                            <button 
                              onClick={() => setSelectedInscription(inscription)}
                              className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all flex items-center space-x-2 font-medium"
                            >
                              <Eye size={18} />
                              <span>Détails</span>
                            </button>
                            <button 
                              onClick={() => validerInscription(inscription.id)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
                            >
                              <CheckCircle size={18} />
                              <span>Valider</span>
                            </button>
                            <button 
                              onClick={() => setSelectedInscription(inscription)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center space-x-2 font-medium"
                            >
                              <XCircle size={18} />
                              <span>Rejeter</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Modal de Rejet */}
                {selectedInscription && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">
                          Rejet de l'Inscription
                        </h3>
                        <button 
                          onClick={() => {
                            setSelectedInscription(null);
                            setMotifRejet('');
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XCircle size={28} />
                        </button>
                      </div>

                      <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
                          <div>
                            <div className="font-bold text-red-800 mb-1">
                              {selectedInscription.prenom} {selectedInscription.nom}
                            </div>
                            <div className="text-sm text-red-700">
                              {selectedInscription.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Motif du Rejet * (minimum 20 caractères)
                        </label>
                        <textarea
                          value={motifRejet}
                          onChange={(e) => setMotifRejet(e.target.value)}
                          placeholder="Veuillez préciser la raison du rejet en détail..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:outline-none resize-none"
                          rows="5"
                        />
                        <div className="flex items-center justify-between mt-2">
                          <div className="text-xs text-gray-500">
                            Le lauréat recevra une notification par email avec ce motif
                          </div>
                          <div className={`text-xs font-semibold ${motifRejet.length >= 20 ? 'text-green-600' : 'text-red-600'}`}>
                            {motifRejet.length}/20 caractères
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedInscription(null);
                            setMotifRejet('');
                          }}
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => rejeterInscription(selectedInscription.id)}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Confirmer le Rejet
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Historique des Rejets */}
            {activeTab === 'rejets' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  Historique des Rejets
                </h2>

                <div className="space-y-4">
                  {historiqueRejets.map((rejet) => (
                    <div key={rejet.id} className="bg-red-50 rounded-2xl p-6 border-2 border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <XCircle className="text-red-600" size={24} />
                            <div>
                              <div className="font-bold text-gray-800 text-lg">
                                {rejet.nom}
                              </div>
                              <div className="text-sm text-gray-600">{rejet.email}</div>
                            </div>
                          </div>

                          <div className="bg-white rounded-xl p-4 mb-3">
                            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                              Motif du Rejet
                            </div>
                            <div className="text-sm text-gray-800">{rejet.motif}</div>
                          </div>

                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div>
                              <span className="font-semibold">Date:</span> {rejet.dateRejet}
                            </div>
                            <div>
                              <span className="font-semibold">Par:</span> {rejet.administrateur}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Gestion des Utilisateurs */}
            {activeTab === 'utilisateurs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Gestion des Utilisateurs
                  </h2>
                  <button 
                    onClick={() => setShowUserModal(true)}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center space-x-2"
                  >
                    <UserPlus size={20} />
                    <span>Nouvel Utilisateur</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {utilisateurs.map((user) => (
                    <div key={user.id} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {user.prenom[0]}{user.nom[0]}
                          </div>

                          <div className="grid grid-cols-3 gap-8">
                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Identité
                              </div>
                              <div className="font-bold text-gray-800 text-lg">
                                {user.prenom} {user.nom}
                              </div>
                              <div className="text-sm text-gray-600">{user.email}</div>
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Accès
                              </div>
                              <div className="text-sm font-semibold text-gray-800">
                                <Key className="inline mr-1" size={14} />
                                Login: {user.login}
                              </div>
                              <div className="flex items-center mt-1">
                                <Shield className="text-blue-600 mr-1" size={16} />
                                <span className="text-sm font-bold text-blue-600">{user.role}</span>
                              </div>
                              {user.idAnnuaire && (
                                <div className="flex items-center mt-1">
                                  <LinkIcon className="text-green-600 mr-1" size={14} />
                                  <span className="text-xs text-green-600 font-semibold">ID: {user.idAnnuaire}</span>
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wide">
                                Statut
                              </div>
                              <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-bold">
                                <CheckCircle size={14} className="mr-1" />
                                {user.statut}
                              </span>
                              <div className="text-xs text-gray-600 mt-1">
                                Dernière connexion: {user.derniereConnexion}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-all font-medium">
                            Modifier
                          </button>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-medium">
                            Désactiver
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modal Nouvel Utilisateur */}
                {showUserModal && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-8 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-gray-800">
                          Créer un Nouvel Utilisateur
                        </h3>
                        <button 
                          onClick={() => {
                            setShowUserModal(false);
                            setNewUser({
                              nom: '',
                              prenom: '',
                              login: '',
                              password: '',
                              role: 'Membre Bureau',
                              email: '',
                              idAnnuaire: ''
                            });
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <XCircle size={28} />
                        </button>
                      </div>

                      <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Nom *
                            </label>
                            <input
                              type="text"
                              value={newUser.nom}
                              onChange={(e) => setNewUser({...newUser, nom: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                              placeholder="Ex: El Mansouri"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Prénom *
                            </label>
                            <input
                              type="text"
                              value={newUser.prenom}
                              onChange={(e) => setNewUser({...newUser, prenom: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                              placeholder="Ex: Ahmed"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email *
                          </label>
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                            placeholder="utilisateur@ehtp.ac.ma"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Rôle *
                          </label>
                          <select
                            value={newUser.role}
                            onChange={(e) => setNewUser({...newUser, role: e.target.value, idAnnuaire: e.target.value === 'Administrateur' ? '' : newUser.idAnnuaire})}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                          >
                            <option value="Membre Bureau">Membre Bureau</option>
                            <option value="Administrateur">Administrateur</option>
                          </select>
                          <div className="text-xs text-gray-500 mt-1">
                            {newUser.role === 'Membre Bureau' ? '⚠️ ID Annuaire requis pour ce rôle' : 'Accès complet à la plateforme'}
                          </div>
                        </div>

                        {newUser.role === 'Membre Bureau' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <LinkIcon className="inline mr-1" size={16} />
                              ID Annuaire * (Référence lauréat)
                            </label>
                            <input
                              type="text"
                              value={newUser.idAnnuaire}
                              onChange={(e) => setNewUser({...newUser, idAnnuaire: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                              placeholder="Ex: LAU-2018-0245"
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              Identifiant du membre dans l'annuaire des lauréats
                            </div>
                          </div>
                        )}

                        <div className="border-t-2 border-gray-100 pt-5">
                          <h4 className="text-sm font-bold text-gray-700 mb-4 flex items-center">
                            <Key className="mr-2" size={18} />
                            Identifiants de Connexion
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Login *
                              </label>
                              <input
                                type="text"
                                value={newUser.login}
                                onChange={(e) => setNewUser({...newUser, login: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                placeholder="Ex: admin.bureau"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Mot de passe * (min. 8 caractères)
                              </label>
                              <input
                                type="password"
                                value={newUser.password}
                                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                placeholder="••••••••"
                              />
                              <div className={`text-xs mt-1 font-semibold ${newUser.password.length >= 8 ? 'text-green-600' : 'text-red-600'}`}>
                                {newUser.password.length}/8 caractères
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                          <div className="flex items-start space-x-2">
                            <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                            <div className="text-sm text-blue-800">
                              <strong>Information:</strong> L'utilisateur recevra ses identifiants par email et devra changer son mot de passe lors de sa première connexion.
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-3 mt-8">
                        <button
                          onClick={() => {
                            setShowUserModal(false);
                            setNewUser({
                              nom: '',
                              prenom: '',
                              login: '',
                              password: '',
                              role: 'Membre Bureau',
                              email: '',
                              idAnnuaire: ''
                            });
                          }}
                          className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={ajouterUtilisateur}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          Créer l'Utilisateur
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageAdministration;