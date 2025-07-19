// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';

// Créer le contexte
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info
  const [loading, setLoading] = useState(true); // chargement de l’user

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (accessToken) {
      // Prioriser l'API pour les données les plus récentes
      fetch('http://localhost:8000/api/users/me/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error('Échec du chargement du profil');
          }
          return res.json();
        })
        .then((data) => {
          const userData = {
            id: data.id,
            email: data.email,
            username: data.username,
            first_name: data.first_name || '',
            role: data.role,
            created_at: data.created_at,
          };
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('Utilisateur chargé depuis l\'API:', userData); // Pour débogage
        })
        .catch((err) => {
          console.error('Erreur lors du chargement de l\'utilisateur:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
        })
        .finally(() => setLoading(false));
    } else if (storedUser) {
      // Fallback sur localStorage si aucun token
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log('Utilisateur chargé depuis localStorage:', parsedUser);
      } catch (e) {
        console.error('Erreur lors du parsing de user depuis localStorage:', e);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, accessToken, refreshToken) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (accessToken) localStorage.setItem('access_token', accessToken);
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
    console.log('Connexion réussie:', userData);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('Déconnexion réussie');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider');
  }
  return context;
};