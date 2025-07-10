import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Import des pages
import LoginScreen from '../pages/LoginScreen';
import DashboardScreen from '../pages/DashboardScreen';
import ProductsScreen from '../pages/products/ProductsScreen';

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return isAuthenticated ? (
    <MainLayout>
      {children}
    </MainLayout>
  ) : (
    <Navigate to="/login" replace />
  );
};

// Composant pour les routes publiques (accessible seulement si non connecté)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Configuration des routes protégées
const protectedRoutes = [
  { path: '/dashboard', component: DashboardScreen },
  { path: '/products', component: ProductsScreen },
];

const AppRoutes = () => {
  return (
    <Routes>
      {/* Route de connexion */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        } 
      />

      {/* Routes protégées */}
      {protectedRoutes.map(({ path, component: Component }) => (
        <Route
          key={path}
          path={path}
          element={
            <ProtectedRoute>
              <Component />
            </ProtectedRoute>
          }
        />
      ))}

      {/* Redirection par défaut */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Route 404 - page non trouvée */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;