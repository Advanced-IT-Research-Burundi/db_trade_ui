import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Actions du panier
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  UPDATE_PRICE: 'UPDATE_PRICE',
  UPDATE_DISCOUNT: 'UPDATE_DISCOUNT',
  CLEAR_CART: 'CLEAR_CART',
  LOAD_CART: 'LOAD_CART'
};

// Reducer du panier
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { product } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.product_id === product.id);
      
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex].quantity += 1;
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

    default:
      return state;
  }
};

// État initial du panier
const initialState = {
  items: []
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

  // Calculer les totaux
  const calculateTotals = () => {
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
  };

  // Vérifier les erreurs de stock
  const getStockErrors = () => {
    return state.items.filter(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const availableStock = parseFloat(item.available_stock) || 0;
      return quantity > availableStock;
    });
  };

  // Actions du panier
  const addItem = (product) => {
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { product }
    });
  };

  const removeItem = (productId) => {
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { productId }
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { productId, quantity }
    });
  };

  const updatePrice = (productId, price) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_PRICE,
      payload: { productId, price }
    });
  };

  const updateDiscount = (productId, discount) => {
    dispatch({
      type: CART_ACTIONS.UPDATE_DISCOUNT,
      payload: { productId, discount }
    });
  };

  const clearCart = () => {
    dispatch({
      type: CART_ACTIONS.CLEAR_CART
    });
  };

  const loadCart = (items) => {
    dispatch({
      type: CART_ACTIONS.LOAD_CART,
      payload: { items }
    });
  };

  // Sauvegarder le panier dans le localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state.items));
  }, [state.items]);

  // Charger le panier depuis le localStorage au démarrage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        loadCart(items);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    }
  }, []);

  const value = {
    items: state.items,
    totals: calculateTotals(),
    stockErrors: getStockErrors(),
    addItem,
    removeItem,
    updateQuantity,
    updatePrice,
    updateDiscount,
    clearCart,
    loadCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};