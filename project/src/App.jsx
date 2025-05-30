import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import Layout from './layouts/Layout';
import AdminLayout from './layouts/AdminLayout';

// Pages
import Accueil from './pages/Accueil';
import Connexion from './pages/Connexion';
import Inscription from './pages/Inscription';
import ClientDashboard from './pages/client/Dashboard';
import ClientDemandes from './pages/client/Demandes';
import ClientProfil from './pages/client/Profil';
import AdminDashboard from './pages/admin/Dashboard';
import Satisfaction from './pages/admin/Satisfaction';
import AdminDemandes from './pages/admin/Demandes';
import AdminProfil from './pages/admin/Profil';
import About from './pages/admin/about';
import NouvelleDemandeClient from './pages/client/NouvelleDemande';
import DetailDemandeClient from './pages/client/DetailDemande';
import DetailDemandeAdmin from './pages/admin/DetailDemande';
import UserManagement from './pages/admin/UserManagement';
import NotFound from './pages/NotFound';

// Route Guards
const ProtectedClientRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  if (!user) return <Navigate to="/connexion" />;

  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;

  if (!user || user.role !== 'admin') return <Navigate to="/connexion" />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Accueil />} />
          <Route path="connexion" element={<Connexion />} />
          <Route path="inscription" element={<Inscription />} />
        </Route>

        {/* Routes client */}
        <Route
          path="/client"
          element={
            <ProtectedClientRoute>
              <Layout />
            </ProtectedClientRoute>
          }
        >
          <Route index element={<ClientDashboard />} />
          <Route path="demandes" element={<ClientDemandes />} />
          <Route path="nouvelle-demande" element={<NouvelleDemandeClient />} />
          <Route path="details-demandes/:id" element={<DetailDemandeClient />} />
          <Route path="profil" element={<ClientProfil />} />
        </Route>

        {/* Routes admin */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="demandes" element={<AdminDemandes />} />
          <Route path="demandes/:id" element={<DetailDemandeAdmin />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="satisfaction" element={<Satisfaction />} />
          <Route path="about" element={<About />} />
          <Route path="profil" element={<AdminProfil />} />
        </Route>

        {/* Route 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
