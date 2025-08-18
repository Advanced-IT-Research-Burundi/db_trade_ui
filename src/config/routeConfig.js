
export const routesConfig = [
  {
    path: '/dashboard',
    icon: 'pi pi-home',
    label: 'Dashboard',
    component: 'DashboardScreen'
  },
  {
    path: '/sales',
    icon: 'pi pi-dollar',
    label: 'Ventes',
    component: 'SalesScreen'
  },
  {
    path: '/proforma',
    icon: 'pi pi-file',
    label: 'Proforma',
    component: 'SalesScreen'
  },
  {
    path: '/stocks',
    icon: 'pi pi-box',
    label: 'Stocks',
    component: 'StocksScreen'
  },
  {
    path: '/products',
    icon: 'pi pi-shopping-bag',
    label: 'Produits',
    component: 'ProductsScreen'
  },
  {
    path: '/categories',
    icon: 'pi pi-tags',
    label: 'Catégories',
    component: 'CategoriesScreen'
  },
  {
    path: '/clients',
    icon: 'pi pi-user',
    label: 'Clients',
    component: 'ClientsScreen'
  },
  {
    path: '/suppliers',
    icon: 'pi pi-truck',
    label: 'Fournisseurs',
    component: 'SuppliersScreen'
  },
  {
    path: '/commandes',
    icon: 'pi pi-upload',
    label: 'Imports',
    component: 'ImportsScreen'
  },
  // {
  //   path: '/purchases',
  //   icon: 'pi pi-shopping-cart',
  //   label: 'Achats',
  //   component: 'PurchasesScreen'
  // },
  {
    path: '/users',
    icon: 'pi pi-users',
    label: 'Utilisateurs',
    component: 'UsersScreen'
  },
  {
    path: '/vehicles',
    icon: 'pi pi-car',
    label: 'Véhicules',
    component: 'VehiclesScreen'
  },
  {
    path: '/cash-registers',
    icon: 'pi pi-wallet',
    label: 'Caisse',
    component: 'CashRegistersScreen'
  },
  {
    path: '/transactions',
    icon: 'pi pi-refresh',
    label: 'Transactions',
    component: 'TransactionsScreen'
  },
  {
    path: '/expenses',
    icon: 'pi pi-money-bill',
    label: 'Dépenses',
    component: 'ExpensesScreen'
  },
  {
    path: '/expense-types',
    icon: 'pi pi-cog',
    label: 'Types de dépenses',
    component: 'ExpenseTypesScreen'
  },
  {
    path: '/reports',
    icon: 'pi pi-chart-bar',
    label: 'Rapports',
    component: 'ReportsScreen'
  }
];
export const getMenuItems = () => {
  return routesConfig.map(({ path, icon, label }) => ({
    path,
    icon,
    label
  }));
};

export const getRoutes = () => {
  return routesConfig.map(({ path, component }) => ({
    path,
    component
  }));
};