import axios from 'axios';

const API_URL = 'http://localhost:8000/api/requests/';


const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    throw new Error("Refresh token manquant. Veuillez vous reconnecter.");
  }

  try {
    const response = await fetch("http://localhost:8000/api/token/refresh/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Erreur lors du rafraîchissement du token :", data);
      throw new Error("Échec du rafraîchissement du token. Veuillez vous reconnecter.");
    }

    localStorage.setItem("access_token", data.access);
    console.log("Nouveau token d'accès obtenu.");
    return data.access;

  } catch (error) {
    console.error("Erreur lors du rafraîchissement :", error);
    throw error;
  }
};

export const getUserRequests = async () => {
  let token = localStorage.getItem('access_token');

  if (!token) {
    throw new Error('Token non trouvé. Veuillez vous connecter.');
  }

  const API_URL = 'http://localhost:8000/api/requests/';

  try {
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    // Si erreur 401 (unauthorized), on tente de rafraîchir le token
    if (error.response && error.response.status === 401) {
      try {
        console.warn('Token expiré, tentative de rafraîchissement...');
        const newToken = await refreshAccessToken();
        token = newToken;

        // Retente de la requête avec le nouveau token
        const retryResponse = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });

        return retryResponse.data;
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token :', refreshError);
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
    } else {
      console.error('Erreur lors de la récupération des demandes utilisateur :', error);
      throw new Error(error.response?.data?.detail || 'Erreur lors de la récupération des demandes');
    }
  }
};


export const getStats = async () => {
  let token = localStorage.getItem('access_token');

  try {
    const response = await fetch('http://localhost:8000/api/stats', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Si le token est expiré ou invalide, on tente un refresh
    if (response.status === 401) {
      console.warn("⏳ Token expiré, tentative de rafraîchissement...");

      token = await refreshAccessToken();

      // Nouvelle tentative avec le nouveau token
      const retryResponse = await fetch('http://localhost:8000/api/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!retryResponse.ok) {
        throw new Error(`Erreur HTTP après rafraîchissement: ${retryResponse.status}`);
      }

      const data = await retryResponse.json();
      return data;
    }

    // Si la réponse initiale est OK
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    throw error;
  }
};

export const getAllRequests = async () => {
  const accessToken = localStorage.getItem("access_token");

  try {
    const response = await fetch("http://localhost:8000/api/requests/all/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.status === 401) {
      // Token expiré, tentative de rafraîchissement
      console.warn("Token expiré, tentative de rafraîchissement...");

      const newAccessToken = await refreshAccessToken();

      // Réessayer avec le nouveau token
      const retryResponse = await fetch("http://localhost:8000/api/requests/all/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${newAccessToken}`,
        },
      });

      if (!retryResponse.ok) {
        throw new Error("Échec après rafraîchissement du token.");
      }

      return await retryResponse.json();
    }

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    console.error("Erreur API getAllRequests:", error);
    throw error;
  }
};


// Fonction pour créer une requête (avec rafraîchissement auto du token si expiré)
export const createRequest = async (requestData) => {
  let token = localStorage.getItem("access_token");

  if (!token) {
    console.error("Token non trouvé, rediriger vers la page de connexion.");
    throw new Error("Token manquant, veuillez vous connecter.");
  }

  console.log("Token envoyé :", token);
  console.log("Données envoyées :", requestData);

  const makeRequest = async (accessToken) => {
    const response = await fetch("http://localhost:8000/api/requests/create/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(requestData),
    });

    const contentType = response.headers.get("Content-Type");

    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();

      if (!response.ok) {
        // Si token invalide, tenter de le rafraîchir
        if (data.code === "token_not_valid") {
          console.warn("Token expiré, tentative de rafraîchissement...");
          const newToken = await refreshAccessToken(); // <-- obtient nouveau token
          return await makeRequest(newToken); // <-- relance la requête
        }

        console.error("Erreur de création :", data);
        throw new Error(data.message || "Erreur lors de la création de la demande");
      }

      return data;
    } else {
      const errorText = await response.text();
      console.error("Erreur serveur, réponse HTML :", errorText);
      throw new Error("Erreur serveur lors de la création de la demande.");
    }
  };

  return await makeRequest(token);
};


export const updateRequestStatus = async (requestId, newStatus) => {
  let accessToken = localStorage.getItem("access_token");

  try {
    let response = await fetch(`http://localhost:8000/api/requests/${requestId}/status/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ status: newStatus }),
    });

    // Si token expiré → on essaie de rafraîchir
    if (response.status === 401 || response.status === 403) {
      accessToken = await refreshAccessToken(); // ta fonction
      response = await fetch(`http://localhost:8000/api/requests/${requestId}/status/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
    }

    if (!response.ok) {
      throw new Error('Error updating request status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getRequestById = async (id) => {
  try {
    const response = await fetch(`http://localhost:8000/api/requests/${id}/`);
    if (!response.ok) {
      throw new Error("Failed to fetch request");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching request:", error);
    throw error;
  }
};


const getTokenConfig = () => {
  const token = localStorage.getItem("access_token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

export const addFeedback = (requestId, rating, comment) => {
  const feedbackData = { rating, comment };
  const sendRequest = () =>
    axios.post(`http://localhost:8000/api/requests/${requestId}/feedback/`, feedbackData, getTokenConfig());
  return sendRequest()
    .then(res => {
      if (!res.data || !res.data.id) {
        throw new Error('Réponse API invalide');
      }
      console.log('Réponse API addFeedback:', res.data); // Log pour déboguer
      return res.data;
    })
    .catch(error => {
      if (error.response?.status === 401) {
        return refreshAccessToken()
          .then(() => sendRequest())
          .then(res => {
            if (!res.data || !res.data.id) {
              throw new Error('Réponse API invalide après rafraîchissement');
            }
            console.log('Réponse API addFeedback après refresh:', res.data);
            return res.data;
          })
          .catch(refreshError => {
            console.error('Erreur après refresh token:', refreshError);
            return Promise.reject(new Error('Échec de l’authentification'));
          });
      }
      const errorMessage = error.response?.data?.error || 'Erreur lors de l’envoi du feedback';
      console.error('Erreur lors de l’envoi du feedback:', errorMessage);
      return Promise.reject(new Error(errorMessage));
    });
};

export const updateRequest = (id, { title, description, category }) => {
  const requestData = { title, description, category };
  const sendRequest = () =>
    axios.put(`http://localhost:8000/api/requests/${id}/update/`, requestData, getTokenConfig());
  return sendRequest()
    .then(res => res.data)
    .catch(error => {
      if (error.response?.status === 401) {
        return refreshAccessToken()
          .then(() => sendRequest())
          .then(res => res.data)
          .catch(refreshError => {
            console.error("Erreur après refresh token :", refreshError);
            return Promise.reject(refreshError);
          });
      }
      console.error("Erreur lors de la mise à jour de la demande :", error.response?.data || error.message);
      return Promise.reject(error);
    });
};




export const fetchProfile = async () => {
  let token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Non authentifié.");
  }

  try {
    const response = await axios.get('http://localhost:8000/api/users/me/', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;

  } catch (error) {
    // ⚠️ Si le token est expiré, on tente un rafraîchissement
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();

        const retryResponse = await axios.get('http://localhost:8000/api/users/me/', {
          headers: {
            Authorization: `Bearer ${newToken}`,
          },
        });

        return retryResponse.data;

      } catch (refreshError) {
        throw new Error("Échec du rafraîchissement. Veuillez vous reconnecter.");
      }
    }

    throw error; // autre erreur
  }
};


export const updateProfile = async (username, email) => {
  let token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Non authentifié.");
  }

  try {
    const response = await axios.put(
      'http://localhost:8000/api/users/me/',
      { username, email },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;

  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();

        const retryResponse = await axios.put(
          'http://localhost:8000/api/users/me/',
          { username, email },
          {
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          }
        );

        return retryResponse.data;

      } catch (refreshError) {
        throw new Error("Échec du rafraîchissement. Veuillez vous reconnecter.");
      }
    }

    throw error;
  }
};

export const deleteRequest = async (requestId) => {
  let token = localStorage.getItem("access_token");
  if (!token) throw new Error("Utilisateur non authentifié");

  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };

  try {
    const response = await axios.delete(`http://localhost:8000/api/requests/delete/${requestId}/`, config);
    return response.data;
  } catch (error) {
    // Si erreur 401, token peut être expiré, essayer de rafraîchir
    if (error.response && error.response.status === 401) {
      try {
        token = await refreshAccessToken();
        const newConfig = {
          headers: { Authorization: `Bearer ${token}` },
        };
        const retryResponse = await axios.delete(`http://localhost:8000/api/requests/delete/${requestId}/`, newConfig);
        return retryResponse.data;
      } catch (refreshError) {
        throw refreshError;
      }
    }
    throw error;
  }
};


export const fetchFeedbacks = async () => {
  let token = localStorage.getItem("access_token");
  if (!token) {
    console.error("Aucun token trouvé.");
    throw new Error("Utilisateur non authentifié.");
  }

  const url = "http://localhost:8000/api/feedbacks/";

  let response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  // Si le token est expiré, tentative de refresh
  if (response.status === 401) {
    console.warn("Token expiré, tentative de rafraîchissement...");
    try {
      token = await refreshAccessToken();
      response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Échec du rafraîchissement du token :", err);
      throw new Error("Erreur d'authentification. Veuillez vous reconnecter.");
    }
  }

  // Si l'API échoue encore
  if (!response.ok) {
    let errorMessage = `Erreur ${response.status}`;
    try {
      const errData = await response.json();
      errorMessage = errData?.detail || errorMessage;
      console.error("Erreur lors de la récupération des feedbacks :", errData);
    } catch (e) {
      console.error("Erreur inconnue :", e);
    }
    throw new Error(errorMessage);
  }

  // Tout va bien
  const data = await response.json();
  console.log("Feedbacks reçus :", data);
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const attemptRequest = async (token) => {
    try {
      const response = await fetch('http://localhost:8000/api/change-password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      // Log response status and headers
      console.log("Change password response status:", response.status);
      console.log("Change password response headers:", [...response.headers.entries()]);

      // Get raw response text
      const responseText = await response.text();
      console.log("Change password response body:", responseText);

      // Attempt to parse JSON
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("JSON parse error in changePassword:", error.message);
        throw new Error("Réponse invalide du serveur lors du changement de mot de passe.");
      }

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du changement de mot de passe');
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Token d’accès manquant. Veuillez vous reconnecter.');
    }

    return await attemptRequest(token);
  } catch (error) {
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      console.log('Token expiré, tentative de rafraîchissement...');
      try {
        const newToken = await refreshAccessToken();
        return await attemptRequest(newToken);
      } catch (refreshError) {
        throw new Error('Échec du rafraîchissement du token. Veuillez vous reconnecter.');
      }
    }
    throw new Error(error.message || 'Erreur réseau');
  }
}

// Fonction pour récupérer les notifications de l'utilisateur connecté
export const getNotifications = async () => {
  try {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Aucun token trouvé. Veuillez vous connecter.');
    }

    let response = await axios.get('http://localhost:8000/notifications/', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      try {
        const newToken = await refreshAccessToken();
        const retryResponse = await axios.get('http://localhost:8000/notifications/', {
          headers: {
            Authorization: `Bearer ${newToken}`,
            'Content-Type': 'application/json',
          },
        });
        return retryResponse.data;
      } catch (refreshError) {
        console.error('Échec du rafraîchissement du token:', refreshError.message);
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        throw refreshError;
      }
    }
    console.error('Erreur lors de la récupération des notifications:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour marquer une notification comme lue
export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Aucun token trouvé. Veuillez vous connecter.');
    }
    const response = await axios.put(`http://localhost:8000/notifications/${notificationId}/read/`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors du marquage de la notification comme lue:', error.response?.data || error.message);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    let token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('Aucun token trouvé. Veuillez vous connecter.');
    }
    let response = await fetch(`http://localhost:8000/notifications/${notificationId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (response.status === 401) {
      token = await refreshAccessToken();
      response = await fetch(`http://localhost:8000/notifications/${notificationId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la suppression de la notification');
    }
    return response.status === 204 ? {} : await response.json();
  } catch (error) {
    console.error('Erreur lors de la suppression de la notification:', error.message);
    throw error;
  }
};