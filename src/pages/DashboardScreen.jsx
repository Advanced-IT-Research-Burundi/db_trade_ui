import React, { useState, useEffect, useRef } from 'react';
import { Toast } from 'primereact/toast';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import ApiService from '../services/api.js';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApiData } from '../stores/slicer/apiDataSlicer.js';
import { useIntl } from 'react-intl';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const DashboardScreen = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [period, setPeriod] = useState('30');
  const [agencyId, setAgencyId] = useState('');
  const toast = useRef(null);
  const navigate = useNavigate();

  const dispatch = useDispatch()
  const intl = useIntl();

  const { data, loading } = useSelector((state) => ({
      data: state.apiData?.data?.DASHBOAR_DATA,
      loading: state.apiData?.loading
  }))

  useEffect(() => {
    loadDashboard();
  }, [period, agencyId]);

  useEffect(() => {
    if (data) {
      setDashboardData(data);
      }
  } , [data])

  const loadDashboard = async () => {
      try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (agencyId) params.append('agency_id', agencyId);
      dispatch(fetchApiData({url : "/api/dashboard" , itemKey : "DASHBOAR_DATA" , params : params.toString() }))
    } catch (error) {
      console.log('Erreur de connexion: ' + error.message);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur de connexion',
        detail: error.message,
        life: 3000
      });
    } 
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' FBU';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getChartData = () => {
    if (!dashboardData?.chartData) return null;
    
    return {
      labels: dashboardData.chartData.labels,
      datasets: [
        {
          label: 'Ventes (FBU)',
          data: dashboardData.chartData.sales,
          borderColor: '#2E7DB8',
          backgroundColor: 'rgba(46, 125, 184, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#2E7DB8',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Achats (FBU)',
          data: dashboardData.chartData.purchases,
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointBackgroundColor: '#e74c3c',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label + ': ' + formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  // Composant Shimmer pour le loading
  const ShimmerCard = () => (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <div className="rounded-circle bg-light" style={{ width: '50px', height: '50px' }}>
              <div className="shimmer-effect w-100 h-100 rounded-circle"></div>
            </div>
          </div>
          <div className="flex-grow-1">
            <div className="shimmer-effect mb-2" style={{ height: '16px', width: '120px' }}></div>
            <div className="shimmer-effect mb-2" style={{ height: '32px', width: '80px' }}></div>
            <div className="shimmer-effect" style={{ height: '14px', width: '100px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  const ShimmerChart = () => (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white border-0">
        <div className="d-flex justify-content-between align-items-center">
          <div className="shimmer-effect" style={{ height: '24px', width: '200px' }}></div>
          <div className="shimmer-effect" style={{ height: '32px', width: '150px' }}></div>
        </div>
      </div>
      <div className="card-body">
        <div className="shimmer-effect" style={{ height: '300px', width: '100%' }}></div>
      </div>
    </div>
  );

  const ShimmerList = ({ items = 5 }) => (
    <div className="list-group">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="list-group-item d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <div className="shimmer-effect rounded-circle" style={{ width: '40px', height: '40px' }}></div>
          </div>
          <div className="flex-grow-1">
            <div className="shimmer-effect mb-1" style={{ height: '16px', width: '70%' }}></div>
            <div className="shimmer-effect" style={{ height: '14px', width: '50%' }}></div>
          </div>
          <div className="shimmer-effect" style={{ height: '16px', width: '80px' }}></div>
        </div>
      ))}
    </div>
  );

  if (dashboardData === null && loading) {
    return (
      <div className="container-fluid">
        <style>
          {`
            .shimmer-effect {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 2s infinite;
            }
            
            @keyframes shimmer {
              0% { background-position: -200% 0; }
              100% { background-position: 200% 0; }
            }
          `}
        </style>
        
        {/* Filtres Shimmer */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex gap-3">
                <div className="shimmer-effect" style={{ height: '32px', width: '180px' }}></div>
                <div className="shimmer-effect" style={{ height: '32px', width: '200px' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards Shimmer */}
        <div className="row mb-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="col-xl-3 col-md-6 mb-4">
              <ShimmerCard />
            </div>
          ))}
        </div>

        {/* Graphique et Actions Shimmer */}
        <div className="row mb-4">
          <div className="col-xl-8 col-lg-7">
            <ShimmerChart />
          </div>
          <div className="col-xl-4 col-lg-5">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0">
                <div className="shimmer-effect" style={{ height: '24px', width: '150px' }}></div>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="col-6">
                      <div className="shimmer-effect" style={{ height: '100px', width: '100%' }}></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections inférieures Shimmer */}
        <div className="row">
          <div className="col-xl-4 col-lg-6 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0">
                <div className="shimmer-effect" style={{ height: '24px', width: '180px' }}></div>
              </div>
              <div className="card-body">
                <ShimmerList />
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0">
                <div className="shimmer-effect" style={{ height: '24px', width: '160px' }}></div>
              </div>
              <div className="card-body">
                <ShimmerList />
              </div>
            </div>
          </div>
          <div className="col-xl-4 col-lg-12 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0">
                <div className="shimmer-effect" style={{ height: '24px', width: '200px' }}></div>
              </div>
              <div className="card-body">
                <ShimmerList />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning text-center">
          {intl.formatMessage({id: "dashboard.noDataAvailable"})}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      
      {/* Filtres */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
              {/* Filtre période */}
              <select 
                className="form-select form-select-sm" 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                style={{ width: '180px' }}
              >
                <option value="7">{intl.formatMessage({id: "dashboard.last7Days"})}</option>
                <option value="30">{intl.formatMessage({id: "dashboard.last30Days"})}</option>
                <option value="90">{intl.formatMessage({id: "dashboard.last3Months"})}</option>
              </select>

              {/* Filtre agence */}
              {dashboardData.agencies && dashboardData.agencies.length > 1 && (
                <select 
                  className="form-select form-select-sm" 
                  value={agencyId} 
                  onChange={(e) => setAgencyId(e.target.value)}
                  style={{ width: '200px' }}
                >
                  <option value="">{intl.formatMessage({id: "dashboard.allAgencies"})}</option>
                  {dashboardData.agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        {/* Chiffre d'affaires */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" 
                       style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' }}>
                    <i className="pi pi-dollar text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.revenue"})}</h6>
                  <h3 className="text-success mb-0">{formatCurrency(dashboardData.stats.revenue.amount)}</h3>
                  <small className={dashboardData.stats.revenue.is_positive ? 'text-success' : 'text-danger'}>
                    <i className={`pi pi-arrow-${dashboardData.stats.revenue.is_positive ? 'up' : 'down'}`}></i>
                    {dashboardData.stats.revenue.is_positive ? '+' : ''}{dashboardData.stats.revenue.growth}% {intl.formatMessage({id: "dashboard.salesThisMonth"})}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ventes du jour */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" 
                       style={{ width: '50px', height: '50px', backgroundColor: '#2E7DB8' }}>
                    <i className="pi pi-cart-plus text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.salesToday"})}</h6>
                  <h3 className="mb-0" style={{ color: '#2E7DB8' }}>
                    {formatCurrency(dashboardData.stats.today_sales.amount)}
                  </h3>
                  <small className="text-info">
                    <i className="pi pi-arrow-up"></i> {dashboardData.stats.today_sales.count} {intl.formatMessage({id: "dashboard.transactions"})}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Produits en stock */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" 
                       style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #6f42c1 0%, #8a63d2 100%)' }}>
                    <i className="pi pi-box text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.productsInStock"})}</h6>
                  <h3 className="mb-0" style={{ color: '#6f42c1' }}>
                    {dashboardData.stats.products.total.toLocaleString()}
                  </h3>
                  <small className="text-warning">
                    <i className="pi pi-exclamation-triangle"></i> {dashboardData.stats.products.low_stock} {intl.formatMessage({id: "dashboard.outOfStock"})}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clients actifs */}
        <div className="col-xl-3 col-md-6 mb-4">
          <div className="card h-100 shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex align-items-center">
                <div className="flex-shrink-0 me-3">
                  <div className="d-flex align-items-center justify-content-center rounded-circle" 
                       style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #fd7e14 0%, #ff8c42 100%)' }}>
                    <i className="pi pi-users text-white fs-4"></i>
                  </div>
                </div>
                <div className="flex-grow-1">
                  <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.activeClients"})}</h6>
                  <h3 className="mb-0" style={{ color: '#fd7e14' }}>
                    {dashboardData.stats.clients.active}
                  </h3>
                  <small className="text-info">
                    <i className="pi pi-user-plus"></i> +{dashboardData.stats.clients.new} {intl.formatMessage({id: "dashboard.newClients"})}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique et Actions rapides */}
      <div className="row mb-4">
        {/* Graphique des ventes */}
        <div className="col-xl-8 col-lg-7">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                  <i className="pi pi-graph-up me-2"></i>{intl.formatMessage({id: "dashboard.salesEvolution"})}
                </h5>
                <div className="btn-group btn-group-sm">
                  <button 
                    className={`btn btn-outline-primary ${period === '7' ? 'active' : ''}`}
                    onClick={() => setPeriod('7')}
                  >
                    7J
                  </button>
                  <button 
                    className={`btn btn-outline-primary ${period === '30' ? 'active' : ''}`}
                    onClick={() => setPeriod('30')}
                  >
                    30J
                  </button>
                  <button 
                    className={`btn btn-outline-primary ${period === '90' ? 'active' : ''}`}
                    onClick={() => setPeriod('90')}
                  >
                    3M
                  </button>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div style={{ height: '300px' }}>
                {getChartData() && (
                  <Line data={getChartData()} options={chartOptions} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="col-xl-4 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                <i className="pi pi-lightning me-2"></i>{intl.formatMessage({id: "dashboard.quickActions"})}
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-6">
                  <a onClick={() => navigate('/purchases/create')} className="btn btn-info w-100 d-flex flex-column align-items-center py-3">
                    <i className="pi pi-cart-plus fs-2 mb-2"></i>
                    {intl.formatMessage({id: "dashboard.newPurchase"})}
                  </a>
                </div>
                <div className="col-6">
                  <a onClick={() => navigate('/products/create')} className="btn btn-success w-100 d-flex flex-column align-items-center py-3">
                    <i className="pi pi-box-seam fs-2 mb-2"></i>
                    {intl.formatMessage({id: "dashboard.newProduct"})}
                  </a>
                </div>
                <div className="col-6">
                  <a onClick={() => navigate('/clients/create')} className="btn btn-warning w-100 d-flex flex-column align-items-center py-3">
                    <i className="pi pi-person-plus fs-2 mb-2"></i>
                    {intl.formatMessage({id: "dashboard.newClient"})}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sections inférieures */}
      <div className="row">
        {/* Meilleurs produits */}
        <div className="col-xl-4 col-lg-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                <i className="pi pi-star me-2"></i>{intl.formatMessage({id: "dashboard.bestProducts"})}
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.topProducts.map((product, index) => (
                    <div key={product.id} className="list-group-item d-flex align-items-center px-0">
                      <div className="flex-shrink-0 me-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle bg-light" 
                             style={{ width: '40px', height: '40px' }}>
                          <span className="fw-bold text-primary">{index + 1}</span>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{product.name}</h6>
                        <small className="text-muted">
                          <i className="pi pi-box me-1"></i>{product.total_quantity} {intl.formatMessage({id: "dashboard.sold"})}
                        </small>
                      </div>
                      <span className="badge bg-success">{formatCurrency(product.total_revenue)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="pi pi-box-seam fs-1"></i>
                  <p className="mb-0">{intl.formatMessage({id: "dashboard.noProductsSold"})}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activités récentes */}
        <div className="col-xl-4 col-lg-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                <i className="pi pi-activity me-2"></i>{intl.formatMessage({id: "dashboard.recentActivities"})}
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentActivities.map((activity, index) => (
                    <div key={`${activity.type}-${activity.id}-${index}`} className="list-group-item d-flex align-items-center px-0">
                      <div className="flex-shrink-0 me-3">
                        <div className={`d-flex align-items-center justify-content-center rounded-circle ${activity.badge_class}`} 
                             style={{ width: '40px', height: '40px' }}>
                          <i className={`${activity.icon} text-white`}></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{activity.title}</h6>
                        <small className="text-muted">{activity.description}</small>
                        <br />
                        <small className="text-info">{formatDate(activity.created_at)}</small>
                      </div>
                      {activity.amount && (
                        <span className="badge bg-light text-dark">{formatCurrency(activity.amount)}</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="pi pi-activity fs-1"></i>
                  <p className="mb-0">{intl.formatMessage({id: "dashboard.noRecentActivity"})}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Produits en rupture de stock */}
        <div className="col-xl-4 col-lg-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                <i className="pi pi-exclamation-triangle me-2"></i>{intl.formatMessage({id: "dashboard.lowStock"})}
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.lowStockProducts.map((product) => (
                    <div key={product.id} className="list-group-item d-flex align-items-center px-0">
                      <div className="flex-shrink-0 me-3">
                        <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning" 
                             style={{ width: '40px', height: '40px' }}>
                          <i className="pi pi-exclamation-triangle text-white"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{product.name}</h6>
                        <small className="text-muted">{product.stock_name}</small>
                        <br />
                        <small className="text-warning">
                          {intl.formatMessage({id: "dashboard.stock"})}: {product.quantity} / {intl.formatMessage({id: "dashboard.threshold"})}: {product.alert_quantity}
                        </small>
                      </div>
                      <span className="badge bg-danger">{product.quantity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="pi pi-check-circle fs-1"></i>
                  <p className="mb-0">{intl.formatMessage({id: "dashboard.allStocksOK"})}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Caisse et tendances */}
      <div className="row">
        {/* État de la caisse */}
        {dashboardData.cashRegisterStatus && (
          <div className="col-xl-6 col-lg-6 mb-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-white border-0">
                <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                  <i className="pi pi-cash-stack me-2"></i>{intl.formatMessage({id: "dashboard.openCashRegister"})}
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.openingBalance"})}</h6>
                      <h4 className="text-info mb-0">
                        {formatCurrency(dashboardData.cashRegisterStatus.opening_balance)}
                      </h4>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.currentBalance"})}</h6>
                      <h4 className="text-success mb-0">
                        {formatCurrency(dashboardData.cashRegisterStatus.current_balance)}
                      </h4>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.todayRevenue"})}</h6>
                      <h5 className="text-success mb-0">
                        {formatCurrency(dashboardData.cashRegisterStatus.today_revenue)}
                      </h5>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.todayExpenses"})}</h6>
                      <h5 className="text-danger mb-0">
                        {formatCurrency(dashboardData.cashRegisterStatus.today_expenses)}
                      </h5>
                    </div>
                  </div>
                  <div className="col-12 mt-3">
                    <div className="text-center">
                      <small className="text-muted">
                        {intl.formatMessage({id: "dashboard.openedOn"})} {formatDate(dashboardData.cashRegisterStatus.opened_at)}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tendance des ventes */}
        <div className="col-xl-6 col-lg-6 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                <i className="pi pi-graph-up me-2"></i>{intl.formatMessage({id: "dashboard.monthlyTrend"})}
              </h5>
            </div>
            <div className="card-body">
              {dashboardData.salesTrend ? (
                <div className="row g-3">
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.previousMonth"})}</h6>
                      <h4 className="text-info mb-0">
                        {formatCurrency(dashboardData.salesTrend.previous)}
                      </h4>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.currentMonth"})}</h6>
                      <h4 className="text-success mb-0">
                        {formatCurrency(dashboardData.salesTrend.current)}
                      </h4>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="text-center">
                      <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.evolution"})}</h6>
                      <h3 className={dashboardData.salesTrend.is_positive ? 'text-success' : 'text-danger'}>
                        <i className={`pi pi-arrow-${dashboardData.salesTrend.is_positive ? 'up' : 'down'} me-1`}></i>
                        {dashboardData.salesTrend.is_positive ? '+' : ''}{dashboardData.salesTrend.trend}%
                      </h3>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted py-4">
                  <i className="pi pi-graph-up fs-1"></i>
                  <p className="mb-0">{intl.formatMessage({id: "dashboard.trendDataUnavailable"})}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section de résumé financier */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-white border-0">
              <h5 className="mb-0" style={{ color: '#2E7DB8' }}>
                <i className="pi pi-calculator me-2"></i>{intl.formatMessage({id: "dashboard.financialSummary"})}
              </h5>
            </div>
            <div className="card-body">
              <div className="row g-4">
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.revenue"})}</h6>
                    <h4 className="text-success mb-0">
                      {formatCurrency(dashboardData.stats.revenue.amount)}
                    </h4>
                    <small className={dashboardData.stats.revenue.is_positive ? 'text-success' : 'text-danger'}>
                      {dashboardData.stats.revenue.is_positive ? '+' : ''}{dashboardData.stats.revenue.growth}%
                    </small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.salesToday"})}</h6>
                    <h4 className="mb-0" style={{ color: '#2E7DB8' }}>
                      {formatCurrency(dashboardData.stats.today_sales.amount)}
                    </h4>
                    <small className="text-info">
                      {dashboardData.stats.today_sales.count} {intl.formatMessage({id: "dashboard.transactions"})}
                    </small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.activeClients"})}</h6>
                    <h4 className="mb-0" style={{ color: '#fd7e14' }}>
                      {dashboardData.stats.clients.active}
                    </h4>
                    <small className="text-info">
                      +{dashboardData.stats.clients.new} {intl.formatMessage({id: "dashboard.newClients"})}
                    </small>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="text-center p-3 bg-light rounded">
                    <h6 className="text-muted mb-1">{intl.formatMessage({id: "dashboard.productsInStock"})}</h6>
                    <h4 className="mb-0" style={{ color: '#6f42c1' }}>
                      {dashboardData.stats.products.total.toLocaleString()}
                    </h4>
                    <small className="text-warning">
                      {dashboardData.stats.products.low_stock} {intl.formatMessage({id: "dashboard.outOfStock"})}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer avec informations sur la période */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    <i className="pi pi-calendar me-1"></i>
                    {intl.formatMessage({id: "dashboard.periodAnalyzed"})}: {period} {intl.formatMessage({id: "dashboard.lastDays"})}
                  </small>
                </div>
                <div>
                  <small className="text-muted">
                    <i className="pi pi-clock me-1"></i>
                    {intl.formatMessage({id: "dashboard.lastUpdate"})}: {new Date().toLocaleString('fr-FR')}
                  </small>
                </div>
                <div>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={loadDashboard}
                    disabled={loading}
                  >
                    <i className="pi pi-arrow-clockwise me-1"></i>
                    {intl.formatMessage({id: "dashboard.refresh"})}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;