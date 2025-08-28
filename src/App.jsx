
import React, { useLayoutEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/Routes.jsx';

import { CartProvider } from './contexts/cartReducer';
import './App.css';
import { Provider, useDispatch } from 'react-redux';
import store from './stores/index';
import LoadingComponent from './pages/component/LoadingComponent';
import { setLocaleAction } from './stores/actions/appActions.js';


function App() {
   const dispatch=useDispatch()
  

    useLayoutEffect(() => {
        try {
            dispatch(setLocaleAction(localStorage.getItem('locale') || 'fr'))
        } catch (error) {
            console.log(error)
        }
    }, [])
    
  return (
    
    <Provider store={store}>
      <CartProvider>
        <LoadingComponent />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </CartProvider>
    </Provider>
  );
}

export default App;