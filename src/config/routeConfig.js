export const routesConfig = [
  {
    path: '/dashboard',
    icon: 'pi pi-home',
    labelKey: 'sidebar.dashboard',
    component: 'DashboardScreen'
  },
  {
    path: '/sales',
    icon: 'pi pi-dollar',
    labelKey: 'sidebar.sales',
    component: 'SalesScreen'
  },
  {
    path: '/proforma',
    icon: 'pi pi-file',
    labelKey: 'sidebar.proforma',
    component: 'SalesScreen'
  },
  {
    path: '/stocks',
    icon: 'pi pi-box',
    labelKey: 'sidebar.stocks',
    component: 'StocksScreen'
  },
  {
    path: '/products',
    icon: 'pi pi-shopping-bag',
    labelKey: 'sidebar.products',
    component: 'ProductsScreen'
  },
  {
    path: '/categories',
    icon: 'pi pi-tags',
    labelKey: 'sidebar.categories',
    component: 'CategoriesScreen'
  },
  {
    path: '/clients',
    icon: 'pi pi-user',
    labelKey: 'sidebar.clients',
    component: 'ClientsScreen'
  },
  {
    path: '/suppliers',
    icon: 'pi pi-truck',
    labelKey: 'sidebar.suppliers',
    component: 'SuppliersScreen'
  },
  {
    path: '/commandes',
    icon: 'pi pi-upload',
    labelKey: 'sidebar.imports',
    component: 'ImportsScreen'
  },
  // {
  //   path: '/purchases',
  //   icon: 'pi pi-shopping-cart',
  //   labelKey: 'sidebar.purchases',
  //   component: 'PurchasesScreen'
  // },
  {
    path: '/users',
    icon: 'pi pi-users',
    labelKey: 'sidebar.users',
    component: 'UsersScreen'
  },
  {
    path: '/vehicles',
    icon: 'pi pi-car',
    labelKey: 'sidebar.vehicles',
    component: 'VehiclesScreen'
  },
  {
    path: '/cash-registers',
    icon: 'pi pi-wallet',
    labelKey: 'sidebar.cashRegisters',
    component: 'CashRegistersScreen'
  },
  {
    path: '/transactions',
    icon: 'pi pi-refresh',
    labelKey: 'sidebar.transactions',
    component: 'TransactionsScreen'
  },
  {
    path: '/expenses',
    icon: 'pi pi-money-bill',
    labelKey: 'sidebar.expenses',
    component: 'ExpensesScreen'
  },
  {
    path: '/expense-types',
    icon: 'pi pi-cog',
    labelKey: 'sidebar.expenseTypes',
    component: 'ExpenseTypesScreen'
  },
  {
    path: '/reports',
    icon: 'pi pi-chart-bar',
    labelKey: 'sidebar.reports',
    component: 'ReportsScreen'
  }
];

export const getMenuItems = () => {
  return routesConfig.map(({ path, icon, labelKey }) => ({
    path,
    icon,
    labelKey
  }));
};

export const getRoutes = () => {
  return routesConfig.map(({ path, component }) => ({
    path,
    component
  }));
};