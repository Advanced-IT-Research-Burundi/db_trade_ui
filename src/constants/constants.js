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


// Types de mouvement
  const MOUVEMENT_TYPES = {
    'EN': 'Entrée Normale',
    'ER': 'Entrée par Retour',
    'EI': 'Entrée par Inventaire',
    'EAJ': 'Entrée par Ajustement',
    'ET': 'Entrée par Transfert',
    'EAU': 'Entrée Autre',
    'SN': 'Sortie Normale',
    'SP': 'Sortie par Perte',
    'SV': 'Sortie par Vente',
    'SD': 'Sortie par Détérioration',
    'SC': 'Sortie par Consommation',
    'SAJ': 'Sortie par Ajustement',
    'ST': 'Sortie par Transfert',
    'SAU': 'Sortie Autre'
  };

  export default {CART_ACTIONS, MOUVEMENT_TYPES};