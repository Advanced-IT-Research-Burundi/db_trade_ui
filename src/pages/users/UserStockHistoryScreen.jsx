import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import ApiService from "../../services/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer.js";
import { API_CONFIG } from "../../services/config.js";

const UserStockHistoryScreen = () => {
  const [user, setUser] = useState(null);
  const [stockHistory, setStockHistory] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    deleted: 0,
    lastAction: null,
  });
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });

  const toast = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.apiData);

  useEffect(() => {
    if (id) {
      loadStockHistory();
    }
  }, [id]);

  useEffect(() => {
    if (data.stockHistory) {
      setUser(data.stockHistory.user);
      setStockHistory(data.stockHistory.data || []);
      setStatistics(data.stockHistory.statistics || {
        total: 0,
        active: 0,
        deleted: 0,
        lastAction: null,
      });

      setPagination({
        current_page: data.stockHistory.current_page,
        last_page: data.stockHistory.last_page,
        total: data.stockHistory.total,
        from: data.stockHistory.from,
        to: data.stockHistory.to,
      });
    }
  }, [data]);

  async function loadStockHistory(page = 1) {
    try {
      const params = { page, ...filters };
      dispatch(
        fetchApiData({
          url: `${API_CONFIG.ENDPOINTS.USERS}/${id}/stocks/history`,
          itemKey: "stockHistory",
          params,
        })
      );
    } catch (error) {
      showToast("error", error.message);
    }
  }

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadStockHistory(1);
  };

  const handleReset = () => {
    setFilters({ date_from: "", date_to: "", status: "" });
    setTimeout(() => loadStockHistory(1), 0);
  };

  const showToast = (severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === "error" ? "Erreur" : "Succès",
      detail,
      life: 3000,
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleDateString("fr-FR");
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateTimeRelative = (date) => {
    if (!date) return "N/A";
    const d = new Date(date);
    const now = new Date();
    const diffInHours = Math.floor((now - d) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      if (diffInHours === 0) return "À l'instant";
      return `Il y a ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
    } else {
      return formatDate(date);
    }
  };

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
      if (current > 4) pages.push("...");

      const start = Math.max(2, current - 1);
      const end = Math.min(last - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < last - 3) pages.push("...");
      pages.push(last);

      return pages;
    };

    return (
      <nav>
        <ul className="pagination pagination-sm mb-0">
          <li
            className={`page-item ${
              pagination.current_page === 1 ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => loadStockHistory(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>

          {getVisiblePages().map((page, index) => (
            <li
              key={index}
              className={`page-item ${
                page === pagination.current_page ? "active" : ""
              } ${page === "..." ? "disabled" : ""}`}
            >
              {page === "..." ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => loadStockHistory(page)}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          <li
            className={`page-item ${
              pagination.current_page === pagination.last_page ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => loadStockHistory(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  if (loading && !user) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <i className="pi pi-exclamation-triangle me-2"></i>
          Utilisateur non trouvé
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <Toast ref={toast} />


      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">
            <i className="pi pi-clock me-2"></i>
            Historique des Stocks
          </h1>
          <p className="text-muted mb-0">
            Utilisateur: <strong>{user.first_name} {user.last_name}</strong>
          </p>
        </div>
        <div className="btn-group">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/users/${user.id}/stocks`)}
          >
            <i className="pi pi-arrow-left me-2"></i>
            Retour à la Gestion
          </button>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => navigate(`/users/${user.id}`)}
          >
            <i className="pi pi-user me-2"></i>
            Voir le Profil
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Total Assignations</h6>
                  <h3>{statistics.total}</h3>
                </div>
                <div className="align-self-center">
                  <i className="pi pi-chart-bar" style={{ fontSize: "2rem" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Stocks Actifs</h6>
                  <h3>{statistics.active}</h3>
                </div>
                <div className="align-self-center">
                  <i className="pi pi-check-circle" style={{ fontSize: "2rem" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Stocks Désassignés</h6>
                  <h3>{statistics.deleted}</h3>
                </div>
                <div className="align-self-center">
                  <i className="pi pi-times-circle" style={{ fontSize: "2rem" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <h6 className="card-title">Dernière Action</h6>
                  <h6>{statistics.lastAction ? formatDateTimeRelative(statistics.lastAction) : 'Aucune'}</h6>
                </div>
                <div className="align-self-center">
                  <i className="pi pi-clock" style={{ fontSize: "2rem" }}></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-light">
          <h6 className="card-title mb-0">
            <i className="pi pi-list me-2"></i>
            Historique Détaillé
          </h6>
        </div>
        <div className="card-body">
          {stockHistory.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Stock</th>
                      <th>Agence</th>
                      <th>Action</th>
                      <th>Créé par</th>
                      <th>Date d'assignation</th>
                      <th>Date de désassignation</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockHistory.map((assignment) => (
                      <tr 
                        key={assignment.id} 
                        className={assignment.deleted_at ? "table-secondary" : ""}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            <i className="pi pi-box text-primary me-2"></i>
                            <div>
                              <strong>
                                {assignment.stock ? assignment.stock.name : 'Stock supprimé'}
                              </strong>
                              {assignment.stock && assignment.stock.description && (
                                <>
                                  <br />
                                  <small className="text-muted">
                                    {truncateText(assignment.stock.description, 30)}
                                  </small>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          {assignment.agency ? (
                            <>
                              <i className="pi pi-map-marker text-warning me-1"></i>
                              {assignment.agency.name}
                            </>
                          ) : (
                            <span className="text-muted">Aucune agence</span>
                          )}
                        </td>
                        <td>
                          {assignment.deleted_at ? (
                            <span className="badge bg-danger">
                              <i className="pi pi-minus-circle me-1"></i>
                              Désassigné
                            </span>
                          ) : (
                            <span className="badge bg-success">
                              <i className="pi pi-plus-circle me-1"></i>
                              Assigné
                            </span>
                          )}
                        </td>
                        <td>
                          {assignment.created_by ? (
                            <div className="d-flex align-items-center">
                              <i className="pi pi-user text-info me-1"></i>
                              <div>
                                <small>
                                  {assignment.created_by.first_name} {assignment.created_by.last_name}
                                </small>
                                <br />
                                <small className="text-muted">
                                  {assignment.created_by.email}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">Utilisateur supprimé</span>
                          )}
                        </td>
                        <td>
                          <div>
                            <strong>{formatDate(assignment.created_at)}</strong>
                            <br />
                            <small className="text-muted">
                              {formatTime(assignment.created_at)}
                            </small>
                            <br />
                            <small className="text-muted">
                              {formatDateTimeRelative(assignment.created_at)}
                            </small>
                          </div>
                        </td>
                        <td>
                          {assignment.deleted_at ? (
                            <div>
                              <strong>{formatDate(assignment.deleted_at)}</strong>
                              <br />
                              <small className="text-muted">
                                {formatTime(assignment.deleted_at)}
                              </small>
                              <br />
                              <small className="text-muted">
                                {formatDateTimeRelative(assignment.deleted_at)}
                              </small>
                            </div>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td>
                          {assignment.deleted_at ? (
                            <span className="badge bg-outline-secondary">Inactif</span>
                          ) : (
                            <span className="badge bg-outline-success">Actif</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.last_page > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4">
                  <div>
                    <small className="text-muted">
                      Affichage de {pagination.from} à {pagination.to} sur {pagination.total} résultats
                    </small>
                  </div>
                  <div>
                    <Pagination />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-5">
              <i className="pi pi-clock text-muted" style={{ fontSize: "4rem" }}></i>
              <h4 className="text-muted mt-3">Aucun historique</h4>
              <p className="text-muted">Cet utilisateur n'a jamais eu de stock assigné.</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate(`/users/${user.id}/stocks`)}
              >
                <i className="pi pi-plus-circle me-2"></i>
                Assigner des stocks
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Export Options & Filters */}
      {stockHistory.length > 0 && (
        <div className="card shadow-sm mt-4">
          <div className="card-header bg-light">
            <h6 class="card-title mb-0">
              <i className="pi pi-download me-2"></i>
              Options d'Export et Filtres
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p className="text-muted mb-3">Exportez l'historique des stocks pour cet utilisateur</p>
                <div className="btn-group">
                  <button className="btn btn-outline-danger" disabled>
                    <i className="pi pi-file-pdf me-2"></i>
                    Export PDF
                  </button>
                  <button className="btn btn-outline-success" disabled>
                    <i className="pi pi-file-excel me-2"></i>
                    Export Excel
                  </button>
                  <button className="btn btn-outline-info" disabled>
                    <i className="pi pi-file me-2"></i>
                    Export CSV
                  </button>
                </div>
                <small className="text-muted d-block mt-2">
                  <i className="pi pi-info-circle me-1"></i>
                  Fonctionnalité d'export en développement
                </small>
              </div>
              <div className="col-md-6">
                <div className="border-start ps-4">
                  <h6 className="text-muted">Filtres disponibles</h6>
                  <form onSubmit={handleSearch} className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Date de début</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm"
                        value={filters.date_from}
                        onChange={(e) => handleFilterChange("date_from", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Date de fin</label>
                      <input 
                        type="date" 
                        className="form-control form-control-sm"
                        value={filters.date_to}
                        onChange={(e) => handleFilterChange("date_to", e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Statut</label>
                      <select 
                        className="form-select form-select-sm"
                        value={filters.status}
                        onChange={(e) => handleFilterChange("status", e.target.value)}
                      >
                        <option value="">Tous les statuts</option>
                        <option value="active">Actifs seulement</option>
                        <option value="deleted">Désassignés seulement</option>
                      </select>
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-sm me-2"
                        disabled={loading}
                      >
                        <i className="pi pi-filter me-1"></i>
                        Filtrer
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleReset}
                      >
                        <i className="pi pi-refresh me-1"></i>
                        Reset
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStockHistoryScreen;