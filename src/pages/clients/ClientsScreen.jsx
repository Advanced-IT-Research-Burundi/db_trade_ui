import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const ClientScreen = () => {
  const intl = useIntl();
  const [clients, setClients] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [creators, setCreators] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    patient_type: '',
    agency_id: '',
    created_by: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, clientId: null });
  const toast = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
        if (data.clients) {
           setClients(data.clients.clients.data || []);
           setAgencies(data.clients.agencies || [])
           setCreators(data.clients.creators || [])

        setPagination({
          current_page: data.clients.clients.current_page,
          last_page: data.clients.clients.last_page,
          total: data.clients.clients.total,
          from: data.clients.clients.from,
          to: data.clients.clients.to
        });
        }
      }, [data]);

   async function loadClients(page = 1) {
        try {
          const params = { page, ...filters };
          dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.CLIENTS, itemKey: 'clients', params }));
         
        } catch (error) {
          showToast('error', error.message);
        } 
      };

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadClients(1);
  };

  const handleReset = () => {
    setFilters({ search: '', patient_type: '', agency_id: '', created_by: '' });
    setTimeout(() => loadClients(1), 0);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      const response = await ApiService.delete(`/api/clients/${clientId}`);
      if (response.success) {
        showToast('success', intl.formatMessage({id: "client.clientDeleted"}));
        loadClients(pagination.current_page);
      } else {
        showToast('error', response.message || intl.formatMessage({id: "client.deleteError"}));
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, clientId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "client.error"}) : intl.formatMessage({id: "client.success"}), 
      detail, 
      life: 3000 
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('fr-FR');

  const getClientTypeBadge = (type) => {
    if (type === 'physique') {
      return (
        <span className="badge bg-success">
          <i className="pi pi-user me-1"></i>{intl.formatMessage({id: "client.individual"})}
        </span>
      );
    }
    return (
      <span className="badge bg-info">
        <i className="pi pi-building me-1"></i>{intl.formatMessage({id: "client.legal"})}
      </span>
    );
  };

  const getFullName = (client) => {
    const parts = [client.first_name, client.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '';
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
              onClick={() => loadClients(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadClients(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadClients(pagination.current_page + 1)} 
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
                <i className="pi pi-users me-2"></i>{intl.formatMessage({id: "client.title"})}
              </h2>
              <p className="text-muted mb-0">{pagination.total} {intl.formatMessage({id: "client.totalClients"})}</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadClients(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "client.refreshing"}) : intl.formatMessage({id: "client.refresh"})}
              </button>
              <a onClick={()=>navigate('/clients/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>{intl.formatMessage({id: "client.newClient"})}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "client.searchFilters"})}
          </h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSearch} className="row g-3">
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "client.search"})}</label>
              <div className="input-group">
                <span className="input-group-text">
                  <i className="pi pi-search"></i>
                </span>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder={intl.formatMessage({id: "client.searchPlaceholder"})}
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "client.type"})}</label>
              <select 
                className="form-select" 
                value={filters.patient_type} 
                onChange={(e) => handleFilterChange('patient_type', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "client.all"})}</option>
                <option value="physique">{intl.formatMessage({id: "client.individualPerson"})}</option>
                <option value="morale">{intl.formatMessage({id: "client.legalEntity"})}</option>
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "client.agency"})}</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "client.all"})}</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "client.createdBy"})}</label>
              <select 
                className="form-select" 
                value={filters.created_by} 
                onChange={(e) => handleFilterChange('created_by', e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "client.all"})}</option>
                {creators.map(creator => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "client.searchBtn"})}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh me-1"></i>{intl.formatMessage({id: "client.reset"})}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Clients Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>{intl.formatMessage({id: "client.clientsList"})}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.client"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.type"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.contact"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.companyNIF"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.agency"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.createdBy"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.createdOn"})}</th>
                  <th className="border-0 px-4 py-3">{intl.formatMessage({id: "client.actions"})}</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 && loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">{intl.formatMessage({id: "client.loading"})}</span>
                      </div>
                    </td>
                  </tr>
                ) : data.clients == undefined && clients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>{intl.formatMessage({id: "client.noClientsFound"})}</h5>
                        <p className="mb-0">{intl.formatMessage({id: "client.tryModifyingCriteria"})}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id}>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 p-2 rounded me-3">
                            <i className="pi pi-user text-primary"></i>
                          </div>
                          <div>
                            <strong className="text-primary">{client.name}</strong>
                            {getFullName(client) && (
                              <>
                                <br />
                                <small className="text-muted">{getFullName(client)}</small>
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4">
                        {getClientTypeBadge(client.patient_type)}
                      </td>
                      <td className="px-4">
                        <div>
                          {client.email && (
                            <div className="mb-1">
                              <i className="pi pi-envelope text-muted me-1"></i>
                              <small>{client.email}</small>
                            </div>
                          )}
                          {client.phone && (
                            <div>
                              <i className="pi pi-phone text-muted me-1"></i>
                              <small>{client.phone}</small>
                            </div>
                          )}
                          {!client.email && !client.phone && (
                            <span className="text-muted">{intl.formatMessage({id: "client.notProvided"})}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          {client.societe && (
                            <div className="mb-1">
                              <i className="pi pi-building text-muted me-1"></i>
                              <small>{client.societe}</small>
                            </div>
                          )}
                          {client.nif && (
                            <div>
                              <i className="pi pi-id-card text-muted me-1"></i>
                              <small>{client.nif}</small>
                            </div>
                          )}
                          {!client.societe && !client.nif && (
                            <span className="text-muted">-</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        {client.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {client.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">{intl.formatMessage({id: "client.notAssigned"})}</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-user-check text-success me-2"></i>
                          {client.created_by?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(client.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(client.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a
                            onClick={() => navigate(`/clients/${client.id}/edit`)}
                            className="btn btn-sm btn-outline-warning"
                            title={intl.formatMessage({id: "client.edit"})}
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-danger" 
                            title={intl.formatMessage({id: "client.delete"})}
                            onClick={() => setDeleteModal({ show: true, clientId: client.id })}
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
                {intl.formatMessage({id: "client.showing"})} {pagination.from} {intl.formatMessage({id: "client.to"})} {pagination.to} {intl.formatMessage({id: "client.on"})} {pagination.total} {intl.formatMessage({id: "client.results"})}
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
                    <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "client.confirmDelete"})}
                  </h5>
                  <button 
                    type="button" 
                    className="btn-close btn-close-white"
                    onClick={() => setDeleteModal({ show: false, clientId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>{intl.formatMessage({id: "client.deleteMessage"})}</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>{intl.formatMessage({id: "client.deleteWarning"})}</strong> {intl.formatMessage({id: "client.deleteWarningMessage"})}
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, clientId: null })}
                  >
                    {intl.formatMessage({id: "client.cancel"})}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteClient(deleteModal.clientId)}
                  >
                    <i className="pi pi-trash me-1"></i>{intl.formatMessage({id: "client.delete"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, clientId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default ClientScreen;