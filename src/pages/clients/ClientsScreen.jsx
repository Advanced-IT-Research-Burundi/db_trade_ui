import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';

const ClientScreen = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedClient, setSelectedClient] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const toast = React.useRef(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const response = await ApiService.get('/api/clients');
      
      if (response.success) {
        setClients(response.data.data || []);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.data.message || 'Erreur lors du chargement',
          life: 3000
        });
      }
    } catch (error) {
      console.log('Erreur de connexion: ' + error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur de connexion',
        detail: error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteClient = (client) => {
    setSelectedClient(client);
    setDeleteDialog(true);
  };

  const deleteClient = async () => {
    try {
      const response = await ApiService.delete(`/api/clients/${selectedClient.id}`);
      
      if (response.success) {
        loadClients();
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Client supprimé avec succès',
          life: 3000
        });
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
        summary: 'Erreur de connexion',
        detail: error.message,
        life: 3000
      });
    } finally {
      setDeleteDialog(false);
      setSelectedClient(null);
    }
  };

  const getClientName = (client) => {
    if (client.patient_type === 'morale') {
      return client.societe || 'Société non définie';
    }
    return `${client.first_name || ''} ${client.last_name || ''}`.trim() || client.name || 'Nom non défini';
  };

  const getClientContact = (client) => {
    const phone = client.phone ? `📞 ${client.phone}` : '';
    const email = client.email ? `✉️ ${client.email}` : '';
    return [phone, email].filter(Boolean).join(' | ') || 'Aucun contact';
  };

  const filteredClients = clients.filter(client => {
    if (!globalFilter) return true;
    
    const searchTerm = globalFilter.toLowerCase();
    const clientName = getClientName(client).toLowerCase();
    const clientType = client.patient_type === 'morale' ? 'personne morale' : 'personne physique';
    const nif = client.nif?.toLowerCase() || '';
    const phone = client.phone?.toLowerCase() || '';
    const email = client.email?.toLowerCase() || '';
    
    return clientName.includes(searchTerm) || 
           clientType.includes(searchTerm) || 
           nif.includes(searchTerm) || 
           phone.includes(searchTerm) || 
           email.includes(searchTerm);
  });

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            {/* Toolbar */}
            <div className="card-header bg-white border-bottom">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <div className="d-flex align-items-center">
                    <h4 className="m-0 me-3">
                      <i className="pi pi-users me-2 text-primary"></i>
                      Liste des clients
                    </h4>
                    <span className="badge bg-primary">
                      {filteredClients.length} client(s)
                    </span>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="d-flex justify-content-end gap-2">
                    <div className="position-relative">
                      <i className="pi pi-search position-absolute top-50 start-0 translate-middle-y ms-2 text-muted"></i>
                      <input
                        type="text"
                        className="form-control ps-4"
                        placeholder="Rechercher..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="d-flex gap-2 mt-3">
                <button
                  className="btn btn-success"
                  onClick={() => navigate('/clients/create')}
                >
                  <i className="pi pi-plus me-2"></i>
                  Nouveau client
                </button>
                <button
                  className="btn btn-info"
                  onClick={loadClients}
                  disabled={loading}
                >
                  <i className={`pi ${loading ? 'pi-spin pi-spinner' : 'pi-refresh'} me-2`}></i>
                  Actualiser
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="card-body p-0">
              {loading ? (
                <div className="text-center py-5">
                  <i className="pi pi-spin pi-spinner text-primary" style={{ fontSize: '2rem' }}></i>
                  <div className="mt-3">Chargement des clients...</div>
                </div>
              ) : filteredClients.length === 0 ? (
                <div className="text-center py-5">
                  <i className="pi pi-users text-muted" style={{ fontSize: '3rem' }}></i>
                  <div className="mt-3 text-muted">
                    {globalFilter ? 'Aucun client trouvé pour votre recherche' : 'Aucun client trouvé'}
                  </div>
                  {!globalFilter && (
                    <button
                      className="btn btn-primary mt-3"
                      onClick={() => navigate('/clients/create')}
                    >
                      <i className="pi pi-plus me-2"></i>
                      Créer le premier client
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-striped mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '80px' }}>ID</th>
                        <th>Type</th>
                        <th>Nom/Société</th>
                        <th>NIF</th>
                        <th>Contact</th>
                        {/* <th>Solde</th> */}
                        <th style={{ width: '150px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClients.map(client => (
                        <tr key={client.id}>
                          <td>
                            <span className="badge bg-secondary">{client.id}</span>
                          </td>
                          <td>
                            <span className={`badge ${client.patient_type === 'morale' ? 'bg-info' : 'bg-success'}`}>
                              {client.patient_type === 'morale' ? (
                                <>
                                  <i className="pi pi-building me-1"></i>
                                  Morale
                                </>
                              ) : (
                                <>
                                  <i className="pi pi-user me-1"></i>
                                  Physique
                                </>
                              )}
                            </span>
                          </td>
                          <td>
                            <div className="fw-bold">{getClientName(client)}</div>
                            {client.patient_type === 'morale' && client.name && (
                              <small className="text-muted">Contact: {client.name}</small>
                            )}
                          </td>
                          <td>
                            {client.nif ? (
                              <code className="text-dark">{client.nif}</code>
                            ) : (
                              <em className="text-muted">Non défini</em>
                            )}
                          </td>
                          <td>
                            <small className="text-muted">{getClientContact(client)}</small>
                          </td>
                          {/* <td> */}
                            {/* <span className={`badge ${client.balance >= 0 ? 'bg-success' : 'bg-danger'}`}>
                              {new Intl.NumberFormat('fr-FR', { 
                                style: 'currency', 
                                currency: 'FrBU', 
                              }).format(client.balance)}
                            </span> */}
                          {/* </td> */}
                          <td>
                            <div className="btn-group btn-group-sm">
                              <button
                                className="btn btn-outline-info"
                                title="Voir"
                                onClick={() => navigate(`/clients/${client.id}`)}
                              >
                                <i className="pi pi-eye"></i>
                              </button>
                              <button
                                className="btn btn-outline-success"
                                title="Modifier"
                                onClick={() => navigate(`/clients/${client.id}/edit`)}
                              >
                                <i className="pi pi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                title="Supprimer"
                                onClick={() => confirmDeleteClient(client)}
                              >
                                <i className="pi pi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      {deleteDialog && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="pi pi-exclamation-triangle text-warning me-2"></i>
                  Confirmer la suppression
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteDialog(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Êtes-vous sûr de vouloir supprimer le client <strong>"{getClientName(selectedClient)}"</strong> ?</p>
                <div className="alert alert-warning">
                  <i className="pi pi-exclamation-triangle me-2"></i>
                  Cette action est irréversible.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteDialog(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={deleteClient}
                >
                  <i className="pi pi-trash me-2"></i>
                  Oui, supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop pour modal */}
      {deleteDialog && (
        <div 
          className="modal-backdrop fade show"
          onClick={() => setDeleteDialog(false)}
        ></div>
      )}
    </div>
  );
};

export default ClientScreen;