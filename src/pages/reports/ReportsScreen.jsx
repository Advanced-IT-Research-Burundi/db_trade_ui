import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import RapportHeader from './RapportHeader.jsx';

const StatCard = ({ icon, title, value, color, loading, subtitle }) => (
  <div className="col-lg-3 col-md-6 mb-4">
    <div className={`card bg-${color} text-white shadow-sm h-100`}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="card-title mb-1">{title}</h6>
            <h4 className="mb-0">{loading ? '...' : value}</h4>
            {subtitle && <small className="opacity-75">{subtitle}</small>}
          </div>
          <div className="align-self-center">
            {loading ? (
              <div className="spinner-border spinner-border-sm text-white" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            ) : (
              <i className={`pi pi-${icon} display-6`}></i>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ReportsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({});
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState({
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    loadAgencies();
    loadReportData();
  }, [selectedReport, dateRange, selectedAgency]);

  const loadAgencies = async () => {
    try {
      const response = await ApiService.get('/api/agencies');
      if (response.success) {
        setAgencies(response.data.agencies?.data || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des agences:', error);
    }
  };

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params = {
        report_type: selectedReport,
        ...dateRange,
        agency_id: selectedAgency
      };
      const response = await ApiService.get('/api/reports', params);
      
      if (response.success) {
        setReportData(response.data);
      } else {
        showToast('error', response.message || 'Erreur lors du chargement des données');
      }
    } catch (error) {
      showToast('error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToPDF = async () => {
    try {
      setExportLoading(true);
      const params = {
        report_type: selectedReport,
        ...dateRange,
        agency_id: selectedAgency
      };
      
      const response = await ApiService.get('/api/reports/export', params, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rapport_${selectedReport}_${dateRange.start_date}_${dateRange.end_date}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast('success', 'Rapport exporté avec succès');
    } catch (error) {
      showToast('error', 'Erreur lors de l\'export du rapport: '+error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? 'Erreur' : 'Succès', 
      detail, 
      life: 3000 
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0) + ' FBU';
  };

  const reportTypes = [
    { key: 'overview', label: 'Vue d\'ensemble', icon: 'chart-line' },
    { key: 'sales', label: 'Rapport des ventes', icon: 'shopping-cart' },
    { key: 'purchases', label: 'Rapport des achats', icon: 'shopping-bag' },
    { key: 'inventory', label: 'Rapport d\'inventaire', icon: 'warehouse' },
    { key: 'financial', label: 'Rapport financier', icon: 'money-bill' },
    { key: 'customers', label: 'Rapport clients', icon: 'users' },
    { key: 'suppliers', label: 'Rapport fournisseurs', icon: 'truck' }
  ];

  const renderOverviewReport = () => (
    <div className="row">
      <div className="col-12 mb-4">
        <h5 className="text-primary">
          <i className="pi pi-chart-line me-2"></i>Vue d'ensemble
        </h5>
      </div>
      
      {/* <StatCard 
        icon="shopping-cart" 
        title="Chiffre d'affaires" 
        value={formatCurrency(reportData.total_sales)} 
        color="success" 
        loading={loading}
        subtitle={`${reportData.sales_count || 0} ventes`}
      />
      <StatCard 
        icon="shopping-bag" 
        title="Total achats" 
        value={formatCurrency(reportData.total_purchases)} 
        color="info" 
        loading={loading}
        subtitle={`${reportData.purchases_count || 0} achats`}
      />
      <StatCard 
        icon="money-bill" 
        title="Bénéfices" 
        value={formatCurrency(reportData.profit)} 
        color="warning" 
        loading={loading}
        subtitle="Estimation"
      />
      <StatCard 
        icon="users" 
        title="Clients actifs" 
        value={reportData.active_customers || 0} 
        color="primary" 
        loading={loading}
        subtitle="Ce mois"
      /> */}

      <div className="col-12 mt-4">
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">
                  <i className="pi pi-chart-bar me-2"></i>Top 5 Produits
                </h6>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {(reportData.top_products || []).map((product, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{product.name}</strong>
                          <br />
                          <small className="text-muted">{product.quantity} vendus</small>
                        </div>
                        <span className="badge bg-primary">{formatCurrency(product.total_sales)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">
                  <i className="pi pi-exclamation-triangle me-2"></i>Alertes Stock
                </h6>
              </div>
              <div className="card-body">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"></div>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {(reportData.low_stock_alerts || []).map((alert, index) => (
                      <div key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{alert.product_name}</strong>
                          <br />
                          <small className="text-muted">{alert.stock_name}</small>
                        </div>
                        <span className={`badge ${alert.quantity <= alert.alert_threshold ? 'bg-danger' : 'bg-warning'}`}>
                          {alert.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSalesReport = () => (
    <div className="row">
      <div className="col-12 mb-4">
        <h5 className="text-primary">
          <i className="pi pi-shopping-cart me-2"></i>Rapport des ventes
        </h5>
      </div>
      
      <StatCard 
        icon="shopping-cart" 
        title="Total ventes" 
        value={formatCurrency(reportData.total_amount)} 
        color="success" 
        loading={loading}
      />
      <StatCard 
        icon="file-text" 
        title="Nombre ventes" 
        value={reportData.total_count || 0} 
        color="info" 
        loading={loading}
      />
      <StatCard 
        icon="money-bill" 
        title="Montant moyen" 
        value={formatCurrency(reportData.average_amount)} 
        color="warning" 
        loading={loading}
      />
      <StatCard 
        icon="check-circle" 
        title="Ventes payées" 
        value={reportData.paid_sales || 0} 
        color="primary" 
        loading={loading}
      />

      <div className="col-12 mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="pi pi-chart-line me-2"></i>Détails des ventes
            </h6>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Client</th>
                      <th>Montant</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportData.sales_details || []).map((sale, index) => (
                      <tr key={index}>
                        <td>{new Date(sale.sale_date).toLocaleDateString('fr-FR')}</td>
                        <td>{sale.client_name}</td>
                        <td>{formatCurrency(sale.total_amount)}</td>
                        <td>
                          <span className={`badge ${sale.paid ? 'bg-success' : 'bg-warning'}`}>
                            {sale.paid ? 'Payé' : 'En attente'}
                          </span>
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
  );

  const renderFinancialReport = () => (
    <div className="row">
      <div className="col-12 mb-4">
        <h5 className="text-primary">
          <i className="pi pi-money-bill me-2"></i>Rapport financier
        </h5>
      </div>
      
      <StatCard 
        icon="arrow-up" 
        title="Revenus" 
        value={formatCurrency(reportData.total_revenue)} 
        color="success" 
        loading={loading}
      />
      <StatCard 
        icon="arrow-down" 
        title="Dépenses" 
        value={formatCurrency(reportData.total_expenses)} 
        color="danger" 
        loading={loading}
      />
      <StatCard 
        icon="chart-line" 
        title="Bénéfice net" 
        value={formatCurrency(reportData.net_profit)} 
        color="info" 
        loading={loading}
      />
      <StatCard 
        icon="percentage" 
        title="Marge bénéficiaire" 
        value={`${reportData.profit_margin || 0}%`} 
        color="warning" 
        loading={loading}
      />

      <div className="col-12 mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="pi pi-wallet me-2"></i>Flux de trésorerie
            </h6>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            ) : (
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-success">Entrées</h6>
                  <ul className="list-unstyled">
                    <li>Ventes: {formatCurrency(reportData.cash_flow?.sales || 0)}</li>
                    <li>Autres revenus: {formatCurrency(reportData.cash_flow?.other_income || 0)}</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-danger">Sorties</h6>
                  <ul className="list-unstyled">
                    <li>Achats: {formatCurrency(reportData.cash_flow?.purchases || 0)}</li>
                    <li>Dépenses: {formatCurrency(reportData.cash_flow?.expenses || 0)}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'sales':
        return renderSalesReport();
      case 'financial':
        return renderFinancialReport();
      default:
        return (
          <div className="text-center py-5">
            <i className="pi pi-file-text display-4 text-muted mb-3"></i>
            <h5>Rapport en développement</h5>
            <p className="text-muted">Ce type de rapport sera bientôt disponible.</p>
          </div>
        );
    }
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
        <RapportHeader />
          <div className="d-flex justify-content-between align-items-center">
          
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-chart-bar me-2"></i>Rapports et Analyses
              </h2>
              <p className="text-muted mb-0">
                Période: {new Date(dateRange.start_date).toLocaleDateString('fr-FR')} - {new Date(dateRange.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={loadReportData} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? 'Actualisation...' : 'Actualiser'}
              </button>
              <button 
                className="btn btn-success" 
                onClick={exportToPDF}
                disabled={exportLoading}
              >
                <i className="pi pi-file-pdf me-1"></i>
                {exportLoading ? 'Export...' : 'Export PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>Filtres et paramètres
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">Type de rapport</label>
              <select 
                className="form-select" 
                value={selectedReport} 
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                {reportTypes.map(report => (
                  <option key={report.key} value={report.key}>
                    {report.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Date début</label>
              <input 
                type="date" 
                className="form-control" 
                value={dateRange.start_date} 
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))} 
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">Date fin</label>
              <input 
                type="date" 
                className="form-control" 
                value={dateRange.end_date} 
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))} 
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">Agence</label>
              <select 
                className="form-select" 
                value={selectedAgency} 
                onChange={(e) => setSelectedAgency(e.target.value)}
              >
                <option value="">Toutes les agences</option>
                {agencies.map(agency => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="col-md-2 d-flex align-items-end">
              <button 
                className="btn btn-primary w-100" 
                onClick={loadReportData}
                disabled={loading}
              >
                <i className="pi pi-search me-1"></i>Générer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="card shadow-sm border-0">
        <div className="card-body">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};

export default ReportsScreen;