import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, CheckCircle, Clock, BarChart2 } from 'lucide-react';

const features = [
  {
    icon: MessageCircle,
    title: 'Suivez vos demandes',
    description: 'Gardez un œil sur toutes vos demandes en un seul endroit, avec une interface simple et intuitive.',
  },
  {
    icon: CheckCircle,
    title: 'Réponses rapides',
    description: 'Recevez des mises à jour instantanées et des solutions rapides pour toutes vos demandes.',
  },
  {
    icon: Clock,
    title: 'Historique clair',
    description: 'Consultez l’historique complet de vos interactions pour ne rien manquer.',
  },
  {
    icon: BarChart2,
    title: 'Votre satisfaction compte',
    description: 'Évaluez nos services et aidez-nous à nous améliorer grâce à vos retours.',
  },
];

const Accueil = () => {
  const { user } = useAuth();

  // Show login/register prompt for unauthenticated users
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-300">
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center text-center">
              <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400 dark:from-blue-400 dark:to-teal-200">
                Bienvenue sur Clientélia
              </h1>
              <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 mb-10">
                Connectez-vous ou créez un compte pour gérer vos demandes en toute simplicité.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/connexion"
                  className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
                >
                  Se connecter
                </Link>
                <Link
                  to="/inscription"
                  className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 transition-all duration-300"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-100 dark:bg-gray-700">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Tout pour vous faciliter la vie</h2>
              <p className="text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mt-4">
                Découvrez les outils qui rendent la gestion de vos demandes fluide, rapide et agréable.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex justify-center items-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mb-4">
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                Prêt à simplifier votre quotidien ?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
                Inscrivez-vous dès maintenant pour commencer à utiliser Clientélia.
              </p>
              <Link
                to="/inscription"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </section>

        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in-up {
              animation: fadeInUp 0.5s ease;
            }
          `}
        </style>
      </div>
    );
  }

  // Content for authenticated clients
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-teal-400 dark:from-blue-400 dark:to-teal-200">
              Bienvenue, <span className="text-blue-600 dark:text-blue-400">{user.first_name || 'Client'}</span> ! Gérez vos demandes en toute simplicité
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-600 dark:text-gray-300 mb-10">
              Avec Clientélia, suivez vos demandes, recevez des réponses rapides et partagez vos retours pour une expérience sur mesure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/client"
                className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
              >
                Voir mes demandes
              </Link>
              <Link
                to="/client/nouvelle-demande"
                className="inline-flex items-center px-8 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 transition-all duration-300"
              >
                Créer une demande
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100 dark:bg-gray-700">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100">Tout pour vous faciliter la vie</h2>
            <p className="text-lg max-w-2xl mx-auto text-gray-600 dark:text-gray-300 mt-4">
              Découvrez les outils qui rendent la gestion de vos demandes fluide, rapide et agréable.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center items-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 mb-4">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
 <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-6">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10">
              Créez une nouvelle demande ou consultez vos demandes en cours pour une expérience fluide et personnalisée avec Clientélia.
            </p>
            <Link
              to="/client/nouvelle-demande"
              className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-all duration-300"
            >
              Créer une nouvelle demande
            </Link>
          </div>
        </div>
      </section>

      {/* Global Styles for Animations */}
      <style>
        {`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in-up {
            animation: fadeInUp 0.5s ease backwards;
          }
        `}
      </style>
    </div>
  );
};

export default Accueil;