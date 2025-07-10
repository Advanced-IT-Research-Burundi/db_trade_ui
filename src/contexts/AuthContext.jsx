import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Alias pour compatibilité avec le Header

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Définir le token dans ApiService si nécessaire
          ApiService.setToken(token);
          
          const userData = await ApiService.getCurrentUser();
          const userInfo = userData.data || userData.user || userData;
          
          setUser(userInfo);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token invalide:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          
          // Rediriger vers la page de connexion si le token est invalide
          if (error.response?.status === 401) {
            window.location.href = '/login';
          }
        }
      } else {
        // Pas de token, vérifier si on est sur une page protégée
        const currentPath = window.location.pathname;
        const publicPaths = ['/login', '/register', '/forgot-password', '/'];
        
        if (!publicPaths.includes(currentPath)) {
          window.location.href = '/login';
        }
      }
      
      setLoading(false);
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      // setLoading(true);
      // setIsLoading(true);
      
      const response = await ApiService.login(credentials);
      
      const token = response.token || response.data?.token;
      const userData = response.data?.user || response.user || response.data;
      
      if (token && userData) {
        localStorage.setItem('token', token);
        ApiService.setToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, data: userData };
      } else {
        throw new Error('Format de réponse invalide');
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Erreur de connexion'
      };
    } finally {
      // setLoading(false);
      // setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await ApiService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      ApiService.clearToken();
      setIsAuthenticated(false);
      setUser(null);
      
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const refreshUserData = async () => {
    try {
      const userData = await ApiService.getCurrentUser();
      const userInfo = userData.data || userData.user || userData;
      setUser(userInfo);
      return userInfo;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      
      // Si l'erreur est due à un token invalide, déconnecter l'utilisateur
      if (error.response?.status === 401) {
        logout();
      }
      
      throw error;
    }
  };

  // Fonction pour obtenir les informations utilisateur avec fallback
  const getUserInfo = () => {
    if (loading || isLoading) {
      return { 
        name: 'Chargement...', 
        email: 'Chargement...',
        isLoading: true
      };
    }
    
    if (user) {
      return {
        name: user.name || user.username || user.firstName || user.fullName || 'Utilisateur',
        email: user.email || 'Email non disponible',
        avatar: user.avatar || user.photo || user.profilePicture,
        role: user.role || user.userType,
        isLoading: false
      };
    }
    
    return { 
      name: 'Utilisateur', 
      email: 'Email',
      isLoading: false
    };
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    isLoading, // Alias pour compatibilité
    login,
    logout,
    updateUser,
    refreshUserData,
    getUserInfo
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};