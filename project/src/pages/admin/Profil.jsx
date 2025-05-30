import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

const Profil = () => {
  const { user } = useAuth();
  const [openSection, setOpenSection] = useState('profil'); // Track open section

  if (!user) {
    return null;
  }

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 tracking-tight">
          Profil Administrateur
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Consultez les détails de votre compte administrateur
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-xl">
          {/* Header Banner */}
          <div className="bg-green-600 dark:bg-green-700 p-4 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-800/50 text-green-800 dark:text-green-200 text-sm font-medium">
              <Shield size={16} className="mr-2" />
              Administrateur avec accès complet
            </div>
          </div>

          {/* Avatar */}
          <div className="flex justify-center -mt-12">
            <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-800/50 border-4 border-white dark:border-gray-900 flex items-center justify-center text-green-600 dark:text-green-400">
              <Shield size={40} />
            </div>
          </div>

          {/* User Info */}
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{user.name}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{user.email}</p>

            {/* Collapsible Sections */}
            <div className="space-y-4">
              {/* Profil Section */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  className="w-full flex justify-between items-center py-3 text-left text-lg font-medium text-gray-900 dark:text-gray-100"
                  onClick={() => toggleSection('profil')}
                >
                  <span>Profil</span>
                  {openSection === 'profil' ? (
                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                {openSection === 'profil' && (
                  <div className="pb-4 text-left">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Nom complet</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.email}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Compte Section */}
              <div className="border-b border-gray-200 dark:border-gray-700">
                <button
                  className="w-full flex justify-between items-center py-3 text-left text-lg font-medium text-gray-900 dark:text-gray-100"
                  onClick={() => toggleSection('compte')}
                >
                  <span>Compte</span>
                  {openSection === 'compte' ? (
                    <ChevronUp size={20} className="text-gray-600 dark:text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                  )}
                </button>
                {openSection === 'compte' && (
                  <div className="pb-4 text-left">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">ID administrateur</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{user.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Rôle</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 capitalize">{user.role}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Compte créé le</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{formatDate(user.created_at)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profil;