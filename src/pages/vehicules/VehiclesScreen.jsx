import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const VehicleScreen = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    brand: '',
    year: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, vehicleId: null, vehicleInfo: null });
  const toast = useRef(null);
   const navigate = useNavigate();
  
  
      const dispatch = useDispatch();
      const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
        if (data?.vehicules) {
           setVehicles(data?.vehicules?.vehicules?.data || []);
            setPagination({
              current_page: data?.vehicules?.vehicules?.current_page,
              last_page: data?.vehicules?.vehicules?.last_page,
              total: data?.vehicules?.vehicules?.total,
              from: data?.vehicules?.vehicules?.from,
              to: data?.vehicules?.vehicules?.to
            });
        }
      }, [data]);

  async function loadVehicles(page = 1) {
        try {
          const params = { page, ...filters };
          dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.VEHICLES, itemKey: 'vehicules', params }));
         
        } catch (error) {
          showToast('error', error.message);
        } 
      };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadVehicles(1);
  };

  const handleReset = () => {
    setFilters({ search: '', status: '', brand: '', year: '' });
    setTimeout(() => loadVehicles(1), 0);
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await ApiService.delete(`/api/vehicules/${vehicleId}`);
      if (response.success) {
        showToast('success', 'Véhicule supprimé avec succès');
        loadVehicles(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null });
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      'disponible': { class: 'bg-success', icon: 'check-circle', text: 'Disponible' },
      'en_location': { class: 'bg-warning text-dark', icon: 'clock', text: 'En location' },
      'en_reparation': { class: 'bg-danger', icon: 'wrench', text: 'En réparation' }
    };
    
    const config = statusConfig[status] || statusConfig['disponible'];
    return (
      <span className={`badge ${config.class}`}>
        <i className={`pi pi-${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const openDeleteModal = (vehicle) => {
    setDeleteModal({
      show: true,
      vehicleId: vehicle.id,
      vehicleInfo: `${vehicle.brand} ${vehicle.model} (${vehicle.immatriculation})`
    });
  };

  const Pagination = () => {
    if (pagination.last_page <= 1) return null;

    const getVisiblePages = () => {
      const current = pagination.current_page;
      const last = pagination.last_page;
      const pages = [];

      if (last <= 7) {
        return Array.from({ length: last }, (_, i) => i + 1);
      }

      pages.push(1);
      if (current > 4) pages.push('...');
      
      const start = Math.max(2, current - 1);
      const end = Math.min(last - 1, current + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (current < last - 3) pages.push('...');
      pages.push(last);
      
      return pages;
    };

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadVehicles(pagination.current_page - 1)} 
              disabled={pagination.current_page === 1}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>
          
          {getVisiblePages().map((page, index) => (
            <li key={index} className={`page-item ${page === pagination.current_page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button className="page-link" onClick={() => loadVehicles(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadVehicles(pagination.current_page + 1)} 
              disabled={pagination.current_page === pagination.last_page}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-car me-2"></i>Gestion des Véhicules
              </h2>
              <p className="text-muted mb-0">{pagination.total} véhicule(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadVehicles(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <a href="#" onClick={() => navigate('/vehicles/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouveau Véhicule
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>Filtres de recherche
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Recherche</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Marque, modèle, immatriculation..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Statut</label>
              <select 
                className="form-select" 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tous</option>
                <option value="disponible">Disponible</option>
                <option value="en_location">En location</option>
                <option value="en_reparation">En réparation</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Marque</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Peugeot, Renault..."
                value={filters.brand} 
                onChange={(e) => handleFilterChange('brand', e.target.value)} 
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Année</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="2020"
                value={filters.year} 
                onChange={(e) => handleFilterChange('year', e.target.value)} 
              />
            </div>
            
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>Rechercher
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Véhicules
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">#</th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-car me-1"></i>Véhicule
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-calendar me-1"></i>Année
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-id-card me-1"></i>Immatriculation
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-weight me-1"></i>Poids Maximal
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-circle-fill me-1"></i>Statut
                  </th>
                  <th className="border-0 px-4 py-3">Créé le</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                { vehicles.length === 0 && loading  ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.vehicles == undefined && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucun véhicule trouvé</h5>
                        <p className="mb-0">Essayez de modifier vos critères de recherche ou créez un nouveau véhicule</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="px-4">
                        <span className="fw-medium">{vehicle.id}</span>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-car text-primary"></i>
                          </div>
                          <div>
                            <strong className="text-primary">{vehicle.brand}</strong>
                            <br />
                            <small className="text-muted">{vehicle.model}</small>
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        <span className="badge bg-light text-dark">{vehicle.year}</span>
                      </td>
                      <td className="px-4">
                        <code className="text-primary bg-light px-2 py-1 rounded">
                          {vehicle.immatriculation}
                        </code>
                      </td>
                      <td className="px-4">{vehicle.poids}</td>
                      <td className="px-4">{getStatusBadge(vehicle.status)}</td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(vehicle.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(vehicle.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                           <a 
                           onClick={()=>{navigate(`/vehicles/${vehicle.id}/expenses`);}}
                            className="btn btn-sm btn-outline-info" 
                            title="Depenses"
                          >
                          <span className='me-1'>Depenses</span>
                            <i className="pi pi-chart-line"></i>
                          </a> 
                          <a 
                            onClick={()=>{navigate(`/vehicles/${vehicle.id}/edit`);}}
                            className="btn btn-sm btn-outline-warning" 
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title="Supprimer"
                            onClick={() => openDeleteModal(vehicle)}
                          >
                            <i className="pi pi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className="card-footer bg-transparent border-0">
            <div className="d-flex justify-content-between align-items-center">
              <div className="text-muted small">
                Affichage de {pagination.from} à {pagination.to} sur {pagination.total} résultats
              </div>
              <Pagination />
            </div>
          </div>
        )}
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
                    onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer le véhicule :</p>
                  <div className="alert alert-light border">
                    <strong>{deleteModal.vehicleInfo}</strong>
                  </div>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>Attention :</strong> Cette action est irréversible et pourrait affecter les locations associées.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteVehicle(deleteModal.vehicleId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default VehicleScreen;