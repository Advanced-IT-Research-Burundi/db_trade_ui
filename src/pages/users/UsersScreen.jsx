import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import { API_CONFIG } from '../../services/config.js';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../../stores/slicer/apiDataSlicer.js';
import { useNavigate } from 'react-router-dom';

const UserScreen = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    company_id: '',
    agency_id: '',
    role: '',
    status: ''
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0
  });
  const [deleteModal, setDeleteModal] = useState({ show: false, userId: null });
  const toast = useRef(null);


      const navigate = useNavigate();
      const dispatch = useDispatch();
      const { data , loading} = useSelector(state => state.apiData);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
              if (data.users) {
                  setUsers(data.users.users?.data || []);

                setCompanies(data.users.companies || []);
                setAgencies(data.users?.agencies || []);
                setRoles(data.users?.roles || []);
                setStatuses(data.users?.statuses || []);
                setPagination({
                  current_page: data.users.users?.current_page,
                  last_page: data.users.users?.last_page,
                  total: data.users.users?.total,
                  from: data.users.users?.from,
                  to: data.users.users?.to
                });
              }
            }, [data]);

  async function loadUsers(page = 1) {
            try {
              const params = { page, ...filters };
              dispatch(fetchApiData({ url: API_CONFIG.ENDPOINTS.USERS, itemKey: 'users', params }));
             
            } catch (error) {
              showToast('error', error.message);
            } 
          };



  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers(1);
  };

  const handleReset = () => {
    setFilters({ search: '', company_id: '', agency_id: '', role: '', status: '' });
    setTimeout(() => loadUsers(1), 0);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await ApiService.delete(`/api/users/${userId}`);
      if (response.success) {
        showToast('success', 'Utilisateur supprimé avec succès');
        loadUsers(pagination.current_page);
      } else {
        showToast('error', response.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      showToast('error', error.message);
    }
    setDeleteModal({ show: false, userId: null });
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

  const getFullName = (user) => {
    const parts = [user.first_name, user.last_name].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'N/A';
  };

  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `/storage/${imagePath}`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Actif</span>;
      case 'inactive':
        return <span className="badge bg-secondary">Inactif</span>;
      case 'suspended':
        return <span className="badge bg-danger">Suspendu</span>;
      default:
        return <span className="badge bg-secondary">Inconnu</span>;
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      'admin': 'danger',
      'manager': 'warning',
      'employee': 'info',
      'user': 'primary'
    };
    const color = roleColors[role?.toLowerCase()] || 'secondary';
    return <span className={`badge bg-${color}`}>{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'N/A'}</span>;
  };

  const getLastLoginText = (lastLogin) => {
    if (!lastLogin) return null;
    const now = new Date();
    const loginDate = new Date(lastLogin);
    const diffTime = Math.abs(now - loginDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return formatDate(lastLogin);
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
              onClick={() => loadUsers(pagination.current_page - 1)} 
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
                <button className="page-link" onClick={() => loadUsers(page)}>
                  {page}
                </button>
              )}
            </li>
          ))}
          
          <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={() => loadUsers(pagination.current_page + 1)} 
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
                <i className="pi pi-users me-2"></i>Gestion des Utilisateurs
              </h2>
              <p className="text-muted mb-0">{pagination.total} utilisateur(s) au total</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={() => loadUsers(pagination.current_page)} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <a onClick={()=>navigate('/users/create')} className="btn btn-primary">
                <i className="pi pi-plus-circle me-1"></i>Nouvel Utilisateur
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
                  placeholder="Nom, email ou téléphone..."
                  value={filters.search} 
                  onChange={(e) => handleFilterChange('search', e.target.value)} 
                />
              </div>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Entreprise</label>
              <select 
                className="form-select" 
                value={filters.company_id} 
                onChange={(e) => handleFilterChange('company_id', e.target.value)}
              >
                <option value="">Toutes</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.tp_name || company.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Agence</label>
              <select 
                className="form-select" 
                value={filters.agency_id} 
                onChange={(e) => handleFilterChange('agency_id', e.target.value)}
              >
                <option value="">Toutes</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Rôle</label>
              <select 
                className="form-select" 
                value={filters.role} 
                onChange={(e) => handleFilterChange('role', e.target.value)}
              >
                <option value="">Tous</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Statut</label>
              <select 
                className="form-select" 
                value={filters.status} 
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tous</option>
                {statuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-1 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <i className="pi pi-search"></i>
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleReset}>
                <i className="pi pi-refresh"></i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Users Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Utilisateurs
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Photo</th>
                  <th className="border-0 px-4 py-3">Nom</th>
                  <th className="border-0 px-4 py-3">Email</th>
                  <th className="border-0 px-4 py-3">Téléphone</th>
                  <th className="border-0 px-4 py-3">Rôle</th>
                  <th className="border-0 px-4 py-3">Statut</th>
                  <th className="border-0 px-4 py-3">Entreprise</th>
                  <th className="border-0 px-4 py-3">Agence</th>
                  <th className="border-0 px-4 py-3">Créé le</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                { users.length === 0 && loading  ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.users == undefined && users.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucun utilisateur trouvé</h5>
                        <p className="mb-0">Essayez de modifier vos critères de recherche ou créez un nouvel utilisateur</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4">
                        {getProfileImageUrl(user.profile_photo) ? (
                          <img 
                            src={getProfileImageUrl(user.profile_photo)} 
                            alt="Photo de profil"
                            className="rounded-circle"
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : (
                          <div 
                          className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
                          style={{ 
                            width: '40px', 
                            height: '40px',
                            display: getProfileImageUrl(user.profile_photo) ? 'none' : 'flex'
                          }}
                        >
                          <i className="pi pi-user"></i>
                        </div>
                        )}
                        
                      </td>
                      <td className="px-4">
                        <div>
                          <strong className="text-primary">{getFullName(user)}</strong>
                          {user.last_login_at && (
                            <>
                              <br />
                              <small className="text-muted">
                                Dernière connexion: {getLastLoginText(user.last_login_at)}
                              </small>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="d-flex align-items-center">
                          <i className="pi pi-envelope text-muted me-2"></i>
                          <span>{user.email}</span>
                          {user.email_verified_at && (
                            <i className="pi pi-check-circle text-success ms-2" title="Email vérifié"></i>
                          )}
                        </div>
                      </td>
                      <td className="px-4">
                        {user.phone ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-phone text-muted me-2"></i>
                            {user.phone}
                          </div>
                        ) : (
                          <span className="text-muted">Non renseigné</span>
                        )}
                      </td>
                      <td className="px-4">{getRoleBadge(user.role)}</td>
                      <td className="px-4">{getStatusBadge(user.status)}</td>
                      <td className="px-4">
                        {user.company ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-building text-info me-2"></i>
                            {user.company.tp_name || user.company.name}
                          </div>
                        ) : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        {user.agency ? (
                          <div className="d-flex align-items-center">
                            <i className="pi pi-map-marker text-warning me-2"></i>
                            {user.agency.name}
                          </div>
                        ) : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(user.created_at)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(user.created_at).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <a 
                            onClick={()=>{navigate(`/users/${user.id}`)}}
                            className="btn btn-sm btn-outline-info" 
                            title="Voir"
                          >
                            <i className="pi pi-eye"></i>
                          </a>
                          <a 
                            onClick={()=>navigate(`/users/${user.id}/edit`)}
                            className="btn btn-sm btn-outline-warning" 
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </a>
                          {user.id !== user.current_user_id && (
                            <button 
                              type="button" 
                              className="btn btn-sm btn-outline-danger" 
                              title="Supprimer"
                              onClick={() => setDeleteModal({ show: true, userId: user.id })}
                            >
                              <i className="pi pi-trash"></i>
                            </button>
                          )}
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
                    onClick={() => setDeleteModal({ show: false, userId: null })}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>Attention :</strong> La suppression de cet utilisateur pourrait affecter les données associées dans le système.
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setDeleteModal({ show: false, userId: null })}
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-danger"
                    onClick={() => handleDeleteUser(deleteModal.userId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div 
            className="modal-backdrop show" 
            onClick={() => setDeleteModal({ show: false, userId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default UserScreen;