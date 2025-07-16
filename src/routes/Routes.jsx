import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Import des pages
import LoginScreen from '../pages/LoginScreen';
import DashboardScreen from '../pages/DashboardScreen';
//sales
import SalesScreen from '../pages/sales/SalesScreen';
//stocks
import StocksScreen from '../pages/stocks/StocksScreen';
//products
import ProductsScreen from '../pages/products/ProductsScreen';
//category
import CategoriesScreen from '../pages/categories/CategoriesScreen';
import CategoryCreateScreen from '../pages/categories/CategoryCreateScreen.jsx';
import CategoryEditScreen from '../pages/categories/CategoryEditScreen.jsx';

//clients
import ClientsScreen from '../pages/clients/ClientsScreen';
import ClientCreateScreen from '../pages/clients/ClientCreateScreen.jsx';
import ClientEditScreen from '../pages/clients/ClientEditScreen.jsx';
//suppliers
import SuppliersScreen from '../pages/suppliers/SuppliersScreen';
import PurchasesScreen from '../pages/purchases/PurchasesScreen';
import UsersScreen from '../pages/users/UsersScreen';
import VehiclesScreen from '../pages/vehicules/VehiclesScreen.jsx';
import CashRegistersScreen from '../pages/cashregister/CashRegistersScreen';
import TransactionsScreen from '../pages/transactions/TransactionsScreen';
import ExpensesScreen from '../pages/expenses/ExpensesScreen';
import ExpenseTypesScreen from '../pages/expensetypes/ExpenseTypesScreen';
import ReportsScreen from '../pages/reports/ReportsScreen.jsx';


import NotFound from '../components/NotFound';

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
  //sales
  { path: '/sales', component: SalesScreen },
  //stocks
  { path: '/stocks', component: StocksScreen },
  //products
  { path: '/products', component: ProductsScreen },
  //category
  { path: '/categories', component: CategoriesScreen },
  { path: '/categories/create', component: CategoryCreateScreen },
  { path: '/categories/:id/edit', component: CategoryEditScreen },
  //clients
  { path: '/clients', component: ClientsScreen },
  { path: '/clients/create', component: ClientCreateScreen },
  { path: '/clients/:id/edit', component: ClientEditScreen },

  //suppliers
  { path: '/suppliers', component: SuppliersScreen },
  { path: '/purchases', component: PurchasesScreen },
  { path: '/users', component: UsersScreen },
  { path: '/vehicles', component: VehiclesScreen },
  { path: '/cash-registers', component: CashRegistersScreen },
  { path: '/transactions', component: TransactionsScreen },
  { path: '/expenses', component: ExpensesScreen },
  { path: '/expense-types', component: ExpenseTypesScreen },
  { path: '/reports', component: ReportsScreen },
  { path: '/404', component: NotFound },
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
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
};

export default AppRoutes;
