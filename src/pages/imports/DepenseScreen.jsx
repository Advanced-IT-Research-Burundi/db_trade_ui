import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom'
import { fetchApiData } from '../../stores/slicer/apiDataSlicer';
import { API_CONFIG, APP_CONSTANT } from '../../services/config';
import ImportHeader from './ImportHeader';
import ApiService from '../../services/api.js';

function DepenseScreen() {
    const { id } = useParams();
    const dispatch = useDispatch()
    const { data } = useSelector((state) => ({
        data : state.apiData.data
    }))

    useEffect(() => {
        loadIntiData()
    }, [])

    async function loadIntiData() {
        dispatch(await fetchApiData({
            url: API_CONFIG.ENDPOINTS.TYPES_DEPENSES_IMPORTATION, 
            itemKey: "depensesTypes"
        }))
        dispatch(await fetchApiData({
           url: `${API_CONFIG.ENDPOINTS.COMMANDES}/${id}`,
           itemKey: 'commande',
        }))
    }

    useEffect(() => {
        loadDepenses();
    }, [])

    async function loadDepenses() {
        dispatch(await fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.DEPENSES_IMPORTATION}/${id}`,
           itemKey: 'depensesImportation',
        }))
    }

    const [form, setform] = useState({
        depense_importation_type_id: 0,
        currency: "",
        exchange_rate: 0,
        amount: 0,
        amount_currency: 0,
        date: "",
        description: ""
    })

    const [loading, setLoading] = useState(false);
    const currencies = APP_CONSTANT.APP_CURRENCIES;

    // Gestion des changements dans le formulaire
    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        setform(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || "" : value
        }));
    }

    // Calcul automatique du montant en devise locale
    useEffect(() => {
        if (form.amount && form.exchange_rate) {
            setform(prev => ({
                ...prev,
                amount_currency: prev.amount * prev.exchange_rate
            }));
        }
    }, [form.amount, form.exchange_rate]);

    // Soumission du formulaire
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            // Ajouter l'ID de la commande au formulaire
            const formData = {
                ...form,
                commande_id: id
            };

            ApiService.post(API_CONFIG.ENDPOINTS.DEPENSES_IMPORTATION_MODEL, formData)

            // Recharger les dépenses après ajout
            await loadDepenses();

            // Reset du formulaire
            setform({
                depense_importation_type_id: 0,
                currency: "",
                exchange_rate: 0,
                amount: 0,
                amount_currency: 0,
                date: "",
                description: ""
            });

            alert('Dépense ajoutée avec succès!');
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
            alert('Erreur lors de l\'ajout de la dépense');
        } finally {
            setLoading(false);
        }
    }

    // Supprimer une dépense
    const handleDelete = async (depenseId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense?')) {
            try {
                dispatch(await fetchApiData({
                    url: `${API_CONFIG.ENDPOINTS.DEPENSES_IMPORTATION}/${depenseId}`,
                    method: 'DELETE',
                    itemKey: 'deletedDepense',
                }));
                
                await loadDepenses();
                alert('Dépense supprimée avec succès!');
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression');
            }
        }
    }

    return (
        <div className="container-fluid">
            <ImportHeader />
            
            {/* Informations de la commande */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Informations de la Commande</h5>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-2">
                            <strong>Matricule:</strong><br/>
                            {data?.commande?.matricule}
                        </div>
                        <div className="col-md-2">
                            <strong>Poids:</strong><br/>
                            {data?.commande?.poids} kg
                        </div>
                        <div className="col-md-2">
                            <strong>Status:</strong><br/>
                            <span className={`badge ${data?.commande?.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                {data?.commande?.status}
                            </span>
                        </div>
                        <div className="col-md-3">
                            <strong>Date création:</strong><br/>
                            {data?.commande?.created_at ? new Date(data?.commande?.created_at).toLocaleDateString() : ''}
                        </div>
                        <div className="col-md-3">
                            <strong>Commentaire:</strong><br/>
                            {data?.commande?.commentaire}
                        </div>
                    </div>
                </div>
            </div>

            {/* Formulaire d'ajout de dépense */}
            <div className="card mb-4">
                <div className="card-header">
                    <h5 className="mb-0">Ajouter une Dépense</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Type de dépense *</label>
                                <select 
                                    className="form-select" 
                                    name="depense_importation_type_id"
                                    value={form.depense_importation_type_id}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Sélectionner un type</option>
                                    {data?.depensesTypes && data?.depensesTypes.map((item) =>
                                        <option value={item.id} key={item.id}>{item.name}</option>    
                                    )}
                                </select>
                            </div>
                            
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Currency *</label>
                                <select 
                                    className="form-select"
                                    name="currency"
                                    value={form.currency}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Sélectionner une devise</option>
                                    {currencies.map((item) =>
                                        <option value={item} key={item}>{item}</option>    
                                    )}
                                </select>
                            </div>
                            
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Date *</label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    name="date"
                                    value={form.date}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Montant *</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="form-control"
                                    name="amount"
                                    value={form.amount}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                            
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Taux d'échange</label>
                                <input 
                                    type="number" 
                                    step="0.0001"
                                    className="form-control"
                                    name="exchange_rate"
                                    value={form.exchange_rate}
                                    onChange={handleInputChange}
                                    placeholder="1.0000"
                                />
                            </div>
                            
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Montant converti</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="form-control"
                                    name="amount_currency"
                                    value={form.amount_currency.toFixed(2)}
                                    readOnly
                                    style={{backgroundColor: '#f8f9fa'}}
                                />
                            </div>
                            
                            <div className="col-md-3 mb-3">
                                <label className="form-label">Description</label>
                                <textarea 
                                    className="form-control"
                                    name="description"
                                    value={form.description}
                                    onChange={handleInputChange}
                                    rows="1"
                                    placeholder="Description optionnelle"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    Ajout en cours...
                                </>
                            ) : (
                                'Ajouter la Dépense'
                            )}
                        </button>
                    </form>
                </div>
            </div>

            {/* Liste des dépenses */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">Liste des Dépenses</h5>
                </div>
                <div className="card-body">
                    {data?.depensesImportation && data.depensesImportation.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-striped table-hover">
                                <thead className="table-dark">
                                    <tr>
                                        <th>Type</th>
                                        <th>Date</th>
                                        <th>Devise</th>
                                        <th>Montant</th>
                                        <th>Taux</th>
                                        <th>Montant Converti</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.depensesImportation.map((depense, index) => (
                                        <tr key={depense.id || index}>
                                            <td>
                                                {data?.depensesTypes?.find(type => 
                                                    type.id === depense.depense_importation_type_id
                                                )?.name || 'N/A'}
                                            </td>
                                            <td>{depense.date ? new Date(depense.date).toLocaleDateString() : ''}</td>
                                            <td>
                                                <span className="badge bg-secondary">{depense.currency}</span>
                                            </td>
                                            <td className="text-end">
                                                {depense.amount ? parseFloat(depense.amount).toFixed(2) : '0.00'}
                                            </td>
                                            <td className="text-end">
                                                {depense.exchange_rate ? parseFloat(depense.exchange_rate).toFixed(4) : '1.0000'}
                                            </td>
                                            <td className="text-end fw-bold">
                                                {depense.amount_currency ? parseFloat(depense.amount_currency).toFixed(2) : '0.00'}
                                            </td>
                                            <td>
                                                <small>{depense.description || '-'}</small>
                                            </td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleDelete(depense.id)}
                                                    title="Supprimer"
                                                >
                                                    <i className="fas fa-trash"></i> Suppr.
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="table-light">
                                    <tr>
                                        <th colSpan="5" className="text-end">Total:</th>
                                        <th className="text-end">
                                            {data.depensesImportation
                                                .reduce((total, depense) => 
                                                    total + (parseFloat(depense.amount_currency) || 0), 0
                                                ).toFixed(2)
                                            }
                                        </th>
                                        <th colSpan="2"></th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4 text-muted">
                            <i className="fas fa-inbox fa-3x mb-3"></i>
                            <p>Aucune dépense enregistrée pour cette commande</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DepenseScreen