import React, { useState, useEffect } from 'react';
import ImportHeader from './ImportHeader';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { API_CONFIG } from '../../services/config.js';

const CommandesScreen = () => {
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [productSearchTerm, setProductSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [totalWeight, setTotalWeight] = useState(0);
    const [errorMessage, setErrorMessage] = useState("");

    const { data, loading, error } = useSelector(state => state.apiData);
    const dispatch = useDispatch();

    useEffect(() => {
        loadVehicules();
    }, []);

    useEffect(() => {
        if (productSearchTerm.trim()) {
            loadProducts();
        } else {
            setProducts([]);
        }
    }, [productSearchTerm]);

    // Nouveau useEffect pour mettre à jour les produits quand les données arrivent du store
    // Filtrer pour exclure les produits déjà dans le panier
    useEffect(() => {
        if (data?.productCompanyNames?.data) {
            const cartProductIds = cart.map(item => item.id);
            const filteredProducts = data.productCompanyNames.data.filter(
                product => !cartProductIds.includes(product.id)
            );
            setProducts(filteredProducts);
        }
    }, [data?.productCompanyNames, cart]);

    useEffect(() => {
        const weight = cart.reduce((sum, item) => sum + (item.weight_kg * item.quantity), 0);
        setTotalWeight(weight);
        setErrorMessage(
            selectedVehicle && weight > selectedVehicle.poids
                ? `Attention: Le poids total (${weight}kg) dépasse la capacité du véhicule (${selectedVehicle.poids}kg)`
                : ""
        );
    }, [cart, selectedVehicle]);

    // Fonction corrigée - on retire le setProducts d'ici
    function loadProducts() {
        dispatch(fetchApiData({
            url: API_CONFIG.ENDPOINTS.PRODUCTSCOMPANY,
            itemKey: 'productCompanyNames',
            params: { page: 1, per_page: 15, search: productSearchTerm }
        }));
    };

    const loadVehicules = async () => {
        await dispatch(fetchApiData({
            url: API_CONFIG.ENDPOINTS.VEHICLES,
            itemKey: 'vehicles',
            params: { page: 1, per_page: 100 }
        }));
        const availableVehicles = (data?.vehicles?.vehicules?.data || []).filter(v => v.status === 'disponible' && v.poids);
        setVehicles(availableVehicles);
    };

    const addToCart = (product) => {
        setCart(prev => {
            const exists = prev.find(p => p.id === product.id);
            return exists
                ? prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)
                : [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(p => p.id !== id));

    const updateQuantity = (id, qty) => {
       
        setCart(prev => prev.map(p => p.id === id ? { ...p, quantity: qty ?? 0 } : p));
    };
    const updatePu = (id, pu) => {
      
        setCart(prev => prev.map(p => p.id === id ? { ...p, pu: pu ?? 0 } : p));
    };

    const confirmOrder = () => {
        if (!selectedVehicle) return setErrorMessage("Veuillez sélectionner un véhicule");
        if (totalWeight > selectedVehicle.poids) return setErrorMessage(`La commande dépasse la capacité du véhicule (${selectedVehicle.poids}kg)`);
        if (!cart.length) return setErrorMessage("Veuillez ajouter des produits à la commande");

        alert("Commande confirmée avec succès !");
        setCart([]); setTotalWeight(0); setErrorMessage("");
    };

    return (
        <div className="container-fluid p-4">
            <ImportHeader />
            <h1 className="mb-4">Préparation de commande</h1>

            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            {/* Sélection véhicule */}
            <div className="card mb-4">
                <div className="row">
                    <div className="col-md-4">
                        <div className="card-header bg-primary text-white"><h5>1. Sélection du véhicule</h5></div>
                        <div className="card-body">
                            { vehicles.length === 0 ? <div className="alert alert-warning">Aucun véhicule disponible</div>
                                : (
                                    <>
                                        <select className="form-select mb-3" value={selectedVehicle?.id || ""} onChange={(e) => setSelectedVehicle(vehicles.find(v => v.id === parseInt(e.target.value)))}>
                                            <option value="">Sélectionnez un véhicule</option>
                                            {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.immatriculation} ({v.poids}kg)</option>)}
                                        </select>
                                        {selectedVehicle && (
                                            <div className="alert alert-info">
                                                <strong>{selectedVehicle.brand} {selectedVehicle.model}</strong> - {selectedVehicle.immatriculation} ({selectedVehicle.poids} kg)
                                            </div>
                                        )}
                                    </>
                                )
                            }
                        </div>
                    </div>
                    <div className="col-md-8">
                       {/* Recherche produits */}
            <div className="card mb-1">
                <div className="card-header bg-primary text-white"><h5>2. Recherche de produits</h5></div>
                <div className="card-body">
                    <div className="input-group mb-3">
                        <input className="form-control" type="text" value={productSearchTerm} onChange={(e) => setProductSearchTerm(e.target.value)} placeholder="Rechercher un produit..." />
                        <button className="btn btn-outline-secondary" type="button"><i className="bi bi-search"></i></button>
                    </div>
                    
                    {/* Affichage du loading pendant la recherche */}
                    {loading && productSearchTerm.trim() && (
                        <div className="alert alert-info">
                            <i className="bi bi-hourglass-split me-2"></i>Recherche en cours...
                        </div>
                    )}
                    
                    {!loading && products.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-bordered table-hover table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Nom</th>
                                            <th>Code</th>
                                            <th>Poids (kg)</th>
                                            <th>PU</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map(product => (
                                            <tr key={product.id}>
                                                <td>{product.item_name}</td>
                                                <td>{product.product_code}</td>
                                                <td>{product.weight_kg}</td>
                                                <td>{ product.pu}</td>
                                                <td>
                                                    <button className="btn btn-sm btn-primary" onClick={() => addToCart(product)}>
                                                        <i className="bi bi-cart-plus me-1"></i>Ajouter
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : !loading && productSearchTerm && products.length === 0 ? (
                            <div className="alert alert-warning">Aucun produit trouvé</div>
                        ) : !productSearchTerm ? (
                            <div className="alert alert-info">Entrez un terme de recherche</div>
                        ) : null
                    }
                </div>
            </div> 
                    </div>
                </div>
            </div>

            

            {/* Panier */}
            <div className="card mb-4">
                <div className="card-header bg-primary text-white"><h5>3. Panier</h5></div>
                <div className="card-body">
                    {cart.length === 0 ? <div className="alert alert-info">Votre panier est vide</div>
                        : (
                            <>
                                <div className="alert alert-secondary mb-3">
                                    <strong>Poids total: {totalWeight} kg</strong>
                                    {selectedVehicle && <span className={`ms-2 ${totalWeight > selectedVehicle.poids ? 'text-danger' : 'text-success'}`}>(Reste: {selectedVehicle.poids - totalWeight} kg)</span>}
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-striped table-hover table-sm">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Produit</th>
                                                <th>Code</th>
                                                <th>Poids</th>
                                                <th>Quantité</th>
                                                <th>Total</th>
                                                <th>PU</th>
                                                <th>Montan Total</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map(item => (
                                                <tr key={item.id}>
                                                    <td>{item.item_name}</td>
                                                    <td>{item.product_code}</td>
                                                    <td>{item.weight_kg} kg</td>
                                                    <td><input type="number" className="form-control form-control-sm" value={item.quantity} min="1" onChange={(e) => updateQuantity(item.id, e.target.value)} style={{ width: '70px' }} step="0.01" /></td>
                                                    <td>{(item.weight_kg * item.quantity).toFixed(2)} kg</td>
                                                    <td>

                                                        <input type="number" className="form-control form-control-sm" value={item.pu} onChange={(e) => updatePu(item.id, e.target.value)} style={{ width: '70px' }} step="0.01" />

                                                    </td>
                                                    <td>{(item.pu * item.quantity).toFixed(2)}</td>
                                                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item.id)}><i className="bi bi-trash"></i></button></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )
                    }
                </div>
            </div>

            <div className="d-flex justify-content-end">
                <button className="btn btn-success btn-lg" onClick={confirmOrder} disabled={!selectedVehicle || !cart.length || totalWeight > selectedVehicle.poids}>
                    <i className="bi bi-check-circle me-2"></i>Confirmer la commande
                </button>
            </div>
        </div>
    );
};

export default CommandesScreen;