import React, { useState, useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import RapportHeader from './RapportHeader.jsx';

const StatCard = ({ icon, title, value, color, loading, subtitle }) => {
  const intl = useIntl();
  return (
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
                  <span className="visually-hidden">{intl.formatMessage({id: "reports.loading"})}</span>
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
};

const ReportsScreen = () => {
  const intl = useIntl();
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
        showToast('error', response.message || intl.formatMessage({id: "reports.loadingError"}));
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
      
      showToast('success', intl.formatMessage({id: "reports.exportedSuccessfully"}));
    } catch (error) {
      showToast('error', intl.formatMessage({id: "reports.exportError"}) + ': ' + error.message);
    } finally {
      setExportLoading(false);
    }
  };

  const showToast = (severity, detail) => {
    toast.current?.show({ 
      severity, 
      summary: severity === 'error' ? intl.formatMessage({id: "reports.error"}) : intl.formatMessage({id: "reports.success"}), 
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
    { key: 'overview', label: intl.formatMessage({id: "reports.overview"}), icon: 'chart-line' },
    { key: 'sales', label: intl.formatMessage({id: "reports.salesReport"}), icon: 'shopping-cart' },
    { key: 'purchases', label: intl.formatMessage({id: "reports.purchasesReport"}), icon: 'shopping-bag' },
    { key: 'inventory', label: intl.formatMessage({id: "reports.inventoryReport"}), icon: 'warehouse' },
    { key: 'financial', label: intl.formatMessage({id: "reports.financialReport"}), icon: 'money-bill' },
    { key: 'customers', label: intl.formatMessage({id: "reports.customersReport"}), icon: 'users' },
    { key: 'suppliers', label: intl.formatMessage({id: "reports.suppliersReport"}), icon: 'truck' }
  ];

  const renderOverviewReport = () => (
    <div className="row">
      <div className="col-12 mb-4">
        <h5 className="text-primary">
          <i className="pi pi-chart-line me-2"></i>{intl.formatMessage({id: "reports.overview"})}
        </h5>
      </div>
      
      <div className="col-12 mt-4">
        <div className="row">
          <div className="col-md-6">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h6 className="mb-0">
                  <i className="pi pi-chart-bar me-2"></i>{intl.formatMessage({id: "reports.top5Products"})}
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
                          <small className="text-muted">{product.quantity} {intl.formatMessage({id: "reports.sold"})}</small>
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
                  <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "reports.stockAlerts"})}
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
          <i className="pi pi-shopping-cart me-2"></i>{intl.formatMessage({id: "reports.salesReport"})}
        </h5>
      </div>
      
      <StatCard 
        icon="shopping-cart" 
        title={intl.formatMessage({id: "reports.totalSales"})} 
        value={formatCurrency(reportData.total_amount)} 
        color="success" 
        loading={loading}
      />
      <StatCard 
        icon="file-text" 
        title={intl.formatMessage({id: "reports.salesCount"})} 
        value={reportData.total_count || 0} 
        color="info" 
        loading={loading}
      />
      <StatCard 
        icon="money-bill" 
        title={intl.formatMessage({id: "reports.averageAmount"})} 
        value={formatCurrency(reportData.average_amount)} 
        color="warning" 
        loading={loading}
      />
      <StatCard 
        icon="check-circle" 
        title={intl.formatMessage({id: "reports.paidSales"})} 
        value={reportData.paid_sales || 0} 
        color="primary" 
        loading={loading}
      />

      <div className="col-12 mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="pi pi-chart-line me-2"></i>{intl.formatMessage({id: "reports.salesDetails"})}
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
                      <th>{intl.formatMessage({id: "reports.date"})}</th>
                      <th>{intl.formatMessage({id: "reports.client"})}</th>
                      <th>{intl.formatMessage({id: "reports.amount"})}</th>
                      <th>{intl.formatMessage({id: "reports.status"})}</th>
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
                            {sale.paid ? intl.formatMessage({id: "reports.paid"}) : intl.formatMessage({id: "reports.pending"})}
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
          <i className="pi pi-money-bill me-2"></i>{intl.formatMessage({id: "reports.financialReport"})}
        </h5>
      </div>
      
      <StatCard 
        icon="arrow-up" 
        title={intl.formatMessage({id: "reports.revenue"})} 
        value={formatCurrency(reportData.total_revenue)} 
        color="success" 
        loading={loading}
      />
      <StatCard 
        icon="arrow-down" 
        title={intl.formatMessage({id: "reports.expenses"})} 
        value={formatCurrency(reportData.total_expenses)} 
        color="danger" 
        loading={loading}
      />
      <StatCard 
        icon="chart-line" 
        title={intl.formatMessage({id: "reports.netProfit"})} 
        value={formatCurrency(reportData.net_profit)} 
        color="info" 
        loading={loading}
      />
      <StatCard 
        icon="percentage" 
        title={intl.formatMessage({id: "reports.profitMargin"})} 
        value={`${reportData.profit_margin || 0}%`} 
        color="warning" 
        loading={loading}
      />

      <div className="col-12 mt-4">
        <div className="card shadow-sm">
          <div className="card-header bg-light">
            <h6 className="mb-0">
              <i className="pi pi-wallet me-2"></i>{intl.formatMessage({id: "reports.cashFlow"})}
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
                  <h6 className="text-success">{intl.formatMessage({id: "reports.inflows"})}</h6>
                  <ul className="list-unstyled">
                    <li>{intl.formatMessage({id: "reports.salesInflow"})}: {formatCurrency(reportData.cash_flow?.sales || 0)}</li>
                    <li>{intl.formatMessage({id: "reports.otherIncome"})}: {formatCurrency(reportData.cash_flow?.other_income || 0)}</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-danger">{intl.formatMessage({id: "reports.outflows"})}</h6>
                  <ul className="list-unstyled">
                    <li>{intl.formatMessage({id: "reports.purchasesOutflow"})}: {formatCurrency(reportData.cash_flow?.purchases || 0)}</li>
                    <li>{intl.formatMessage({id: "reports.expensesOutflow"})}: {formatCurrency(reportData.cash_flow?.expenses || 0)}</li>
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
            <h5>{intl.formatMessage({id: "reports.reportInDevelopment"})}</h5>
            <p className="text-muted">{intl.formatMessage({id: "reports.reportAvailableSoon"})}</p>
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
                <i className="pi pi-chart-bar me-2"></i>{intl.formatMessage({id: "reports.title"})}
              </h2>
              <p className="text-muted mb-0">
                {intl.formatMessage({id: "reports.period"})}: {new Date(dateRange.start_date).toLocaleDateString('fr-FR')} - {new Date(dateRange.end_date).toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-outline-primary" 
                onClick={loadReportData} 
                disabled={loading}
              >
                <i className="pi pi-refresh me-1"></i>
                {loading ? intl.formatMessage({id: "reports.refreshing"}) : intl.formatMessage({id: "reports.refresh"})}
              </button>
              <button 
                className="btn btn-success" 
                onClick={exportToPDF}
                disabled={exportLoading}
              >
                <i className="pi pi-file-pdf me-1"></i>
                {exportLoading ? intl.formatMessage({id: "reports.exporting"}) : intl.formatMessage({id: "reports.exportPDF"})}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-light">
          <h6 className="mb-0">
            <i className="pi pi-filter me-2"></i>{intl.formatMessage({id: "reports.filtersAndSettings"})}
          </h6>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "reports.reportType"})}</label>
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
              <label className="form-label">{intl.formatMessage({id: "reports.startDate"})}</label>
              <input 
                type="date" 
                className="form-control" 
                value={dateRange.start_date} 
                onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))} 
              />
            </div>
            
            <div className="col-md-2">
              <label className="form-label">{intl.formatMessage({id: "reports.endDate"})}</label>
              <input 
                type="date" 
                className="form-control" 
                value={dateRange.end_date} 
                onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))} 
              />
            </div>
            
            <div className="col-md-3">
              <label className="form-label">{intl.formatMessage({id: "reports.agency"})}</label>
              <select 
                className="form-select" 
                value={selectedAgency} 
                onChange={(e) => setSelectedAgency(e.target.value)}
              >
                <option value="">{intl.formatMessage({id: "reports.allAgencies"})}</option>
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
                <i className="pi pi-search me-1"></i>{intl.formatMessage({id: "reports.generate"})}
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