import axios from 'axios';

const API_URL = 'http://localhost:8000/api/token/';  // L'URL de l'API pour obtenir les tokens

// Connexion avec le backend Django
export const login = async (username, password) => {
  try {
    // Appel à l'API pour récupérer les tokens
    const response = await axios.post(API_URL, {
      username,
      password
    });

    // Stockage des tokens dans le localStorage
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);

    // Ajouter le token d'accès à chaque requête Axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

    console.log("Connexion réussie !");
  } catch (error) {
    console.error("Échec de connexion", error);
  }
};

// Fonction de déconnexion
export const logout = async () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  delete axios.defaults.headers.common['Authorization'];
  console.log("Déconnexion réussie !");
};
