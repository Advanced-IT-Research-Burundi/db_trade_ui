import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { FilterMatchMode } from 'primereact/api';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Badge } from 'primereact/badge';
import ApiService from '../services/api';
import { formatCurrency } from '../utils/helpers';

const ProductScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 15,
    page: 1,
    sortField: null,
    sortOrder: null,
    filters: {
      global: { value: null, matchMode: FilterMatchMode.CONTAINS },
      name: { value: null, matchMode: FilterMatchMode.CONTAINS },
      code: { value: null, matchMode: FilterMatchMode.CONTAINS },
      'category.name': { value: null, matchMode: FilterMatchMode.CONTAINS }
    }
  });
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const toast = useRef(null);
  const dt = useRef(null);

  useEffect(() => {
    loadLazyData();
    loadCategories();
  }, [lazyParams]);

  const loadLazyData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: lazyParams.page,
        per_page: lazyParams.rows,
        ...(globalFilterValue && { search: globalFilterValue }),
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(lazyParams.sortField && { sort: lazyParams.sortField }),
        ...(lazyParams.sortOrder && { order: lazyParams.sortOrder === 1 ? 'asc' : 'desc' })
      });

      const response = await ApiService.request(`/api/products?${params}`);
      
      setProducts(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de charger les produits'        + error.message,
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await ApiService.request('/api/categories');
      const categoryOptions = [
        { label: 'Toutes les catégories', value: null },
        ...(response.data?.map(cat => ({ label: cat.name, value: cat.id })) || [])
      ];
      setCategories(categoryOptions);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  };

  const onPage = (event) => {
    const newLazyParams = { 
      ...lazyParams, 
      first: event.first, 
      rows: event.rows, 
      page: Math.floor(event.first / event.rows) + 1 
    };
    setLazyParams(newLazyParams);
  };

  const onSort = (event) => {
    const newLazyParams = { 
      ...lazyParams, 
      sortField: event.sortField, 
      sortOrder: event.sortOrder 
    };
    setLazyParams(newLazyParams);
  };

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    
    // Debounce search
    setTimeout(() => {
      const newLazyParams = { 
        ...lazyParams, 
        page: 1, 
        first: 0 
      };
      setLazyParams(newLazyParams);
    }, 500);
  };

  const onCategoryChange = (e) => {
    setSelectedCategory(e.value);
    const newLazyParams = { 
      ...lazyParams, 
      page: 1, 
      first: 0 
    };
    setLazyParams(newLazyParams);
  };

  const confirmDelete = (product) => {
    confirmDialog({
      message: `Êtes-vous sûr de vouloir supprimer le produit "${product.name}" ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      accept: () => deleteProduct(product.id),
      reject: () => {},
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      acceptClassName: 'p-button-danger'
    });
  };

  const deleteProduct = async (id) => {
    try {
      await ApiService.request(`/api/products/${id}`, { method: 'DELETE' });
      toast.current.show({
        severity: 'success',
        summary: 'Succès',
        detail: 'Produit supprimé avec succès',
        life: 3000
      });
      loadLazyData();
    } catch (error) {
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Impossible de supprimer le produit' + error.message,
        life: 3000
      });
    }
  };

  const exportCSV = () => {
    dt.current.exportCSV();
  };

  const exportPdf = () => {
    toast.current.show({
      severity: 'info',
      summary: 'Export PDF',
      detail: 'Fonctionnalité d\'export PDF en cours de développement',
      life: 3000
    });
  };

  const exportExcel = () => {
    toast.current.show({
      severity: 'info',
      summary: 'Export Excel',
      detail: 'Fonctionnalité d\'export Excel en cours de développement',
      life: 3000
    });
  };

  // Templates pour les colonnes
  const imageBodyTemplate = (rowData) => {
    return (
      <div className="d-flex align-items-center justify-content-center">
        {rowData.image ? (
          <img 
            src={rowData.image} 
            alt={rowData.name}
            style={{ width: '50px', height: '50px', objectFit: 'cover' }}
            className="rounded shadow-sm"
          />
        ) : (
          <div 
            className="d-flex align-items-center justify-content-center rounded shadow-sm"
            style={{ 
              width: '50px', 
              height: '50px', 
              backgroundColor: '#f1f3f4',
              color: '#6c757d'
            }}
          >
            <i className="pi pi-image"></i>
          </div>
        )}
      </div>
    );
  };

  const codeBodyTemplate = (rowData) => {
    return (
      <div className="d-flex align-items-center">
        <Badge 
          value={rowData.code} 
          severity="info"
          className="p-badge-lg"
        />
      </div>
    );
  };

  const nameBodyTemplate = (rowData) => {
    return (
      <div>
        <div className="fw-bold text-primary">{rowData.name}</div>
        {rowData.description && (
          <small className="text-muted">
            {rowData.description.length > 50 ? 
              `${rowData.description.substring(0, 50)}...` : 
              rowData.description
            }
          </small>
        )}
      </div>
    );
  };

  const priceBodyTemplate = (rowData) => {
    return (
      <div className="text-end">
        <div className="fw-bold text-success">{formatCurrency(rowData.sale_price_ttc)}</div>
        <small className="text-muted">HT: {formatCurrency(rowData.sale_price_ht || 0)}</small>
        <div className="mt-1">
          <small className="text-muted">Achat: {formatCurrency(rowData.purchase_price)}</small>
        </div>
      </div>
    );
  };

  const stockBodyTemplate = (rowData) => {
    const currentStock = rowData.current_stock || 0;
    const alertQuantity = rowData.alert_quantity || 0;
    
    let severity = 'success';
    let label = 'En stock';
    
    if (currentStock <= 0) {
      severity = 'danger';
      label = 'Rupture';
    } else if (currentStock <= alertQuantity) {
      severity = 'warning';
      label = 'Stock faible';
    }
    
    return (
      <div className="text-center">
        <div className="fw-bold mb-1">{currentStock} {rowData.unit}</div>
        <Tag 
          value={label}
          severity={severity}
          className="p-tag-rounded"
        />
      </div>
    );
  };

  const categoryBodyTemplate = (rowData) => {
    return (
      <Tag 
        value={rowData.category?.name || 'Non définie'}
        className="p-tag-rounded"
        style={{ backgroundColor: 'var(--primary-blue)', color: 'white' }}
      />
    );
  };

  const marginBodyTemplate = (rowData) => {
    const margin = rowData.sale_price_ttc - rowData.purchase_price;
    const marginPercent = rowData.purchase_price > 0 ? 
      ((margin / rowData.purchase_price) * 100).toFixed(1) : 0;
    
    return (
      <div className="text-center">
        <div className="fw-bold text-success">{formatCurrency(margin)}</div>
        <small className="text-muted">{marginPercent}%</small>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2 justify-content-center">
        <Button 
          icon="pi pi-eye" 
          className="p-button-rounded p-button-info p-button-sm"
          onClick={() => window.location.href = `/products/${rowData.id}`}
          tooltip="Voir les détails"
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          icon="pi pi-pencil" 
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => window.location.href = `/products/${rowData.id}/edit`}
          tooltip="Modifier"
          tooltipOptions={{ position: 'top' }}
        />
        <Button 
          icon="pi pi-trash" 
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDelete(rowData)}
          tooltip="Supprimer"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="d-flex align-items-center gap-2">
        <Button 
          label="Nouveau produit" 
          icon="pi pi-plus" 
          severity="success"
          onClick={() => window.location.href = '/products/create'}
        />
        <Button 
          label="Supprimer sélection" 
          icon="pi pi-trash" 
          severity="danger"
          disabled={!selectedProducts || selectedProducts.length === 0}
          onClick={() => {
            // Logique de suppression multiple
            toast.current.show({
              severity: 'info',
              summary: 'Suppression multiple',
              detail: 'Fonctionnalité en cours de développement',
              life: 3000
            });
          }}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="d-flex align-items-center gap-2">
        <Button 
          label="CSV" 
          icon="pi pi-file" 
          className="p-button-help"
          onClick={exportCSV}
        />
        <Button 
          label="PDF" 
          icon="pi pi-file-pdf" 
          className="p-button-warning"
          onClick={exportPdf}
        />
        <Button 
          label="Excel" 
          icon="pi pi-file-excel" 
          className="p-button-success"
          onClick={exportExcel}
        />
      </div>
    );
  };

  const renderHeader = () => {
    return (
      <div className="row align-items-center">
        <div className="col-md-6">
          <div className="d-flex align-items-center gap-3">
            <h4 className="mb-0" style={{ color: 'var(--primary-blue)' }}>
              <i className="pi pi-box me-2"></i>
              Gestion des Produits
            </h4>
            <Badge 
              value={totalRecords} 
              severity="info"
              className="p-badge-lg"
            />
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="d-flex gap-2">
            <span className="p-input-icon-left">
              <i className="pi pi-search" />
              <InputText
                value={globalFilterValue}
                onChange={onGlobalFilterChange}
                placeholder="Rechercher un produit..."
                className="w-auto"
              />
            </span>
            <Dropdown
              value={selectedCategory}
              onChange={onCategoryChange}
              options={categories}
              placeholder="Filtrer par catégorie"
              className="w-auto"
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="product-screen">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="mb-4">
        <Toolbar 
          className="mb-3 shadow-sm"
          left={leftToolbarTemplate} 
          right={rightToolbarTemplate}
        />
      </div>
      
      <Card className="shadow-sm">
        <DataTable
          ref={dt}
          value={products}
          lazy
          dataKey="id"
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          onSort={onSort}
          sortField={lazyParams.sortField}
          sortOrder={lazyParams.sortOrder}
          loading={loading}
          header={renderHeader()}
          emptyMessage="Aucun produit trouvé"
          responsiveLayout="scroll"
          stripedRows
          showGridlines
          size="small"
          className="p-datatable-sm"
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} produits"
          rowsPerPageOptions={[15, 25, 50, 100]}
          paginatorLeft={
            <div className="text-muted">
              <i className="pi pi-clock me-2"></i>
              Dernière mise à jour: {new Date().toLocaleTimeString()}
            </div>
          }
          paginatorRight={
            <div className="text-muted">
              Total: {totalRecords} produits
            </div>
          }
        >
          <Column 
            selectionMode="multiple" 
            headerStyle={{ width: '3rem' }}
            exportable={false}
          />
          <Column 
            header="Image" 
            body={imageBodyTemplate} 
            style={{ width: '80px' }}
            className="text-center"
            exportable={false}
          />
          <Column 
            field="code" 
            header="Code" 
            body={codeBodyTemplate}
            sortable 
            style={{ width: '120px' }}
          />
          <Column 
            field="name" 
            header="Produit" 
            body={nameBodyTemplate}
            sortable 
            style={{ minWidth: '250px' }}
          />
          <Column 
            header="Catégorie" 
            body={categoryBodyTemplate}
            style={{ width: '150px' }}
          />
          <Column 
            header="Prix" 
            body={priceBodyTemplate}
            sortable
            sortField="sale_price_ttc"
            style={{ width: '140px' }}
          />
          <Column 
            header="Stock" 
            body={stockBodyTemplate}
            style={{ width: '130px' }}
          />
          <Column 
            header="Marge" 
            body={marginBodyTemplate}
            style={{ width: '120px' }}
          />
          <Column 
            header="Actions" 
            body={actionBodyTemplate}
            style={{ width: '160px' }}
            className="text-center"
            exportable={false}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default ProductScreen;