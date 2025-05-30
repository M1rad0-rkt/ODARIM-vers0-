import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Gestion des demandes',
    description: 'Centralisez toutes vos demandes clients en un seul endroit pour un suivi efficace.'
  },
  {
    icon: CheckCircle,
    title: 'Résolution rapide',
    description: 'Suivez en temps réel l\'état de vos demandes et accélérez leur résolution.'
  },
  {
    icon: Clock,
    title: 'Historique complet',
    description: 'Gardez un historique complet de toutes les interactions avec vos clients.'
  },
  {
    icon: BarChart3,
    title: 'Analyse de satisfaction',
    description: 'Mesurez et analysez la satisfaction de vos clients pour améliorer vos services.'
  }
];

const Accueil = () => {
  const { user } = useAuth();
  
  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-primary">Simplifiez</span> la gestion de vos <span className="text-secondary">demandes clients</span>
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mb-10 opacity-80">
              SatisGest vous permet de centraliser toutes les demandes de vos clients, 
              de les traiter efficacement et d'analyser leur niveau de satisfaction.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              {user ? (
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/client'} 
                  className="btn btn-primary px-8 py-3"
                >
                  Accéder à mon espace
                </Link>
              ) : (
                <>
                  <Link to="/inscription" className="btn btn-primary px-8 py-3">
                    Créer un compte
                  </Link>
                  <Link to="/connexion" className="btn btn-outline px-8 py-3">
                    Connexion
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-12 md:py-20 bg-card-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Fonctionnalités principales</h2>
            <p className="max-w-2xl mx-auto opacity-80">
              Notre plateforme vous offre tous les outils nécessaires pour gérer efficacement vos demandes clients.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card text-center hover:shadow-md transition-all animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="inline-flex justify-center items-center p-3 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="opacity-80">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to action */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à améliorer votre gestion client ?
            </h2>
            <p className="text-lg mb-10 opacity-80">
              Rejoignez les entreprises qui ont déjà optimisé leur gestion des demandes clients 
              et amélioré leur taux de satisfaction.
            </p>
            
            {user ? (
              <Link 
                to={user.role === 'admin' ? '/admin' : '/client'} 
                className="btn btn-primary px-8 py-3"
              >
                Accéder à mon espace
              </Link>
            ) : (
              <Link to="/inscription" className="btn btn-primary px-8 py-3">
                Commencer gratuitement
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Accueil;