import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const VehicleScreen = () => {
  const intl = useIntl();
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
        showToast('success', intl.formatMessage({id: "vehicle.vehicleDeleted"}));
        loadVehicles(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "vehicle.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "vehicle.error"}) : intl.formatMessage({id: "vehicle.success"}), 
      detail, 
      life: 3000 
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const getStatusBadge = (status) => {
    const statusConfig = {
      'disponible': { class: 'bg-success', icon: 'check-circle', text: intl.formatMessage({id: "vehicle.available"}) },
      'en_location': { class: 'bg-warning text-dark', icon: 'clock', text: intl.formatMessage({id: "vehicle.inRental"}) },
      'en_reparation': { class: 'bg-danger', icon: 'wrench', text: intl.formatMessage({id: "vehicle.inRepair"}) }
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
                <i className="pi pi-car me-2"></i>{intl.formatMessage({id: "vehicle.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "vehicle.totalVehicles"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadVehicles(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "vehicle.refreshing"}) : intl.formatMessage({id: "vehicle.refresh"})}
              </button>
              <a href="#" onClick={() => navigate('/vehicles/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "vehicle.newVehicle"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "vehicle.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "vehicle.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "vehicle.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "vehicle.status"})}</label>
              <select 
                className="form-select" 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "vehicle.all"})}</option>
                <option value="disponible">{intl.formatMessage({id: "vehicle.available"})}</option>
                <option value="en_location">{intl.formatMessage({id: "vehicle.inRental"})}</option>
                <option value="en_reparation">{intl.formatMessage({id: "vehicle.inRepair"})}</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "vehicle.brand"})}</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder={intl.formatMessage({id: "vehicle.brandPlaceholder"})}
                value={filters.brand} 
                onChange={(e) => handleFilterChange('brand', e.target.value)} 
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "vehicle.year"})}</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder={intl.formatMessage({id: "vehicle.yearPlaceholder"})}
                value={filters.year} 
                onChange={(e) => handleFilterChange('year', e.target.value)} 
              />
            </div>
            
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "vehicle.searchBtn"})}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>{intl.formatMessage({id: "vehicle.reset"})}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "vehicle.vehiclesList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">#</th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-car me-1"></i>{intl.formatMessage({id: "vehicle.vehicle"})}
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-calendar me-1"></i>{intl.formatMessage({id: "vehicle.year"})}
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-id-card me-1"></i>{intl.formatMessage({id: "vehicle.registration"})}
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-weight me-1"></i>{intl.formatMessage({id: "vehicle.maxWeight"})}
                  </th>
                  <th className="border-0 px-4 py-3">
                    <i className="pi pi-circle-fill me-1"></i>{intl.formatMessage({id: "vehicle.status"})}
                  </th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "vehicle.createdOn"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "vehicle.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                { vehicles.length === 0 && loading  ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "vehicle.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.vehicles == undefined && vehicles.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "vehicle.noVehiclesFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "vehicle.tryModifyingCriteria"})}</p>
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
                            title={intl.formatMessage({id: "vehicle.expenses"})}
                          >
                          <span className='me-1'>{intl.formatMessage({id: "vehicle.expenses"})}</span>
                            <i className="pi pi-chart-line"></i>
                          </a> 
                          <a 
                            onClick={()=>{navigate(`/vehicles/${vehicle.id}/edit`);}}
                            className="btn btn-sm btn-outline-warning" 
                            title={intl.formatMessage({id: "vehicle.edit"})}
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title={intl.formatMessage({id: "vehicle.delete"})}
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
                {intl.formatMessage({id: "vehicle.showing"})} {pagination.from} {intl.formatMessage({id: "vehicle.to"})} {pagination.to} {intl.formatMessage({id: "vehicle.on"})} {pagination.total} {intl.formatMessage({id: "vehicle.results"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "vehicle.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "vehicle.deleteMessage"})}</p>
                  <div className="alert alert-light border">
                    <strong>{deleteModal.vehicleInfo}</strong>
                  </div>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "vehicle.deleteWarning"})}</strong> {intl.formatMessage({id: "vehicle.deleteWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, vehicleId: null, vehicleInfo: null })}
                  >
                    {intl.formatMessage({id: "vehicle.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteVehicle(deleteModal.vehicleId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "vehicle.delete"})}
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