import React from 'react';
import { Info, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background text-text p-6 sm:p-8 animate">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          À propos de SatisGest
        </h1>
        
        <div className="card mb-8">
          <div className="flex items-center mb-4">
            <Info size={28} className="text-success mr-3" />
            <h2 className="text-2xl font-semibold">
              Une solution pour la gestion des demandes
            </h2>
          </div>
          <p className="text-base mb-4">
            SatisGest est une plateforme moderne conçue pour optimiser la gestion des demandes clients. Elle permet aux équipes de centraliser, suivre et résoudre les requêtes rapidement, tout en mesurant la satisfaction client en temps réel. Avec une interface intuitive et un design réactif, SatisGest améliore l’efficacité opérationnelle et renforce la fidélité des clients.
          </p>
          <p className="text-base mb-4">
            Fonctionnalités principales :
          </p>
          <ul className="list-disc list-inside text-base mb-4">
            <li>Gestion avancée des demandes avec suivi des statuts (en attente, en cours, résolue, rejetée)</li>
            <li>Commentaires administratifs en temps réel pour une collaboration fluide</li>
            <li>Tableau de bord analytique pour une vision claire des performances</li>
            <li>Mode sombre personnalisé pour une expérience utilisateur optimale</li>
            <li>Enquêtes de satisfaction intégrées pour mesurer le CSAT</li>
          </ul>
          <p className="text-base">
            Version : 1.0.0 (Mai 2025)
          </p>
        </div>

        <div className="card">
          <div className="flex items-center mb-4">
            <img
              src="/images/photo-creator.jpg"
              alt="Photo du créateur"
              className="w-16 h-16 rounded-full border-4 border-success shadow-md mr-4 object-cover"
            />
            <h2 className="text-2xl font-semibold">
              À propos du créateur
            </h2>
          </div>
          <p className="text-base mb-4">
            SatisGest a été créé par Mirado RAKOTONIAINA, un développeur full-stack passionné par les solutions numériques qui transforment les processus d’entreprise. En combinant des technologies modernes comme Vite, React, Django, Tailwind CSS, et MySQL, RAOTONIAINA a conçu une application performante, sécurisée, et centrée sur l’utilisateur. L’objectif est de fournir aux organisations un outil puissant pour gérer leurs interactions clients tout en maximisant la satisfaction.
          </p>
          <p className="text-base">
            Contact :{' '}
            <a
              href="mailto:votre.email@example.com"
              className="text-success hover:underline"
            >
              miradorakoto111@gmail.com
            </a>
            <br />
            GitHub :{' '}
            <a
              href="https://github.com/M1rad0-rkt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-success hover:underline"
            >
              github.com/M1rad0-rkt
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;