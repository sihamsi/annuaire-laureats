import React from 'react';
import { Award, Users, BookOpen, Target } from 'lucide-react';
import { SCHOOL_INFO } from '../../utils/constants';
import Card from '../../components/common/Card/Card';
import styles from './AProposPage.module.css';

const AProposPage = () => {
  return (
    <div className={styles.aProposPage}>
      <div className={styles.container}>
        <h1 className={styles.pageTitle}>À propos</h1>

        <section className={styles.section}>
          <div className={styles.content}>
            <h2>L'École Hassania des Travaux Publics</h2>
            <p>
              L'École Hassania des Travaux Publics (EHTP) est une grande école d'ingénieurs
              marocaine créée en 1971. Elle est située à Casablanca et fait partie des grandes
              écoles d'ingénieurs les plus prestigieuses du Maroc.
            </p>
            <p>
              L'EHTP forme des ingénieurs de haut niveau dans les domaines du génie civil,
              du génie urbain et de la gestion, capables de répondre aux défis du développement
              durable et de l'aménagement du territoire.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Notre mission</h2>
          <div className={styles.missionGrid}>
            <Card className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <Award size={32} />
              </div>
              <h3>Excellence académique</h3>
              <p>
                Former des ingénieurs d'excellence capables d'exceller dans leurs domaines
                respectifs et de contribuer au développement du pays.
              </p>
            </Card>

            <Card className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <Users size={32} />
              </div>
              <h3>Réseau professionnel</h3>
              <p>
                Maintenir et renforcer les liens entre les différentes promotions et créer
                un réseau solide d'anciens élèves.
              </p>
            </Card>

            <Card className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <BookOpen size={32} />
              </div>
              <h3>Formation continue</h3>
              <p>
                Offrir des opportunités de formation continue et de développement professionnel
                aux lauréats.
              </p>
            </Card>

            <Card className={styles.missionCard}>
              <div className={styles.missionIcon}>
                <Target size={32} />
              </div>
              <h3>Innovation</h3>
              <p>
                Promouvoir l'innovation et la recherche dans les domaines de l'ingénierie
                et de l'aménagement du territoire.
              </p>
            </Card>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.content}>
            <h2>L'annuaire des lauréats</h2>
            <p>
              Cet annuaire en ligne a été créé pour faciliter la mise en relation entre les
              lauréats de l'EHTP. Il permet de :
            </p>
            <ul className={styles.featuresList}>
              <li>Rechercher et contacter d'anciens camarades de promotion</li>
              <li>Découvrir les parcours professionnels des lauréats</li>
              <li>Maintenir un réseau professionnel actif</li>
              <li>Partager des opportunités professionnelles</li>
              <li>Organiser des événements et retrouvailles</li>
            </ul>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.contactInfo}>
            <h2>Informations de contact</h2>
            <div className={styles.infoGrid}>
              <div>
                <strong>Adresse :</strong>
                <p>{SCHOOL_INFO.address}</p>
              </div>
              <div>
                <strong>Email :</strong>
                <p>
                  <a href={`mailto:${SCHOOL_INFO.email}`}>{SCHOOL_INFO.email}</a>
                </p>
              </div>
              <div>
                <strong>Téléphone :</strong>
                <p>
                  <a href={`tel:${SCHOOL_INFO.phone}`}>{SCHOOL_INFO.phone}</a>
                </p>
              </div>
              <div>
                <strong>Site web :</strong>
                <p>
                  <a href={SCHOOL_INFO.website} target="_blank" rel="noopener noreferrer">
                    {SCHOOL_INFO.website}
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AProposPage;

