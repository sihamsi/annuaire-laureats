import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
} from "lucide-react";
import { SCHOOL_INFO } from "../../utils/constants";
import AppNavbar from "../../components/common/Navbar/AppNavbar";
import { createMessage } from "../../api/messages.api";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    sujet: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide";
    }

    if (!formData.sujet.trim()) {
      newErrors.sujet = "Le sujet est requis";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Le message est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitSuccess(false);

    try {
      await createMessage({
        nom: formData.nom.trim(),
        email: formData.email.trim(),
        sujet: formData.sujet.trim(),
        message: formData.message.trim(),
      });

      setSubmitSuccess(true);
      setFormData({ nom: "", email: "", sujet: "", message: "" });
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      alert("❌ Erreur lors de l'envoi du message.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background">
      <AppNavbar />

      {/* Contenu */}
      <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-serif text-black mb-2">
            Contactez-nous
          </h1>
          <p className="text-gray-600">
            Nous sommes là pour répondre à toutes vos questions
          </p>
        </div>

        {/* Message de succès */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-600" size={24} />
            <p className="text-green-800 font-medium">
              Votre message a été envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Informations de contact */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-serif text-black mb-6">
              Informations de contact
            </h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="text-white" size={24} />
                </div>
                <div>
                  <strong className="block text-primary font-semibold mb-2">
                    Adresse
                  </strong>
                  <p className="text-gray-700">{SCHOOL_INFO.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <strong className="block text-primary font-semibold mb-2">
                    Email
                  </strong>
                  <p className="text-gray-700">
                    <a
                      href={`mailto:${SCHOOL_INFO.email}`}
                      className="text-primary hover:text-primary-dark hover:underline"
                    >
                      {SCHOOL_INFO.email}
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone className="text-white" size={24} />
                </div>
                <div>
                  <strong className="block text-primary font-semibold mb-2">
                    Téléphone
                  </strong>
                  <p className="text-gray-700">
                    <a
                      href={`tel:${SCHOOL_INFO.phone}`}
                      className="text-primary hover:text-primary-dark hover:underline"
                    >
                      {SCHOOL_INFO.phone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200">
            <h2 className="text-2xl font-serif text-black mb-6">
              Envoyez-nous un message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="nom"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nom complet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none ${
                    errors.nom ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.nom && (
                  <p className="mt-1 text-sm text-red-500">{errors.nom}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sujet"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sujet <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="sujet"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none ${
                    errors.sujet ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.sujet && (
                  <p className="mt-1 text-sm text-red-500">{errors.sujet}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none resize-none ${
                    errors.message ? "border-red-500" : "border-gray-300"
                  }`}
                  required
                />
                {errors.message && (
                  <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white px-6 py-3 rounded-full hover:bg-primary-dark transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={20} />
                {isSubmitting ? "Envoi en cours..." : "Envoyer le message"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;