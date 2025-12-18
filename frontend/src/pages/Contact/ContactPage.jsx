import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { SCHOOL_INFO } from '../../utils/constants';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import Card from '../../components/common/Card/Card';
import styles from './ContactPage.module.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    sujet: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide';
    }

    if (!formData.sujet.trim()) {
      newErrors.sujet = 'Le sujet est requis';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    // TODO: Implémenter l'envoi du formulaire
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        nom: '',
        email: '',
        sujet: '',
        message: '',
      });
      setTimeout(() => setSubmitSuccess(false), 5000);
    }, 1000);
  };

  return (
    <div className={styles.contactPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>Contactez-nous</h1>

        <div className={styles.contactContent}>
          <div className={styles.contactInfo}>
            <Card>
              <h2>Informations de contact</h2>
              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <MapPin size={20} className={styles.infoIcon} />
                  <div>
                    <strong>Adresse</strong>
                    <p>{SCHOOL_INFO.address}</p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Mail size={20} className={styles.infoIcon} />
                  <div>
                    <strong>Email</strong>
                    <p>
                      <a href={`mailto:${SCHOOL_INFO.email}`}>{SCHOOL_INFO.email}</a>
                    </p>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Phone size={20} className={styles.infoIcon} />
                  <div>
                    <strong>Téléphone</strong>
                    <p>
                      <a href={`tel:${SCHOOL_INFO.phone}`}>{SCHOOL_INFO.phone}</a>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className={styles.contactForm}>
            <Card>
              <h2>Envoyez-nous un message</h2>
              {submitSuccess && (
                <div className={styles.successMessage}>
                  Votre message a été envoyé avec succès !
                </div>
              )}
              <form onSubmit={handleSubmit} className={styles.form}>
                <Input
                  label="Nom complet"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  error={errors.nom}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />

                <Input
                  label="Sujet"
                  name="sujet"
                  value={formData.sujet}
                  onChange={handleChange}
                  error={errors.sujet}
                  required
                />

                <div className={styles.textareaWrapper}>
                  <label htmlFor="message" className={styles.label}>
                    Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className={`${styles.textarea} ${errors.message ? styles.textareaError : ''}`}
                    required
                  />
                  {errors.message && (
                    <span className={styles.errorMessage}>{errors.message}</span>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  <Send size={20} />
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

