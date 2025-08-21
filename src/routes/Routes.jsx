import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';

// Import des pages
import LoginScreen from '../pages/Auth/LoginScreen';
import DashboardScreen from '../pages/DashboardScreen';
//sales
import SalesScreen from '../pages/sales/SalesScreen';
import SalesCreateScreen from '../pages/sales/SalesCreateScreen.jsx';
//proforma
import ProformaScreen from '../pages/profoma/ProformaScreen'
import ProformaCreateScreen from '../pages/profoma/ProformaCreateScreen.jsx';
import ProformaEditScreen from '../pages/profoma/ProformaEditScreen.jsx';
//stocks
import StocksScreen from '../pages/stocks/StocksScreen';
import StockShowScreen from '../pages/stocks/StockShowScreen.jsx';
import StockTransferScreen from '../pages/stocks/StockTransferScreen.jsx';
import StockMovementScreen from '../pages/stocks/StockMovementScreen.jsx';
import EntreMultipleScreen from '../pages/stocks/EntreMultipleScreen.jsx';
import StockEditScreen from '../pages/stocks/StockEditScreen.jsx';
import StockCreateScreen from '../pages/stocks/StockCreateScreen.jsx';

//products
import ProductsScreen from '../pages/products/ProductsScreen';
import AddProductScreen from '../pages/stocks/AddProductScreen.jsx';
import ProductCreateScreen from '../pages/products/ProductCreateScreen.jsx';
import ProductEditScreen from '../pages/products/ProductEditScreen.jsx';
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
import SupplierCreateScreen from '../pages/suppliers/SupplierCreateScreen.jsx';
import SupplierEditScreen from '../pages/suppliers/SupplierEditScreen.jsx';
import SuppliersShowScreen from '../pages/suppliers/SuppliersShowScreen.jsx';
//purchases
import PurchasesScreen from '../pages/purchases/PurchasesScreen';
//users
import UsersScreen from '../pages/users/UsersScreen';
import UsersCreateScreen from '../pages/users/UsersCreateScreen.jsx';
import UsersEditScreen from '../pages/users/UsersEditScreen.jsx';
import UsersShowScreen from '../pages/users/UsersShowScreen.jsx';
import UserStocksScreen from '../pages/users/UserStocksScreen.jsx';
import UserStockHistoryScreen from '../pages/users/UserStockHistoryScreen.jsx';
//vehicles
import VehiclesScreen from '../pages/vehicules/VehiclesScreen.jsx';
import VehiculeEditScreen from '../pages/vehicules/VehiculeEditScreen.jsx';
import CashRegistersScreen from '../pages/cashregister/CashRegistersScreen';
import TransactionsScreen from '../pages/transactions/TransactionsScreen';
import VehiculeDepenceScreen from '../pages/vehicules/VehiculeDepenceScreen.jsx';
import VehiculeDepenceCreateScreen from '../pages/vehicules/VehiculeDepenceCreateScreen.jsx';
import VehiculeDepenceEditScreen from '../pages/vehicules/VehiculeDepenceEditScreen.jsx';

//expenses
import ExpensesScreen from '../pages/expenses/ExpensesScreen';
import ExpenseCreateScreen from '../pages/expenses/ExpenseCreateScreen.jsx';
import ExpenseEditScreen from '../pages/expenses/ExpenseEditScreen.jsx';

// Expense Types
import ExpenseTypesScreen from '../pages/expensetypes/ExpenseTypesScreen';
import ExpenseTypeCreateScreen from '../pages/expensetypes/ExpenseTypeCreateScreen.jsx';
import ExpenseTypeEditScreen from '../pages/expensetypes/ExpenseTypeEditScreen.jsx'
// Reports
import ReportsScreen from '../pages/reports/ReportsScreen.jsx';

//Profil
import ProfileScreen from '../pages/Auth/ProfileScreen.jsx';


import NotFound from '../components/NotFound';
import SuppliersCreateScreen from '../pages/suppliers/SupplierCreateScreen.jsx';
import StockProductDetailsScreen from '../pages/stocks/StockProductDetailsScreen.jsx';
import StockPrintAll from '../pages/stocks/StockPrintAll.jsx';
import SalesShowScreen from '../pages/sales/SalesShowScreen.jsx';
import ProformaShowScreen from '../pages/profoma/ProformaShowScreen.jsx';
import VehicleCreateScreen from '../pages/vehicules/VehicleCreateScreen.jsx';
import ImportsScreen from '../pages/imports/ImportsScreen.jsx';
import CommandesScreen from '../pages/imports/CommandesScreen.jsx';
import LivraisonScreen from '../pages/imports/LivraisonScreen.jsx';
import ExcelReader from '../pages/imports/ExcelReader.jsx';
import CommandesListsScreen from '../pages/imports/CommandesListsScreen.jsx';
import CommandesShowScreen from '../pages/imports/CommandesShowScreen.jsx';
import DepenseScreen from '../pages/imports/DepenseScreen.jsx';
import ReportAnnuelScreen from '../pages/reports/ReportAnnuelScreen.jsx';
import CommandesEditScreen from '../pages/imports/CommandesEditScreen.jsx';
import BonEntreScreen from '../pages/imports/BonEntreScreen.jsx';
import BonEntreShowScreen from '../pages/imports/BonEntreShowScreen.jsx';

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
  { path: '/sales/:id', component: SalesShowScreen },
  { path: '/sales/create', component: SalesCreateScreen},
  //proforma
  { path: '/proforma',component : ProformaScreen},
  { path: '/proforma/create', component: ProformaCreateScreen },
  { path: '/proforma/:id', component: ProformaShowScreen },
  { path: '/proforma/:id/edit', component: ProformaEditScreen },
  //stocks
  { path: '/stocks', component: StocksScreen },
  { path: '/stocks/:id', component: StockShowScreen },
  { path: '/stocks/transfer', component: StockTransferScreen },
  { path: '/stocks/movements/:id', component: StockMovementScreen },
  { path: '/stocks/entre-multiple/:id', component: EntreMultipleScreen },
  { path: '/stock-product-details/:id', component: StockProductDetailsScreen },
  { path: '/stocks-print-all/:id', component: StockPrintAll },
  { path: '/stocks/create', component: StockCreateScreen },
  { path: '/stocks/:id/edit', component: StockEditScreen },
  //products
  { path: '/products', component: ProductsScreen },
  { path: '/add/product/:id', component: AddProductScreen },
  { path: '/products/create', component: ProductCreateScreen },
  { path: '/products/:id/edit', component: ProductEditScreen },
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
  { path: '/suppliers/create', component: SupplierCreateScreen },
  { path: '/suppliers/:id/edit', component: SupplierEditScreen },
  { path: '/suppliers/:id', component: SuppliersShowScreen },
  //purchases
  { path: '/purchases', component: PurchasesScreen },
  //users
  { path: '/users', component: UsersScreen },
  { path: '/users/create', component: UsersCreateScreen },
  { path: '/users/:id/edit', component: UsersEditScreen },
  { path: '/users/:id', component: UsersShowScreen },
  { path: '/users/:id/stocks', component: UserStocksScreen },
  { path: '/users/:id/stocks/history', component: UserStockHistoryScreen },
  //vehicules
  { path: '/vehicles', component: VehiclesScreen },
  { path: '/vehicles/create', component: VehicleCreateScreen },
  { path: '/vehicles/:id/edit', component: VehiculeEditScreen },
  { path: '/cash-registers', component: CashRegistersScreen },
  { path: '/transactions', component: TransactionsScreen },
  { path: '/vehicles/:id/expenses', component: VehiculeDepenceScreen },
  { path: '/vehicles/:id/expenses/create', component: VehiculeDepenceCreateScreen },
  { path: '/vehicles/:vehiculeId/expenses/:depenseId/edit', component: VehiculeDepenceEditScreen },

  //expenses
  { path: '/expenses', component: ExpensesScreen },
  { path: '/expenses/create', component: ExpenseCreateScreen },
  { path: '/expenses/:id/edit', component: ExpenseEditScreen },

  // Expense Types
  { path: '/expense-types', component: ExpenseTypesScreen },
  { path: '/expense-types/create', component: ExpenseTypeCreateScreen },
  { path: '/expense-types/:id/edit', component: ExpenseTypeEditScreen },
  { path: '/reports', component: ReportsScreen },
  { path: '/reports/financial', component: ReportAnnuelScreen },
  { path: '/profile', component: ProfileScreen },
  //imports
  { path: '/imports', component: ImportsScreen},
  { path: '/commandes', component: CommandesScreen},
  { path: '/commandes/:id', component: CommandesShowScreen},  
  { path: '/commandes/:id/edit', component: CommandesEditScreen},
  { path: '/depenses/:id/depenses', component: DepenseScreen},
  { path: '/commandes-lists', component: CommandesListsScreen},
  { path: '/livraison', component: LivraisonScreen},
  { path: '/importFile', component: ExcelReader},
  { path: '/bonEntre', component: BonEntreScreen},
  { path: '/bon-entree/:id', component: BonEntreShowScreen},

  // Errors
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