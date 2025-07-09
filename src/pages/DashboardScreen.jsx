import React from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';

const DashboardScreen = () => {
  const statsCards = [
    {
      title: 'Ventes du jour',
      value: '125,000 FCFA',
      icon: 'pi pi-dollar',
      color: '#28a745'
    },
    {
      title: 'Produits en stock',
      value: '450',
      icon: 'pi pi-box',
      color: '#17a2b8'
    },
    {
      title: 'Clients',
      value: '89',
      icon: 'pi pi-users',
      color: '#ffc107'
    },
    {
      title: 'Commandes',
      value: '23',
      icon: 'pi pi-shopping-cart',
      color: '#dc3545'
    }
  ];

  return (
    <div className="dashboard-container">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="h3 mb-3" style={{ color: 'var(--primary-blue)' }}>
            Tableau de bord
          </h1>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="row mb-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-3">
            <Card className="h-100 shadow-sm">
              <div className="d-flex align-items-center">
                <div 
                  className="flex-shrink-0 rounded-circle d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '60px', 
                    height: '60px', 
                    backgroundColor: stat.color + '20',
                    color: stat.color
                  }}
                >
                  <i className={`${stat.icon} text-2xl`}></i>
                </div>
                <div className="ms-3">
                  <h6 className="mb-1 text-muted">{stat.title}</h6>
                  <h4 className="mb-0" style={{ color: 'var(--primary-blue)' }}>
                    {stat.value}
                  </h4>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="row mb-4">
        <div className="col-12">
          <Card title="Actions rapides">
            <div className="d-flex flex-wrap gap-2">
              <Button 
                label="Nouvelle vente" 
                icon="pi pi-plus" 
                className="me-2 mb-2"
                style={{ backgroundColor: 'var(--primary-blue)', border: 'none' }}
              />
              <Button 
                label="Ajouter produit" 
                icon="pi pi-shopping-bag" 
                className="me-2 mb-2"
                outlined
                style={{ color: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }}
              />
              <Button 
                label="Gérer stock" 
                icon="pi pi-box" 
                className="me-2 mb-2"
                outlined
                style={{ color: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }}
              />
              <Button 
                label="Nouveau client" 
                icon="pi pi-user-plus" 
                className="me-2 mb-2"
                outlined
                style={{ color: 'var(--primary-blue)', borderColor: 'var(--primary-blue)' }}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Activité récente */}
      <div className="row">
        <div className="col-lg-8">
          <Card title="Activité récente">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex align-items-center">
                <i className="pi pi-shopping-cart text-success me-3"></i>
                <div>
                  <h6 className="mb-1">Nouvelle commande #CMD-001</h6>
                  <small className="text-muted">Il y a 5 minutes</small>
                </div>
              </div>
              <div className="list-group-item d-flex align-items-center">
                <i className="pi pi-user text-primary me-3"></i>
                <div>
                  <h6 className="mb-1">Nouveau client : Jean Dupont</h6>
                  <small className="text-muted">Il y a 15 minutes</small>
                </div>
              </div>
              <div className="list-group-item d-flex align-items-center">
                <i className="pi pi-exclamation-triangle text-warning me-3"></i>
                <div>
                  <h6 className="mb-1">Stock faible : Produit ABC</h6>
                  <small className="text-muted">Il y a 1 heure</small>
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="col-lg-4">
          <Card title="Tâches à faire">
            <div className="list-group list-group-flush">
              <div className="list-group-item d-flex align-items-center">
                <input className="form-check-input me-3" type="checkbox" />
                <span>Vérifier les commandes en attente</span>
              </div>
              <div className="list-group-item d-flex align-items-center">
                <input className="form-check-input me-3" type="checkbox" />
                <span>Mettre à jour les prix</span>
              </div>
              <div className="list-group-item d-flex align-items-center">
                <input className="form-check-input me-3" type="checkbox" />
                <span>Contacter les fournisseurs</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;