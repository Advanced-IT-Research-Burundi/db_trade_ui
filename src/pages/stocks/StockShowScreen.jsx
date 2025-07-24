import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';

const StockShowScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [recentProducts, setRecentProducts] = useState([]);
  const [proformas, setProformas] = useState([]);
  const [users, setUsers] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ show: false, type: null, id: null });
  const toast = useRef(null);

  const dispatch = useDispatch()
  const { data    } = useSelector((state) => ({
      data: state.apiData?.data?.STOCK_DETAILS,
    }))

  useEffect(() => {
    loadStockDetails();
  }, [id]);

  useEffect(() => {
    if (data) {
      setStock(data.stock);
      setRecentProducts(data.recent_products || []);
      setProformas(data.proformas || []);
      setUsers(data.users || []);
    }
  } , [data])

  const loadStockDetails = async () => {
    try {
      dispatch(fetchApiData({ url : `/api/stocks/${id}` , itemKey : "STOCK_DETAILS" }))
    } catch (error) {
      showToast('error', error.message);
      navigate('/stocks');
    } finally {
      setLoading(false)
    }
  };

  const handleDeleteStock = async () => {
    try {
      const response = await ApiService.delete(`/api/stocks/${id}`);
      if (response.success) {
        showToast('success', 'Stock supprimé avec succès');
        navigate('/stocks');
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, type: null, id: null });
  };

  const handleDeleteProforma = async (proformaId) => {
    try {
      const response = await ApiService.delete(`/api/proformas/${proformaId}`);
      if (response.success) {
        showToast('success', 'Proforma supprimé avec succès');
        loadStockDetails(); // Recharger les données
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, type: null, id: null });
  };

  const handleDetachUser = async (userId) => {
    try {
      const response = await ApiService.delete(`/api/stocks/${id}/users/${userId}`);
      if (response.success) {
        showToast('success', 'Utilisateur désassigné avec succès');
        loadStockDetails(); // Recharger les données
      } else {
        showToast('error', response.message || 'Erreur lors de la désassignation');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, type: null, id: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FCFA';
  };

  const getClientInfo = (clientData) => {
    try {
      const client = typeof clientData === 'string' ? JSON.parse(clientData) : clientData;
      return client || {};
    } catch {
      return {};
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/storage/${imagePath}`;
  };

  const getUserInitials = (user) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Stock non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="d-flex mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <a href="/dashboard" className="text-decoration-none">
              <i className="pi pi-home"></i> Accueil
            </a>
          </li>
          <li className="breadcrumb-item">
            <a href="/stocks" className="text-decoration-none">
              <i className="pi pi-box"></i> Stocks
            </a>
          </li>
          <li className="breadcrumb-item active">{stock.name}</li>
        </ol>
        <div className="ms-auto">
          <a href={`/stocks/${stock.id}/edit`} className="btn btn-warning">
            <i className="pi pi-pencil me-2"></i>Modifier
          </a>
        </div>
      </nav>

      <div className="row">
        {/* Informations principales */}
        <div className="col-lg-8">
          {/* Section des derniers produits ajoutés */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="pi pi-clock me-2"></i>Derniers produits ajoutés
              </h6>
              <a  onClick={() => navigate(`/add/product/${stock.id}`)} className="btn btn-outline-light btn-sm">
                <i className="pi pi-box me-1"></i>Voir tous les produits
              </a>
            </div>
            <div className="card-body">
              {recentProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Produit</th>
                        <th>Code</th>
                        <th>Quantité</th>
                        <th>Date d'ajout</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map((stockProduct) => (
                        <tr key={stockProduct.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {getImageUrl(stockProduct.product?.image) ? (
                                <img 
                                  src={getImageUrl(stockProduct.product.image)} 
                                  alt={stockProduct.product.name}
                                  className="rounded me-2"
                                  style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                />
                              ) : (
                                <div className="rounded bg-secondary me-2 d-flex align-items-center justify-content-center"
                                     style={{ width: '32px', height: '32px' }}>
                                  <i className="pi pi-box text-white"></i>
                                </div>
                              )}
                              <div>
                                <strong>{stockProduct.product?.name || 'N/A'}</strong>
                                <br />
                                <small className="text-muted">{stockProduct.product?.unit || 'N/A'}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {stockProduct.product?.code || 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className="badge bg-primary">
                              {Number(stockProduct.quantity).toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <small>
                              <i className="pi pi-calendar me-1"></i>
                              {formatDate(stockProduct.created_at)}
                              <br />
                              <i className="pi pi-clock me-1"></i>
                              {new Date(stockProduct.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </small>
                          </td>
                          <td>
                            <a 
                              onClick={() =>{ 
                                console.log(stockProduct.id);
                                navigate(`/stocks/movements/${stockProduct.id}`)}}
                              className="btn btn-outline-info btn-sm"
                              title="Voir les mouvements"
                            >
                              <i className="pi pi-arrows-h"></i> Mouvement
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="pi pi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-2">Aucun produit dans ce stock</p>
                  <a href={`/stocks/${stock.id}/products`} className="btn btn-primary">
                    <i className="pi pi-plus-circle me-2"></i>Ajouter des produits
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Informations du stock */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                <i className="pi pi-box me-2"></i>{stock.name}
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Informations générales</h6>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted">Nom:</label>
                    <p className="mb-1">{stock.name}</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted">Localisation:</label>
                    <p className="mb-1">
                      {stock.location ? (
                        <>
                          <i className="pi pi-map-marker text-primary me-1"></i>
                          {stock.location}
                        </>
                      ) : (
                        <span className="text-muted">Non spécifiée</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted">Description:</label>
                    <p className="mb-1">
                      {stock.description || <span className="text-muted">Aucune description</span>}
                    </p>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Assignations</h6>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted">Agence:</label>
                    <p className="mb-1">
                      {stock.agency ? (
                        <>
                          <i className="pi pi-building text-info me-1"></i>
                          <a href={`/agencies/${stock.agency.id}`} className="text-decoration-none">
                            {stock.agency.name}
                          </a>
                        </>
                      ) : (
                        <span className="text-muted">Non assigné</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted">Utilisateurs associés:</label>
                    <p className="mb-1">
                      {users.length > 0 ? (
                        <>
                          <i className="pi pi-users text-success me-1"></i>
                          <span className="badge bg-success">{users.length} utilisateur(s)</span>
                          <br />
                          <small className="text-muted">
                            {users.slice(0, 3).map((user, index) => (
                              <span key={index}>
                                {user.first_name} {user.last_name}
                                {index < Math.min(users.length, 3) - 1 ? ', ' : ''}
                              </span>
                            ))}
                            {users.length > 3 && ` et ${users.length - 3} autre(s)...`}
                          </small>
                        </>
                      ) : (
                        <span className="text-muted">Aucun utilisateur associé</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="fw-bold text-muted">Créé par:</label>
                    <p className="mb-1">
                      <i className="pi pi-user-check text-success me-1"></i>
                      {stock.created_by?.full_name || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informations système et Actions */}
        <div className="col-lg-4">
         
          {/* Proformas associés */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="pi pi-file-text me-2"></i>Proformas associés
                <span className="badge bg-light text-dark ms-2">{proformas.length}</span>
              </h6>
            </div>
            <div className="card-body">
            
              {proformas.length > 0 ? (
                <>
                  <div className="list-group list-group-flush">
                    {proformas.slice(0, 5).map((proforma) => {
                      const client = getClientInfo(proforma.client);
                      return (
                        <div key={proforma.id} className="list-group-item px-0 py-2 border-0 border-bottom">
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="flex-grow-1">
                              <div className="d-flex gap-4">
                                <h6 className="mb-1">
                                  <i className="pi pi-file-text text-primary me-1"></i>
                                  #PRO-{proforma.id.toString().padStart(6, '0')}
                                </h6>
                                <p className="mb-1 text-muted small">
                                  <i className="pi pi-user me-1"></i>
                                  {client.name || 'Client non spécifié'}
                                </p>
                              </div>
                              <div className="d-flex gap-4">
                                <div className="d-flex align-items-center">
                                  <span className="badge bg-success me-2">
                                    {formatCurrency(proforma.total_amount)}
                                  </span>
                                  {proforma.invoice_type && (
                                    <span className="badge bg-secondary">
                                      {proforma.invoice_type.charAt(0).toUpperCase() + proforma.invoice_type.slice(1)}
                                    </span>
                                  )}
                                </div>
                                <p className="mb-1 text-muted small">
                                  <i className="pi pi-calendar me-1"></i>
                                  {formatDate(proforma.sale_date)}
                                </p>
                              </div>
                            </div>
                            <div className="dropdown">
                              <button className="btn btn-sm btn-outline-secondary dropdown-toggle"
                                      type="button" data-bs-toggle="dropdown">
                                <i className="pi pi-ellipsis-v"></i>
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <a className="dropdown-item" href={`/proformas/${proforma.id}`}>
                                    <i className="pi pi-eye me-2"></i>Voir détails
                                  </a>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button 
                                    className="dropdown-item text-danger"
                                    onClick={() => setDeleteModal({ show: true, type: 'proforma', id: proforma.id })}
                                  >
                                    <i className="pi pi-trash me-2"></i>Supprimer
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                          {proforma.note && (
                            <small className="text-muted">
                              <i className="pi pi-comment me-1"></i>
                              {proforma.note.length > 50 ? proforma.note.substring(0, 50) + '...' : proforma.note}
                            </small>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {proformas.length > 5 && (
                    <div className="text-center mt-3">
                      <a href={`/proformas?stock_id=${stock.id}`} className="btn btn-sm btn-outline-info">
                        <i className="pi pi-arrow-right me-1"></i>
                        Voir tous les proformas ({proformas.length})
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="pi pi-file-text text-muted" style={{ fontSize: '2rem' }}></i>
                  <p className="text-muted mt-2 mb-0">Aucune proforma associée</p>
                  <a href={`/sales/create?stock_id=${stock.id}`} className="btn btn-sm btn-primary mt-2">
                    <i className="pi pi-plus-circle me-1"></i>Créer une proforma
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <h6 className="mb-0">
                <i className="pi pi-flash me-2"></i>Actions rapides
              </h6>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <a href={`/stocks/${stock.id}/products`} className="btn btn-outline-primary">
                  <i className="pi pi-box me-2"></i>Gérer les produits
                </a>
                
                <a href={`/stocks/${stock.id}/users/manage`} className="btn btn-outline-info">
                  <i className="pi pi-users me-2"></i>Gérer les utilisateurs
                </a>
                
                <a href={`/stocks/${stock.id}/edit`} className="btn btn-warning">
                  <i className="pi pi-pencil me-2"></i>Modifier ce stock
                </a>
                
                <a href="/stocks/create" className="btn btn-primary">
                  <i className="pi pi-plus-circle me-2"></i>Créer un nouveau stock
                </a>
                
                <hr />
                
                <button 
                  className="btn btn-danger w-100"
                  onClick={() => setDeleteModal({ show: true, type: 'stock', id: stock.id })}
                >
                  <i className="pi pi-trash me-2"></i>Supprimer ce stock
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section des utilisateurs associés */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            <i className="pi pi-users me-2"></i>Utilisateurs associés à ce stock
          </h6>
          <div className="btn-group">
            <span className="badge bg-light text-dark me-2">
              {users.length} utilisateur(s)
            </span>
            {users.length > 5 && (
              <a href={`/stocks/${stock.id}/users/manage`} className="btn btn-outline-light btn-sm">
                <i className="pi pi-users me-1"></i>Voir tous les utilisateurs
              </a>
            )}
          </div>
        </div>
        <div className="card-body">
          {users.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-sm table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Utilisateur</th>
                      <th>Rôle</th>
                      <th>Agence</th>
                      <th>Date d'assignation</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((user , index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            {getImageUrl(user.profile_photo) ? (
                              <img 
                                src={getImageUrl(user.profile_photo)} 
                                alt={`${user.first_name} ${user.last_name}`}
                                className="rounded-circle me-2"
                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="rounded-circle bg-primary me-2 d-flex align-items-center justify-content-center text-white"
                                   style={{ width: '32px', height: '32px' }}>
                                {getUserInitials(user)}
                              </div>
                            )}
                            <div>
                              <strong>{user.first_name} {user.last_name}</strong>
                              <br />
                              <small className="text-muted">{user.email}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary">
                            {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                          </span>
                        </td>
                        <td>
                          {user.agency ? (
                            <>
                              <i className="pi pi-map-marker text-warning me-1"></i>
                              {user.agency.name}
                            </>
                          ) : (
                            <span className="text-muted">Aucune agence</span>
                          )}
                        </td>
                        <td>
                          <small>
                            <i className="pi pi-calendar me-1"></i>
                            {formatDate(user.pivot?.created_at || user.created_at)}
                            <br />
                            <i className="pi pi-clock me-1"></i>
                            {new Date(user.pivot?.created_at || user.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group btn-group-sm">
                            <a href={`/users/${user.id}`} className="btn btn-outline-primary" title="Voir le profil">
                              <i className="pi pi-eye"></i>
                            </a>
                            <button 
                              className="btn btn-outline-danger"
                              title="Désassigner"
                              onClick={() => setDeleteModal({ show: true, type: 'user', id: user.id })}
                            >
                              <i className="pi pi-times-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {users.length > 10 && (
                <div className="text-center mt-3">
                  <p className="text-muted mb-2">
                    Affichage de 10 utilisateurs sur {users.length}
                  </p>
                  <a href="/users" className="btn btn-outline-info btn-sm">
                    <i className="pi pi-arrow-right me-1"></i>
                    Voir tous les {users.length} utilisateurs
                  </a>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <i className="pi pi-users display-4 text-muted"></i>
              <p className="text-muted mt-2">Aucun utilisateur associé à ce stock</p>
              <a href={`/stocks/${stock.id}/users/manage`} className="btn btn-primary">
                <i className="pi pi-user-plus me-2"></i>Assigner des utilisateurs
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Bouton retour */}
      <div className="row mt-4">
        <div className="col-12">
          <a href="/stocks" className="btn btn-secondary">
            <i className="pi pi-arrow-left me-2"></i>Retour à la liste des stocks
          </a>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className="pi pi-exclamation-triangle me-2"></i>Confirmer la suppression
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, type: null, id: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    {deleteModal.type === 'stock' && 'Êtes-vous sûr de vouloir supprimer ce stock ? Cette action est irréversible.'}
                    {deleteModal.type === 'proforma' && 'Êtes-vous sûr de vouloir supprimer cette proforma ?'}
                    {deleteModal.type === 'user' && 'Êtes-vous sûr de vouloir désassigner cet utilisateur ?'}
                  </p>
                  {deleteModal.type === 'stock' && (
                    <div className="alert alert-warning mt-3">
                      <i className="pi pi-info-circle me-2"></i>
                      <strong>Attention :</strong> La suppression du stock affectera tous les produits et données associées.
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, type: null, id: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => {
                      if (deleteModal.type === 'stock') handleDeleteStock();
                      else if (deleteModal.type === 'proforma') handleDeleteProforma(deleteModal.id);
                      else if (deleteModal.type === 'user') handleDetachUser(deleteModal.id);
                    }}
                  >
                    <i className="pi pi-trash me-1"></i>
                    {deleteModal.type === 'stock' && 'Supprimer'}
                    {deleteModal.type === 'proforma' && 'Supprimer'}
                    {deleteModal.type === 'user' && 'Désassigner'}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, type: null, id: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default StockShowScreen;