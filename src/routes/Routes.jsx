import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Import des pages
import LoginScreen from '../pages/LoginScreen';
import DashboardScreen from '../pages/DashboardScreen';
import SalesScreen from '../pages/sales/SalesScreen';
import StocksScreen from '../pages/stocks/StocksScreen';
import ProductsScreen from '../pages/products/ProductsScreen';
import CategoriesScreen from '../pages/categories/CategoriesScreen';
import ClientsScreen from '../pages/clients/ClientsScreen';
import SuppliersScreen from '../pages/suppliers/SuppliersScreen';
import PurchasesScreen from '../pages/purchases/PurchasesScreen';
import UsersScreen from '../pages/users/UsersScreen';
import VehiclesScreen from '../pages/vehicules/VehiclesScreen.jsx';
import CashRegistersScreen from '../pages/cashregister/CashRegistersScreen';
import TransactionsScreen from '../pages/transactions/TransactionsScreen';
import ExpensesScreen from '../pages/expenses/ExpensesScreen';
import ExpenseTypesScreen from '../pages/expensetypes/ExpenseTypesScreen';
import ReportsScreen from '../pages/reports/ReportsScreen.jsx';

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
  { path: '/sales', component: SalesScreen },
  { path: '/stocks', component: StocksScreen },
  { path: '/products', component: ProductsScreen },
  { path: '/categories', component: CategoriesScreen },
  { path: '/clients', component: ClientsScreen },
  { path: '/suppliers', component: SuppliersScreen },
  { path: '/purchases', component: PurchasesScreen },
  { path: '/users', component: UsersScreen },
  { path: '/vehicles', component: VehiclesScreen },
  { path: '/cash-registers', component: CashRegistersScreen },
  { path: '/transactions', component: TransactionsScreen },
  { path: '/expenses', component: ExpensesScreen },
  { path: '/expense-types', component: ExpenseTypesScreen },
  { path: '/reports', component: ReportsScreen },
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