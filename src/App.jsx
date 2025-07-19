
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/Routes.jsx';

import { CartProvider } from './contexts/cartReducer';
import './App.css';

function App() {
  return (
    <CartProvider>
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
    </CartProvider>
  );
}

export default App;