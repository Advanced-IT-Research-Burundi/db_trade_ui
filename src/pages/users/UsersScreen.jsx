import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const UsersScreen = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  // Charger les utilisateurs
  const loadUsers = async (page = 1, search = '', status = 'all', role = 'all') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: itemsPerPage.toString(),
        search: search,
        ...(status !== 'all' && { status }),
        ...(role !== 'all' && { role })
      });

      const response = await ApiService.get(`/api/users?${params}`);
      
      if (response.success) {
        setUsers(response.data.data || []);
        setTotalPages(response.data.last_page || 1);
        setCurrentPage(response.data.current_page || 1);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement des utilisateurs',
          life: 3000
        });
      }
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement des utilisateurs' + error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${userName}" ?`)) {
      try {
        const response = await ApiService.delete(`/api/users/${userId}`);
        
        if (response.success) {
          toast.current.show({
            severity: 'success',
            summary: 'Succès',
            detail: 'Utilisateur supprimé avec succès',
            life: 3000
          });
          loadUsers(currentPage, searchTerm, statusFilter, roleFilter);
        } else {
          toast.current.show({
            severity: 'error',
            summary: 'Erreur',
            detail: response.message || 'Erreur lors de la suppression',
            life: 3000
          });
        }
      } catch (error) {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Erreur lors de la suppression' + error.message,
          life: 3000
        });
      }
    }
  };

  // Effet pour charger les données
  useEffect(() => {
    loadUsers(currentPage, searchTerm, statusFilter, roleFilter);
  }, [currentPage, searchTerm, statusFilter, roleFilter]);

  // Gérer la recherche
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Gérer le changement de page
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Gérer le changement de filtre statut
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Gérer le changement de filtre rôle
  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  // Générer les numéros de page
  const generatePageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Formater le nom complet
  const getFullName = (user) => {
    const parts = [];
    if (user.first_name) parts.push(user.first_name);
    if (user.last_name) parts.push(user.last_name);
    return parts.join(' ') || 'N/A';
  };

  // Obtenir le badge de statut
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="badge bg-success">Actif</span>;
      case 'inactive':
        return <span className="badge bg-danger">Inactif</span>;
      case 'suspended':
        return <span className="badge bg-warning">Suspendu</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  // Obtenir le badge de rôle
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge bg-primary">Admin</span>;
      case 'manager':
        return <span className="badge bg-info">Manager</span>;
      case 'salesperson':
        return <span className="badge bg-secondary">Vendeur</span>;
      default:
        return <span className="badge bg-secondary">{role}</span>;
    }
  };

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            {/* Header */}
            <div className="card-header bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h4 className="m-0 text-primary">
                  <i className="pi pi-users me-2"></i>
                  Gestion des utilisateurs
                </h4>
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/users/create')}
                >
                  <i className="pi pi-plus me-2"></i>
                  Nouvel utilisateur
                </button>
              </div>
            </div>

            {/* Filtres */}
            <div className="card-body border-bottom">
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="pi pi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par nom, email..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={statusFilter}
                    onChange={handleStatusFilterChange}
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="suspended">Suspendu</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={handleRoleFilterChange}
                  >
                    <option value="all">Tous les rôles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="salesperson">Vendeur</option>
                  </select>
                </div>
                <div className="col-md-2">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setRoleFilter('all');
                      setCurrentPage(1);
                    }}
                  >
                    <i className="pi pi-refresh me-2"></i>
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {/* Tableau */}
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="pi pi-spin pi-spinner me-2"></i>
                  Chargement...
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Nom complet</th>
                        <th>Email</th>
                        <th>Téléphone</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Date de naissance</th>
                        <th className="text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar me-3">
                                  {user.profile_photo ? (
                                    <img
                                      src={user.profile_photo}
                                      alt={getFullName(user)}
                                      className="rounded-circle"
                                      width="40"
                                      height="40"
                                    />
                                  ) : (
                                    <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                      {getFullName(user).charAt(0).toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="fw-bold">{getFullName(user)}</div>
                                  {user.gender && (
                                    <small className="text-muted">
                                      {user.gender === 'male' ? 'Homme' : user.gender === 'female' ? 'Femme' : user.gender}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>{user.email}</div>
                              {user.email_verified_at && (
                                <small className="text-success">
                                  <i className="pi pi-check-circle me-1"></i>
                                  Vérifié
                                </small>
                              )}
                            </td>
                            <td>{user.phone || 'N/A'}</td>
                            <td>{getRoleBadge(user.role)}</td>
                            <td>{getStatusBadge(user.status)}</td>
                            <td>{user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('fr-FR') : 'N/A'}</td>
                            <td className="text-center">
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => navigate(`/users/${user.id}`)}
                                  title="Voir les détails"
                                >
                                  <i className="pi pi-eye"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => navigate(`/users/${user.id}/edit`)}
                                  title="Modifier"
                                >
                                  <i className="pi pi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(user.id, getFullName(user))}
                                  title="Supprimer"
                                >
                                  <i className="pi pi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            <div className="text-muted">
                              <i className="pi pi-users me-2"></i>
                              Aucun utilisateur trouvé
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card-footer">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="text-muted">
                    Page {currentPage} sur {totalPages}
                  </div>
                  <nav aria-label="Pagination">
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="pi pi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {generatePageNumbers().map((page) => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="pi pi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersScreen;