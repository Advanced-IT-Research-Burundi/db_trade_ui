import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import ApiService from "../../services/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer.js";
import { API_CONFIG } from "../../services/config.js";

const UserStocksScreen = () => {
  const [user, setUser] = useState(null);
  const [assignedStocks, setAssignedStocks] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [detachModal, setDetachModal] = useState({
    show: false,
    stockId: null,
    stockName: "",
  });
  
  const toast = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.apiData);

  useEffect(() => {
    if (id) {
      loadUserStocks();
    }
  }, [id]);

  useEffect(() => {
    if (data.userStocks) {
      setUser(data.userStocks.user);
      setAssignedStocks(data.userStocks.assignedStocks || []);
      setAvailableStocks(data.userStocks.availableStocks || []);
    }
  }, [data]);

  async function loadUserStocks() {
    try {
      dispatch(
        fetchApiData({
          url: `${API_CONFIG.ENDPOINTS.USERS}/${id}/stocks/manage`,
          itemKey: "userStocks",
        })
      );
    } catch (error) {
      showToast("error", error.message);
    }
  }

  const handleStockSelection = (stockId) => {
    setSelectedStocks(prev => {
      if (prev.includes(stockId)) {
        return prev.filter(id => id !== stockId);
      } else {
        return [...prev, stockId];
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedStocks(availableStocks.map(stock => stock.id));
  };

  const handleSelectNone = () => {
    setSelectedStocks([]);
  };

  const handleAttachStocks = async () => {
    if (selectedStocks.length === 0) {
      showToast("warn", "Veuillez sélectionner au moins un stock");
      return;
    }

    try {
      const response = await ApiService.post(`/api/users/${id}/stocks/attach`, {
        stock_ids: selectedStocks
      });
      
      if (response.success) {
        showToast("success", `${selectedStocks.length} stock(s) assigné(s) avec succès`);
        setSelectedStocks([]);
        loadUserStocks();
      } else {
        showToast("error", response.message || "Erreur lors de l'assignation");
      }
    } catch (error) {
      showToast("error", error.message);
    }
  };

  const handleDetachStock = async (stockId) => {
    try {
      const response = await ApiService.delete(`/api/users/${id}/stocks/${stockId}/detach`);
      
      if (response.success) {
        showToast("success", "Stock désassigné avec succès");
        loadUserStocks();
      } else {
        showToast("error", response.message || "Erreur lors de la désassignation");
      }
    } catch (error) {
      showToast("error", error.message);
    }
    setDetachModal({ show: false, stockId: null, stockName: "" });
  };

  const showToast = (severity, detail) => {
    toast.current?.show({
      severity,
      summary: severity === "error" ? "Erreur" : severity === "warn" ? "Attention" : "Succès",
      detail,
      life: 3000,
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("fr-FR");
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-danger",
      manager: "bg-warning",
      user: "bg-info",
      employee: "bg-success",
    };
    return colors[role?.toLowerCase()] || "bg-secondary";
  };

  const truncateText = (text, maxLength = 50) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
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
            <i className="pi pi-box me-2"></i>
            Gestion des Stocks
          </h1>
          <p className="text-muted mb-0">
            Utilisateur: <strong>{user.first_name} {user.last_name}</strong>
          </p>
        </div>
        <div className="btn-group">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate(`/users/${user.id}`)}
          >
            <i className="pi pi-arrow-left me-2"></i>
            Retour au Profil
          </button>
          <button 
            className="btn btn-success"
            onClick={() => navigate(`/users/${user.id}/stocks/history`)}
          >
            <i className="pi pi-clock me-2"></i>
            Historiques
          </button>
        </div>
      </div>

      <div className="row">
        {/* User Info Card */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h6 className="card-title mb-0">
                <i className="pi pi-user me-2"></i>
                Informations Utilisateur
              </h6>
            </div>
            <div className="card-body text-center">
              {user.profile_photo ? (
                <img 
                  src={user.profile_photo} 
                  alt="Photo de profil"
                  className="rounded-circle mb-3"
                  width="80" 
                  height="80"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                  style={{ width: "80px", height: "80px" }}
                >
                  <i className="pi pi-user" style={{ fontSize: "2rem" }}></i>
                </div>
              )}

              <h5 className="mb-1">{user.first_name} {user.last_name}</h5>
              <p className="text-muted mb-2">{user.email}</p>
              <span className={`badge ${getRoleColor(user.role)}`}>
                {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
              </span>

              {user.agency && (
                <div className="mt-3">
                  <small className="text-muted">
                    <i className="pi pi-map-marker me-1"></i>
                    {user.agency.name}
                  </small>
                </div>
              )}
            </div>
          </div>

          {/* Stock Statistics */}
          <div className="card shadow-sm">
            <div className="card-header bg-info text-white">
              <h6 className="card-title mb-0">
                <i className="pi pi-chart-bar me-2"></i>
                Statistiques
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Stocks assignés:</span>
                <span className="badge bg-success">{assignedStocks.length}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span>Stocks disponibles:</span>
                <span className="badge bg-secondary">{availableStocks.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div className="col-md-8">
          {/* Assigned Stocks */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">
                <i className="pi pi-check-circle me-2"></i>
                Stocks Assignés ({assignedStocks.length})
              </h6>
            </div>
            <div className="card-body">
              {assignedStocks.length > 0 ? (
                <div className="row">
                  {assignedStocks.map((stock) => (
                    <div key={stock.id} className="col-md-6 mb-3">
                      <div className="border rounded p-3 d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="mb-1">{stock.name}</h6>
                          <small className="text-muted">
                            <i className="pi pi-map-marker me-1"></i>
                            {stock.agency ? stock.agency.name : 'Aucune agence'}
                          </small>
                          <br />
                          <small className="text-muted">
                            <i className="pi pi-calendar me-1"></i>
                            Assigné le {formatDate(stock.pivot?.created_at || stock.assigned_date)}
                          </small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          title="Désassigner"
                          onClick={() =>
                            setDetachModal({
                              show: true,
                              stockId: stock.id,
                              stockName: stock.name,
                            })
                          }
                        >
                          <i className="pi pi-times-circle"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="pi pi-inbox" style={{ fontSize: "3rem" }}></i>
                  <p className="mt-2">Aucun stock assigné à cet utilisateur</p>
                </div>
              )}
            </div>
          </div>

          {/* Available Stocks */}
          <div className="card shadow-sm">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h6 className="card-title mb-0">
                <i className="pi pi-plus-circle me-2"></i>
                Stocks Disponibles ({availableStocks.length})
              </h6>
            </div>
            <div className="card-body">
              {availableStocks.length > 0 ? (
                <>
                  <div className="row">
                    {availableStocks.map((stock) => (
                      <div key={stock.id} className="col-md-6 mb-3">
                        <div className="border rounded p-3">
                          <div className="form-check">
                            <input 
                              className="form-check-input"
                              type="checkbox"
                              id={`stock_${stock.id}`}
                              checked={selectedStocks.includes(stock.id)}
                              onChange={() => handleStockSelection(stock.id)}
                            />
                            <label className="form-check-label w-100" htmlFor={`stock_${stock.id}`}>
                              <div className="d-flex justify-content-between align-items-start">
                                <div>
                                  <h6 className="mb-1">{stock.name}</h6>
                                  <small className="text-muted">
                                    <i className="pi pi-map-marker me-1"></i>
                                    {stock.agency ? stock.agency.name : 'Aucune agence'}
                                  </small>
                                  {stock.description && (
                                    <>
                                      <br />
                                      <small className="text-muted">
                                        {truncateText(stock.description, 50)}
                                      </small>
                                    </>
                                  )}
                                </div>
                                <span className="badge bg-primary">
                                  {stock.agency?.name ?? 'Standard'}
                                </span>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4">
                    <div>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary"
                        onClick={handleSelectAll}
                      >
                        <i className="pi pi-check me-1"></i>
                        Tout sélectionner
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={handleSelectNone}
                      >
                        <i className="pi pi-times me-1"></i>
                        Tout désélectionner
                      </button>
                    </div>
                    <button 
                      type="button" 
                      className="btn btn-success"
                      onClick={handleAttachStocks}
                      disabled={selectedStocks.length === 0 || loading}
                    >
                      <i className="pi pi-plus-circle me-2"></i>
                      Assigner les stocks sélectionnés ({selectedStocks.length})
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="pi pi-check" style={{ fontSize: "3rem" }}></i>
                  <p className="mt-2">Tous les stocks sont déjà assignés à cet utilisateur</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Detach Stock Modal */}
      {detachModal.show && (
        <>
          <div className="modal show d-block" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="pi pi-exclamation-triangle me-2"></i>
                    Confirmer la désassignation
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() =>
                      setDetachModal({ show: false, stockId: null, stockName: "" })
                    }
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Êtes-vous sûr de vouloir désassigner le stock 
                    <strong> "{detachModal.stockName}"</strong> de cet utilisateur ?
                  </p>
                  <div className="alert alert-info mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>Note :</strong> Le stock redeviendra disponible pour 
                    d'autres assignations.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setDetachModal({ show: false, stockId: null, stockName: "" })
                    }
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-warning"
                    onClick={() => handleDetachStock(detachModal.stockId)}
                  >
                    <i className="pi pi-times-circle me-1"></i>
                    Désassigner
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop show"
            onClick={() => setDetachModal({ show: false, stockId: null, stockName: "" })}
          ></div>
        </>
      )}
    </div>
  );
};

export default UserStocksScreen;