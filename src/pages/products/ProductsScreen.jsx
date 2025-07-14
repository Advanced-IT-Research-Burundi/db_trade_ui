import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Badge } from 'primereact/badge';
import ApiService from '../../services/api.js';
import { formatCurrency } from '../../utils/helpers.js';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 25,
    page: 1,
    sortField: null,
    sortOrder: null
  });
  
  const toast = useRef(null);
  const searchTimeout = useRef(null);

  const showToast = (severity, detail) => {
    toast.current?.show({ severity, summary: severity === 'error' ? 'Erreur' : 'Succès', detail, life: 3000 });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: lazyParams.page,
        per_page: lazyParams.rows,
        ...(globalFilter && { search: globalFilter }),
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(lazyParams.sortField && { 
          sort: lazyParams.sortField,
          order: lazyParams.sortOrder === 1 ? 'asc' : 'desc'
        })
      });

      const response = await ApiService.request(`/api/products?${params}`);
      const data = response.data?.data?.products || response.data?.products || {};
      
      setProducts(data.data || []);
      setTotalRecords(data.total || 0);
    } catch (error) {
      showToast('error', 'Erreur lors du chargement des produits');
      setProducts([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [lazyParams, globalFilter, selectedCategory]);

  const loadCategories = useCallback(async () => {
    try {
      const response = await ApiService.request('/api/categories');
      const data = response.data?.data || response.data || [];
      setCategories([
        { label: 'Toutes les catégories', value: null },
        ...data.map(cat => ({ label: cat.name, value: cat.id }))
      ]);
    } catch (error) {
      setCategories([{ label: 'Toutes les catégories', value: null }]);
    }
  }, []);

  const handleDelete = (product) => {
    confirmDialog({
      message: `Supprimer "${product.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await ApiService.request(`/api/products/${product.id}`, { method: 'DELETE' });
          showToast('success', 'Produit supprimé');
          loadData();
        } catch (error) {
          showToast('error', 'Erreur lors de la suppression');
        }
      }
    });
  };

  const onPage = (event) => {
    setLazyParams(prev => ({
      ...prev,
      first: event.first,
      rows: event.rows,
      page: Math.floor(event.first / event.rows) + 1
    }));
  };

  const onSort = (event) => {
    setLazyParams(prev => ({
      ...prev,
      sortField: event.sortField,
      sortOrder: event.sortOrder
    }));
  };

  const onSearchChange = (e) => {
    const value = e.target.value;
    setGlobalFilter(value);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setLazyParams(prev => ({ ...prev, first: 0, page: 1 }));
    }, 500);
  };

  const onCategoryChange = (e) => {
    setSelectedCategory(e.value);
    setLazyParams(prev => ({ ...prev, first: 0, page: 1 }));
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Templates
  const imageTemplate = (product) => (
    <div className="flex align-items-center justify-content-center">
      {product.image ? (
        <img 
          src={product.image} 
          alt={product.name}
          className="w-3rem h-3rem border-circle object-fit-cover"
          onError={(e) => e.target.style.display = 'none'}
        />
      ) : (
        <div className="w-3rem h-3rem border-circle bg-gray-100 flex align-items-center justify-content-center">
          <i className="pi pi-image text-gray-400"></i>
        </div>
      )}
    </div>
  );

  const nameTemplate = (product) => (
    <div>
      <div className="font-bold text-primary">{product.name}</div>
      {product.description && (
        <div className="text-sm text-600 mt-1">
          {product.description.length > 60 ? `${product.description.substring(0, 60)}...` : product.description}
        </div>
      )}
    </div>
  );

  const categoryTemplate = (product) => (
    <Tag value={product.category?.name || 'Non classé'} severity="info" />
  );

  const priceTemplate = (product) => (
    <div className="font-bold text-green-600">{formatCurrency(product.purchase_price || 0)}</div>
  );

  const salePriceTemplate = (product) => (
    <div>
      <div className="font-bold text-blue-600">{formatCurrency(product.sale_price_ttc || 0)}</div>
      {product.sale_price_ht && (
        <div className="text-sm text-500">HT: {formatCurrency(product.sale_price_ht)}</div>
      )}
    </div>
  );

  const alertTemplate = (product) => {
    const stock = product.current_stock || product.stock || 0;
    const alert = product.alert_quantity || 0;
    const isAlert = stock <= alert;
    
    return (
      <div className="text-center">
        <Badge value={alert} severity={isAlert ? 'danger' : 'success'} />
        <div className="text-xs text-500 mt-1">Stock: {stock}</div>
      </div>
    );
  };

  const actionsTemplate = (product) => (
    <div className="flex gap-2">
      <Button 
        icon="pi pi-eye" 
        size="small"
        severity="info"
        rounded
        onClick={() => window.location.href = `/products/${product.id}`}
      />
      <Button 
        icon="pi pi-pencil" 
        size="small"
        severity="success"
        rounded
        onClick={() => window.location.href = `/products/${product.id}/edit`}
      />
      <Button 
        icon="pi pi-trash" 
        size="small"
        severity="danger"
        rounded
        onClick={() => handleDelete(product)}
      />
    </div>
  );

  const header = (
    <div className="flex justify-content-between align-items-center">
      <div className="flex align-items-center gap-3">
        <h4 className="m-0 text-primary">
          <i className="pi pi-box mr-2"></i>
          Produits
        </h4>
        <Badge value={totalRecords} severity="info" />
      </div>
      
      <div className="flex gap-2">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilter}
            onChange={onSearchChange}
            placeholder="Rechercher..."
            className="w-20rem"
          />
        </span>
        <Dropdown
          value={selectedCategory}
          onChange={onCategoryChange}
          options={categories}
          placeholder="Catégorie"
          className="w-12rem"
          showClear
        />
      </div>
    </div>
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="mb-4">
        <Button 
          label="Nouveau" 
          icon="pi pi-plus" 
          severity="success"
          onClick={() => window.location.href = '/products/create'}
          className="mr-2"
        />
        <Button 
          label="Supprimer" 
          icon="pi pi-trash" 
          severity="danger"
          disabled={!selectedProducts.length}
          onClick={() => showToast('error', 'Fonction en développement')}
        />
      </div>
      
      <Card>
        <DataTable
          value={products}
          lazy
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          onSort={onSort}
          sortField={lazyParams.sortField}
          sortOrder={lazyParams.sortOrder}
          loading={loading}
          header={header}
          emptyMessage="Aucun produit trouvé"
          selection={selectedProducts}
          onSelectionChange={(e) => setSelectedProducts(e.value)}
          dataKey="id"
          stripedRows
          showGridlines
          size="small"
          responsiveLayout="scroll"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} produits"
          rowsPerPageOptions={[25, 50, 100]}
          removableSort
        >
          <Column selectionMode="multiple" style={{ width: '3rem' }} />
          <Column header="Image" body={imageTemplate} style={{ width: '5rem' }} />
          <Column field="code" header="Code" sortable style={{ width: '8rem' }} />
          <Column field="name" header="Nom" body={nameTemplate} sortable style={{ minWidth: '15rem' }} />
          <Column header="Catégorie" body={categoryTemplate} style={{ width: '10rem' }} />
          <Column field="purchase_price" header="Prix Achat" body={priceTemplate} sortable style={{ width: '8rem' }} />
          <Column field="sale_price_ttc" header="Prix Vente" body={salePriceTemplate} sortable style={{ width: '10rem' }} />
          <Column field="unit" header="Unité" style={{ width: '6rem' }} />
          <Column field="alert_quantity" header="Alerte" body={alertTemplate} sortable style={{ width: '8rem' }} />
          <Column header="Actions" body={actionsTemplate} style={{ width: '10rem' }} />
        </DataTable>
      </Card>
    </div>
  );
};

export default ProductsScreen;