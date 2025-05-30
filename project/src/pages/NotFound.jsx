import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-18rem)] flex items-center justify-center py-12 px-4 animate-fade-in">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-full bg-error/10 text-error">
            <AlertTriangle size={48} />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page non trouvée</h1>
        <p className="mb-8 max-w-md mx-auto opacity-80">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        
        <Link to="/" className="btn btn-primary inline-flex items-center">
          <Home size={18} className="mr-2" />
          Retourner à l'accueil
        </Link>
      </div>
    </div>
  );
};

export default NotFound;