import React, { useState, useEffect, useRef } from "react";
import { Toast } from "primereact/toast";
import ApiService from "../../services/api.js";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer.js";
import { API_CONFIG } from "../../services/config.js";

const UserShowScreen = () => {
  const [user, setUser] = useState(null);
  const [deleteModal, setDeleteModal] = useState({
    show: false,
    userId: null,
  });
  const toast = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const dispatch = useDispatch();
  const { data, loading } = useSelector((state) => state.apiData);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  useEffect(() => {
    if (data[`user${id}`]) {
      setUser(data[`user${id}`]);
    }
  }, [data]);

  async function loadUser() {
    try {
      dispatch(
        fetchApiData({
          url: `${API_CONFIG.ENDPOINTS.USERS}/${id}`,
          itemKey: `user${id}`,
        })
      );
    } catch (error) {
      showToast("error", error.message);
    }
  }

  const handleDeleteUser = async (userId) => {
    try {
      const response = await ApiService.delete(`/api/users/${userId}`);
      if (response.success) {
        showToast("success", "Utilisateur supprimé avec succès");
        navigate("/users");
      } else {
        showToast("error", response.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      showToast("error", error.message);
    }
    setDeleteModal({ show: false, userId: null });
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
    return d.toLocaleDateString("fr-FR") + " à " + d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateOnly = (date) => {
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

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-success",
      inactive: "bg-secondary",
      suspended: "bg-danger",
    };
    return colors[status?.toLowerCase()] || "bg-secondary";
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
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

      {/* Actions Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0 text-gray-800">
            <i className="pi pi-user me-2"></i>
            Profil Utilisateur
          </h1>
        </div>
        <div className="btn-group">
          <button 
            className="btn btn-secondary"
            onClick={() => navigate("/users")}
          >
            <i className="pi pi-arrow-left me-2"></i>
            Retour
          </button>
          <button 
            className="btn btn-info"
            onClick={() => navigate(`/users/${user.id}/stocks`)}
          >
            <i className="pi pi-box me-2"></i>
            Gestion des Stocks
          </button>
          <button 
            className="btn btn-warning"
            onClick={() => navigate(`/users/${user.id}/edit`)}
          >
            <i className="pi pi-pencil me-2"></i>
            Modifier
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setDeleteModal({ show: true, userId: user.id })}
          >
            <i className="pi pi-trash me-2"></i>
            Supprimer
          </button>
        </div>
      </div>

      <div className="row">
        {/* Profile Card */}
        <div className="col-md-4">
          <div className="card shadow-sm mb-4">
            <div className="card-body text-center">
              {user.profile_photo ? (
                <img 
                  src={user.profile_photo} 
                  alt="Photo de profil"
                  className="rounded-circle mb-3"
                  width="120" 
                  height="120"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div 
                  className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white mx-auto mb-3"
                  style={{ width: "120px", height: "120px" }}
                >
                  <i className="pi pi-user" style={{ fontSize: "3rem" }}></i>
                </div>
              )}

              <h4 className="mb-1">{user.first_name} {user.last_name}</h4>
              <p className="text-muted mb-2">{user.email}</p>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className={`badge ${getRoleColor(user.role)}`}>
                  {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
                </span>
                <span className={`badge ${getStatusColor(user.status)}`}>
                  {user.status === "active" ? "Actif" : 
                   user.status === "inactive" ? "Inactif" : "Suspendu"}
                </span>
              </div>

              {user.phone && (
                <p className="mb-1">
                  <i className="pi pi-phone text-muted me-1"></i>
                  {user.phone}
                </p>
              )}

              {user.last_login_at && (
                <small className="text-muted">
                  <i className="pi pi-clock text-muted me-1"></i>
                  Dernière connexion: {formatDate(user.last_login_at)}
                </small>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-warning text-dark">
              <h6 className="card-title mb-0">
                <i className="pi pi-shield me-2"></i>
                Sécurité
              </h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Email vérifié</span>
                {user.email_verified_at ? (
                  <i className="pi pi-check-circle text-success"></i>
                ) : (
                  <i className="pi pi-times-circle text-danger"></i>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span>Authentification 2FA</span>
                {user.two_factor_enabled ? (
                  <i className="pi pi-check-circle text-success"></i>
                ) : (
                  <i className="pi pi-times-circle text-muted"></i>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span>Changement de mot de passe requis</span>
                {user.must_change_password ? (
                  <i className="pi pi-exclamation-triangle text-warning"></i>
                ) : (
                  <i className="pi pi-check-circle text-success"></i>
                )}
              </div>
            </div>
          </div>

          {/* Stocks Assignment Card */}
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-info text-white">
              <h6 className="card-title mb-0">
                <i className="pi pi-box me-2"></i>
                Stocks Assignés
              </h6>
            </div>
            <div className="card-body">
              {user.stocks && user.stocks.length > 0 ? (
                <>
                  <div className="mb-3">
                    <strong>{user.stocks.length}</strong> stock(s) assigné(s)
                  </div>
                  {user.stocks.slice(0, 3).map((stock, index) => (
                    <div key={index} className="d-flex align-items-center mb-2">
                      <i className="pi pi-box text-info me-2"></i>
                      <span>{stock.name}</span>
                    </div>
                  ))}
                  {user.stocks.length > 3 && (
                    <small className="text-muted">
                      et {user.stocks.length - 3} autre(s)...
                    </small>
                  )}
                </>
              ) : (
                <p className="text-muted mb-0">Aucun stock assigné</p>
              )}

              <div className="mt-3">
                <button 
                  className="btn btn-sm btn-outline-info w-100"
                  onClick={() => navigate(`/users/${user.id}/stocks`)}
                >
                  <i className="pi pi-cog me-1"></i>
                  Gérer les stocks
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="col-md-8">
          <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
              <h6 className="card-title mb-0">
                <i className="pi pi-info-circle me-2"></i>
                Informations détaillées
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Informations personnelles</h6>

                  <div className="mb-3">
                    <strong>Nom complet:</strong><br />
                    {user.first_name} {user.last_name}
                  </div>

                  <div className="mb-3">
                    <strong>Email:</strong><br />
                    {user.email}
                  </div>

                  {user.phone && (
                    <div className="mb-3">
                      <strong>Téléphone:</strong><br />
                      {user.phone}
                    </div>
                  )}

                  {user.date_of_birth && (
                    <div className="mb-3">
                      <strong>Date de naissance:</strong><br />
                      {formatDateOnly(user.date_of_birth)}
                      {calculateAge(user.date_of_birth) && (
                        <span> ({calculateAge(user.date_of_birth)} ans)</span>
                      )}
                    </div>
                  )}

                  {user.gender && (
                    <div className="mb-3">
                      <strong>Genre:</strong><br />
                      {user.gender.charAt(0).toUpperCase() + user.gender.slice(1)}
                    </div>
                  )}

                  {user.address && (
                    <div className="mb-3">
                      <strong>Adresse:</strong><br />
                      {user.address}
                    </div>
                  )}
                </div>

                <div className="col-md-6">
                  <h6 className="text-muted mb-3">Informations professionnelles</h6>

                  <div className="mb-3">
                    <strong>Rôle:</strong><br />
                    <span className={`badge ${getRoleColor(user.role)}`}>
                      {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "N/A"}
                    </span>
                  </div>

                  <div className="mb-3">
                    <strong>Statut:</strong><br />
                    <span className={`badge ${getStatusColor(user.status)}`}>
                      {user.status === "active" ? "Actif" : 
                       user.status === "inactive" ? "Inactif" : "Suspendu"}
                    </span>
                  </div>

                  {user.company && (
                    <div className="mb-3">
                      <strong>Entreprise:</strong><br />
                      <i className="pi pi-building text-info me-1"></i>
                      {user.company.name}
                    </div>
                  )}

                  {user.agency && (
                    <div className="mb-3">
                      <strong>Agence:</strong><br />
                      <i className="pi pi-map-marker text-warning me-1"></i>
                      {user.agency.name}
                    </div>
                  )}

                  {user.created_by && (
                    <div className="mb-3">
                      <strong>Créé par:</strong><br />
                      <i className="pi pi-user text-success me-1"></i>
                      {user.created_by.first_name} {user.created_by.last_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h6 className="card-title mb-0">
                <i className="pi pi-clock me-2"></i>
                Historique
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <strong>Créé le:</strong><br />
                  <small className="text-muted">
                    {formatDate(user.created_at)}
                  </small>
                </div>
                <div className="col-md-6">
                  <strong>Dernière modification:</strong><br />
                  <small className="text-muted">
                    {formatDate(user.updated_at)}
                  </small>
                </div>
              </div>

              {user.last_login_at && (
                <>
                  <hr />
                  <div className="row">
                    <div className="col-12">
                      <strong>Dernière connexion:</strong><br />
                      <small className="text-muted">
                        {formatDate(user.last_login_at)}
                      </small>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
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
                    <i className="pi pi-exclamation-triangle me-2"></i>Confirmer
                    la suppression
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() =>
                      setDeleteModal({ show: false, userId: null })
                    }
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette
                    action est irréversible.
                  </p>
                  <div className="alert alert-warning mt-3">
                    <i className="pi pi-info-circle me-2"></i>
                    <strong>Attention :</strong> La suppression de cet
                    utilisateur pourrait affecter les données associées.
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setDeleteModal({ show: false, userId: null })
                    }
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

export default UserShowScreen;