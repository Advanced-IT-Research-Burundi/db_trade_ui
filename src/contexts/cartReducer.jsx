// contexts/CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Actions du panier
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_PRICE: 'UPDATE_PRICE',
  UPDATE_DISCOUNT: 'UPDATE_DISCOUNT',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART',
  SET_LOADING: 'SET_LOADING'
};

// Reducer du panier optimisé
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product_id === product.id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return {
          ...state,
          items: updatedItems
        };
      } else {
        const newItem = {
          product_id: product.id,
          name: product.name,
          code: product.code,
          quantity: 1,
          sale_price: product.sale_price_ttc || 0,
          discount: 0,
          unit: product.unit,
          available_stock: product.quantity_disponible || 0,
          image: product.image
        };
        return {
          ...state,
          items: [...state.items, newItem]
        };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      return {
        ...state,
        items: state.items.filter(item => item.product_id !== action.payload.productId)
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.product_id !== productId)
        };
      }
      
      return {
        ...state,
        items: state.items.map(item =>
          item.product_id === productId
            ? { ...item, quantity: parseFloat(quantity) }
            : item
        )
      };
    }

    case CART_ACTIONS.UPDATE_PRICE: {
      const { productId, price } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.product_id === productId
            ? { ...item, sale_price: parseFloat(price) }
            : item
        )
      };
    }

    case CART_ACTIONS.UPDATE_DISCOUNT: {
      const { productId, discount } = action.payload;
      return {
        ...state,
        items: state.items.map(item =>
          item.product_id === productId
            ? { ...item, discount: Math.max(0, Math.min(100, parseFloat(discount) || 0)) }
            : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return {
        ...state,
        items: []
      };
    }

    case CART_ACTIONS.LOAD_CART: {
      return {
        ...state,
        items: action.payload.items || []
      };
    }

    case CART_ACTIONS.SET_LOADING: {
      return {
        ...state,
        loading: action.payload.loading
      };
    }

    default:
      return state;
  }
};

// État initial du panier
const initialState = {
  items: [],
  loading: false
};

// Création du contexte
const CartContext = createContext();

// Hook pour utiliser le contexte
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Provider du contexte
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Calculer les totaux (mémorisé pour éviter les recalculs inutiles)
  const calculateTotals = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;

    state.items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.sale_price) || 0;
      const discount = parseFloat(item.discount) || 0;

      const itemSubtotal = quantity * price;
      const itemDiscountAmount = (itemSubtotal * discount) / 100;

      subtotal += itemSubtotal;
      totalDiscount += itemDiscountAmount;
    });

    const totalAmount = subtotal - totalDiscount;

    return {
      subtotal,
      totalDiscount,
      totalAmount,
      itemsCount: state.items.length
    };
  }, [state.items]);

  // Vérifier les erreurs de stock (mémorisé)
  const getStockErrors = React.useMemo(() => {
    return state.items.filter(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.available_stock) || 0;
      return quantity > availableStock;
    });
  }, [state.items]);

  // Actions du panier
  const addItem = React.useCallback((product) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product }
    });
  }, []);

  const removeItem = React.useCallback((productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  }, []);

  const updateQuantity = React.useCallback((productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  }, []);

  const updatePrice = React.useCallback((productId, price) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_PRICE,
      payload: { productId, price }
    });
  }, []);

  const updateDiscount = React.useCallback((productId, discount) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_DISCOUNT,
      payload: { productId, discount }
    });
  }, []);

  const clearCart = React.useCallback(() => {
    dispatch({
      type: CART_ACTIONS.CLEAR_CART
    });
  }, []);

  const loadCart = React.useCallback((items) => {
    dispatch({
      type: CART_ACTIONS.LOAD_CART,
      payload: { items }
    });
  }, []);

  const setLoading = React.useCallback((loading) => {
    dispatch({
      type: CART_ACTIONS.SET_LOADING,
      payload: { loading }
    });
  }, []);

  // Fonctions utilitaires
  const getItemByProductId = React.useCallback((productId) => {
    return state.items.find(item => item.product_id === productId);
  }, [state.items]);

  const isProductInCart = React.useCallback((productId) => {
    return state.items.some(item => item.product_id === productId);
  }, [state.items]);

  const getTotalQuantity = React.useCallback(() => {
    return state.items.reduce((total, item) => total + (parseFloat(item.quantity) || 0), 0);
  }, [state.items]);

  const validateCart = React.useCallback(() => {
    const errors = [];
    
    state.items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.available_stock) || 0;
      const price = parseFloat(item.sale_price) || 0;

      if (quantity <= 0) {
        errors.push(`La quantité du produit ${item.name} doit être supérieure à 0`);
      }

      if (quantity > availableStock) {
        errors.push(`Stock insuffisant pour ${item.name}. Stock disponible: ${availableStock}`);
      }

      if (price <= 0) {
        errors.push(`Le prix du produit ${item.name} doit être supérieur à 0`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [state.items]);

  // Fonctions de gestion du stockage local
  const saveToLocalStorage = React.useCallback(() => {
    try {
      const cartData = {
        items: state.items,
        timestamp: Date.now()
      };
      localStorage.setItem('sales_cart', JSON.stringify(cartData));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }, [state.items]);

  const loadFromLocalStorage = React.useCallback(() => {
    try {
      const savedCart = localStorage.getItem('sales_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        
        // Vérifier si les données ne sont pas trop anciennes (1 heure)
        const isExpired = Date.now() - cartData.timestamp > 3600000;
        
        if (!isExpired && cartData.items) {
          loadCart(cartData.items);
        } else {
          // Nettoyer les données expirées
          localStorage.removeItem('sales_cart');
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
      localStorage.removeItem('sales_cart');
    }
  }, [loadCart]);

  // Sauvegarder automatiquement dans le localStorage
  useEffect(() => {
    saveToLocalStorage();
  }, [saveToLocalStorage]);

  // Charger depuis le localStorage au démarrage
  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Nettoyer le localStorage quand le composant est démonté
  useEffect(() => {
    return () => {
      // Optionnel: nettoyer le panier à la fermeture
      // localStorage.removeItem('sales_cart');
    };
  }, []);

  // Fonctions de batch pour optimiser les performances
  const batchUpdateItems = React.useCallback((updates) => {
    // Permet de faire plusieurs mises à jour en une seule fois
    updates.forEach(update => {
      switch (update.type) {
        case 'quantity':
          updateQuantity(update.productId, update.value);
          break;
        case 'price':
          updatePrice(update.productId, update.value);
          break;
        case 'discount':
          updateDiscount(update.productId, update.value);
          break;
        default:
          break;
      }
    });
  }, [updateQuantity, updatePrice, updateDiscount]);

  // Fonctions d'import/export pour la sauvegarde avancée
  const exportCart = React.useCallback(() => {
    return {
      items: state.items,
      totals: calculateTotals,
      timestamp: Date.now(),
      version: '1.0'
    };
  }, [state.items, calculateTotals]);

  const importCart = React.useCallback((cartData) => {
    if (cartData && cartData.items && Array.isArray(cartData.items)) {
      loadCart(cartData.items);
      return true;
    }
    return false;
  }, [loadCart]);

  // Valeur du contexte optimisée
  const value = React.useMemo(() => ({
    // État
    items: state.items,
    loading: state.loading,
    totals: calculateTotals,
    stockErrors: getStockErrors,
    
    // Actions de base
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscount,
    clearCart,
    loadCart,
    setLoading,
    
    // Fonctions utilitaires
    getItemByProductId,
    isProductInCart,
    getTotalQuantity,
    validateCart,
    
    // Fonctions avancées
    batchUpdateItems,
    exportCart,
    importCart,
    
    // Gestion du stockage
    saveToLocalStorage,
    loadFromLocalStorage
  }), [
    state.items,
    state.loading,
    calculateTotals,
    getStockErrors,
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscount,
    clearCart,
    loadCart,
    setLoading,
    getItemByProductId,
    isProductInCart,
    getTotalQuantity,
    validateCart,
    batchUpdateItems,
    exportCart,
    importCart,
    saveToLocalStorage,
    loadFromLocalStorage
  ]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};