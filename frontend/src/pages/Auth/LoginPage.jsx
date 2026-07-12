// src/pages/auth/LoginPage.jsx  (TON CODE, corrigé pour fonctionner avec AuthContext)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Shield } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import logoEhtp from "../../assets/styles/logo-ehtp.png";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user, isAdmin } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      // Rediriger selon le type d'utilisateur
      if (isAdmin) {
        navigate("/administration");
      } else {
        navigate("/mon-profil");
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setErrorMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "L'email n'est pas valide";

    if (!formData.password.trim())
      newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 6)
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const loggedInUser = await login(formData.email, formData.password);
      // Rediriger selon le type d'utilisateur
      if (loggedInUser?.role === "admin") {
        navigate("/administration");
      } else {
        navigate("/mon-profil");
      }
    } catch (error) {
      const errorMessage = error.message || "";
      
      // Vérifier si le compte est en cours de validation
      if (errorMessage.includes("en cours de validation") || 
          errorMessage.includes("Votre inscription est en cours de validation")) {
        setErrorMessage(
          "Votre compte est actuellement en cours de validation par un administrateur. " +
          "Vous ne pouvez pas vous connecter jusqu'à ce que votre compte soit validé. " +
          "Vous recevrez une notification une fois votre compte validé."
        );
      } else if (errorMessage.includes("Aucun mot de passe défini")) {
        setErrorMessage(
          "Aucun mot de passe n'est défini pour ce compte. " +
          "Veuillez contacter l'administrateur pour définir un mot de passe."
        );
      } else if (errorMessage.includes("403") || errorMessage.includes("Forbidden")) {
        // Si c'est une erreur 403 générique, essayer d'obtenir plus de détails
        setErrorMessage(
          "Accès refusé. Si vous avez créé un compte récemment, " +
          "votre compte est peut-être en cours de validation. " +
          "Veuillez attendre la validation de votre compte par un administrateur."
        );
      } else {
        setErrorMessage(
          errorMessage || "Une erreur est survenue lors de la connexion"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-light flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-lg">
              <img
                src={logoEhtp}
                alt="EHTP Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-3xl font-serif text-black mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-red-800 text-sm">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
                    errors.email
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="admin@ehtp.ac.ma"
                  required
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-colors ${
                    errors.password
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white"
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Se souvenir de moi
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-3 px-4 rounded-lg font-semibold hover:from-primary-dark hover:to-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>Se connecter</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-700 mb-1">Accès sécurisé</p>
                <p>
                  Vos données sont protégées. Toutes les connexions sont
                  sécurisées et enregistrées.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <a
            href="/"
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
