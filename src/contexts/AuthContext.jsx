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

  
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {

          const userData = await ApiService.getCurrentUser();
          setUser(userData.data || userData.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token invalide:', error);
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await ApiService.login(credentials);
      
      const token = response.token || response.data?.token;
      const userData = response.data?.user || response.user;
      
      if (token && userData) {
        localStorage.setItem('token', token);
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
        error: error.message || 'Erreur de connexion'
      };
    }
  };

  const logout = async () => {
    try {
      
      await ApiService.logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const refreshUserData = async () => {
    try {
      const userData = await ApiService.getCurrentUser();
      setUser(userData.data || userData.user);
      return userData;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    updateUser,
    refreshUserData
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