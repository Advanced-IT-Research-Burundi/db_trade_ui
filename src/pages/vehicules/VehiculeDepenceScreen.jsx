import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import ApiService from "../../services/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer.js";

const VehiculeDepenceScreen = () => {
  const [depenses, setDepenses] = useState([]);
  const [vehicule, setVehicule] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    currency: "",
    date_from: "",
    date_to: "",
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    depenseId: null,
  });
  const toast = useRef(null);

  const navigate = useNavigate();
  const { id: vehiculeId } = useParams();

  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.apiData);

  useEffect(() => {
    loadVehicule();
    loadDepenses();
  }, [vehiculeId]);

  useEffect(() => {
    if (data[`vehicule_depenses${vehiculeId}`]) {
        console.log('vehicule depenses',data[`vehicule_depenses${vehiculeId}`])
      setDepenses(data[`vehicule_depenses${vehiculeId}`].data || []);
      setVehicule(data[`vehicule_depenses${vehiculeId}`].vehicule || null);

      setPagination({
        current_page: data[`vehicule_depenses${vehiculeId}`].current_page,
        last_page: data[`vehicule_depenses${vehiculeId}`].last_page,
        total: data[`vehicule_depenses${vehiculeId}`].total,
        from: data[`vehicule_depenses${vehiculeId}`].from,
        to: data[`vehicule_depenses${vehiculeId}`].to,
      });
    }
  }, [data]);

  async function loadVehicule() {
    try {
      const response = await ApiService.get(`/api/vehicules/${vehiculeId}`);
      if (response.success) {
        setVehicule(response.data);
      }
    } catch (error) {
      showToast("error", "Erreur lors du chargement du véhicule");
    }
  }

  async function loadDepenses(page = 1) {
    try {
      const params = { page, vehicule_id: vehiculeId, ...filters };
      dispatch(
        fetchApiData({
          url: `/api/vehicule-depenses`,
          itemKey: `vehicule_depenses${vehiculeId}`,
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
    loadDepenses(1);
  };

  const handleReset = () => {
    setFilters({ search: "", currency: "", date_from: "", date_to: "" });
    setTimeout(() => loadDepenses(1), 0);
  };

  const handleDeleteDepense = async (depenseId) => {
    try {
      const response = await ApiService.delete(`/api/vehicule-depenses/${depenseId}`);
      if (response.success) {
        showToast("success", "Dépense supprimée avec succès");
        loadDepenses(pagination.current_page);
      } else {
        showToast("error", response.message || "Erreur lors de la suppression");
      }
    } catch (error) {
      showToast("error", error.message);
    }
    setDeleteModal({ show: false, depenseId: null });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === "error" ? "Erreur" : "Succès",
      detail,
      life: 3000,
    });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString("fr-FR");
  const formatDateTime = (date) => new Date(date).toLocaleString("fr-FR");

  const formatAmount = (amount, currency = "BIF", exchangeRate = null) => {
    const formattedAmount = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(amount);
    
    let result = `${formattedAmount} ${currency}`;
    
    if (exchangeRate && currency !== "BIF") {
      const bifAmount = amount * exchangeRate;
      result += ` (${new Intl.NumberFormat("fr-FR").format(bifAmount)} BIF)`;
    }
    
    return result;
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  const getTotalAmount = () => {
    return depenses.reduce((total, depense) => {
      if (depense.currency === "BIF" || !depense.exchange_rate) {
        return total + depense.amount;
      }
      return total + (depense.amount * depense.exchange_rate);
    }, 0);
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
              onClick={() => loadDepenses(pagination.current_page - 1)}
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
                  onClick={() => loadDepenses(page)}
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
              onClick={() => loadDepenses(pagination.current_page + 1)}
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
                <i className="pi pi-dollar me-2"></i>
                Dépenses du véhicule {  vehicule?.model || " #" + vehiculeId}
              </h2>
              <p className="text-muted mb-0">
                {pagination.total} dépense(s) • Total: {formatAmount(getTotalAmount(), "BIF")}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/vehicles')}
              >
                <i className="pi pi-arrow-left me-1"></i>
                Retour aux véhicules
              </button>
              <button
                className="btn btn-outline-primary"
                onClick={() => loadDepenses(pagination.current_page)}
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? "Actualisation..." : "Actualiser"}
              </button>
              <button
                onClick={() => navigate(`/vehicles/${vehiculeId}/expenses/create`)}
                className="btn btn-primary"
              >
                <i className="pi pi-plus-circle me-1"></i>
                Nouvelle Dépense
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Info Card */}
      {vehicule && (
        <div className="card shadow-sm border-0 mb-4">
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <h6 className="text-muted mb-1">Véhicule</h6>
                <p className="mb-0 fw-bold">{vehicule.name || "N/A"}</p>
              </div>
              <div className="col-md-3">
                <h6 className="text-muted mb-1">Immatriculation</h6>
                <p className="mb-0">{vehicule.immatriculation || "N/A"}</p>
              </div>
              <div className="col-md-3">
                <h6 className="text-muted mb-1">Marque/Modèle</h6>
                <p className="mb-0">{vehicule.brand} {vehicule.model}</p>
              </div>
              <div className="col-md-3">
                <h6 className="text-muted mb-1">Statut</h6>
                <span className={`badge ${
                  vehicule.status === 'disponible' ? 'bg-success' :
                  vehicule.status === 'en_mission' ? 'bg-warning' :
                  vehicule.status === 'en_maintenance' ? 'bg-info' :
                  'bg-danger'
                }`}>
                  {vehicule.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  placeholder="Description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-2">
              <label className="form-label">Devise</label>
              <select
                className="form-select"
                value={filters.currency}
                onChange={(e) => handleFilterChange("currency", e.target.value)}
              >
                <option value="">Toutes</option>
                <option value="BIF">BIF</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="TSH">TSH</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label">Date début</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_from}
                onChange={(e) => handleFilterChange("date_from", e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label">Date fin</label>
              <input
                type="date"
                className="form-control"
                value={filters.date_to}
                onChange={(e) => handleFilterChange("date_to", e.target.value)}
              />
            </div>

            <div className="col-md-3 d-flex align-items-end gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                <i className="pi pi-search me-1"></i>Rechercher
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleReset}
              >
                <i className="pi pi-refresh me-1"></i>Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Depenses Table */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="pi pi-list me-2"></i>Liste des Dépenses
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0 px-4 py-3">Date</th>
                  <th className="border-0 px-4 py-3">Montant</th>
                  <th className="border-0 px-4 py-3">Devise</th>
                  <th className="border-0 px-4 py-3">Taux</th>
                  <th className="border-0 px-4 py-3">Description</th>
                  <th className="border-0 px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depenses.length === 0 && loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                    </td>
                  </tr>
                ) : data.vehicule_depenses == undefined && depenses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="text-muted">
                        <i className="pi pi-inbox display-4 d-block mb-3"></i>
                        <h5>Aucune dépense trouvée</h5>
                        <p className="mb-0">
                          Aucune dépense enregistrée pour ce véhicule
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  depenses.map((depense) => (
                    <tr key={depense.id}>
                      <td className="px-4">
                        <div>
                          <strong>{formatDate(depense.date)}</strong>
                          <br />
                          <small className="text-muted">
                            {new Date(depense.date).toLocaleTimeString(
                              "fr-FR",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </small>
                        </div>
                      </td>
                      <td className="px-4">
                        <strong className="text-primary">
                          {formatAmount(depense.amount, depense.currency, depense.exchange_rate)}
                        </strong>
                      </td>
                      <td className="px-4">
                        <span className={`badge ${
                          depense.currency === 'BIF' ? 'bg-success' :
                          depense.currency === 'USD' ? 'bg-primary' :
                          depense.currency === 'EUR' ? 'bg-info' :
                          'bg-warning'
                        }`}>
                          {depense.currency || 'BIF'}
                        </span>
                      </td>
                      <td className="px-4">
                        {depense.exchange_rate ? (
                          <span className="text-muted">
                            1 {depense.currency} = {depense.exchange_rate} BIF
                          </span>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td className="px-4">
                        {depense.description ? (
                          <span title={depense.description}>
                            {truncateText(depense.description, 60)}
                          </span>
                        ) : (
                          <span className="text-muted">Aucune description</span>
                        )}
                      </td>
                      <td className="px-4">
                        <div className="btn-group" role="group">
                          <button
                            onClick={() => navigate(`/vehicles/${vehiculeId}/expenses/${depense.id}/edit`)}
                            className="btn btn-sm btn-outline-warning"
                            title="Modifier"
                          >
                            <i className="pi pi-pencil"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            title="Supprimer"
                            onClick={() =>
                              setDeleteModal({
                                show: true,
                                depenseId: depense.id,
                              })
                            }
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
                Affichage de {pagination.from} à {pagination.to} sur{" "}
                {pagination.total} résultats
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
                    <i className="pi pi-exclamation-triangle me-2"></i>
                    Confirmer la suppression
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setDeleteModal({ show: false, depenseId: null })
                    }
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Êtes-vous sûr de vouloir supprimer cette dépense ? Cette
                    action est irréversible.
                  </p>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setDeleteModal({ show: false, depenseId: null })
                    }
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => handleDeleteDepense(deleteModal.depenseId)}
                  >
                    <i className="pi pi-trash me-1"></i>Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => setDeleteModal({ show: false, depenseId: null })}
          ></div>
        </>
      )}
    </div>
  );
};

export default VehiculeDepenceScreen;