import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Toolbar } from 'primereact/toolbar';
import { Badge } from 'primereact/badge';
import ApiService from '../../services/api.js';
import { formatCurrency } from '../../utils/helpers.js';

const ProductsScreen = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const dt = useRef(null);

  useEffect(() => {
    loadData();
    loadCategories();
  }, [lazyParams, globalFilter, selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = {
        page: lazyParams.page,
        per_page: lazyParams.rows,
        ...(globalFilter && { search: globalFilter }),
        ...(selectedCategory && { category_id: selectedCategory }),
        ...(lazyParams.sortField && { 
          sort: lazyParams.sortField,
          order: lazyParams.sortOrder === 1 ? 'asc' : 'desc'
        })
      };

      const response = await ApiService.request('/api/products', { params });
      setProducts(response.data.data);
      setTotalRecords(response.data.total);
    } catch (error) {
      showError('Erreur lors du chargement des produits');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await ApiService.request('/api/categories');
      const categoriesData = response.data?.data || response.data || [];
      setCategories([
        { label: 'Toutes les catégories', value: null },
        ...categoriesData.map(cat => ({ label: cat.name, value: cat.id }))
      ]);
    } catch (error) {
      console.error('Erreur catégories:', error);
      setCategories([{ label: 'Toutes les catégories', value: null }]);
    }
  };

  const showError = (message) => {
    toast.current.show({
      severity: 'error',
      summary: 'Erreur',
      detail: message,
      life: 3000
    });
  };

  const showSuccess = (message) => {
    toast.current.show({
      severity: 'success',
      summary: 'Succès',
      detail: message,
      life: 3000
    });
  };

  const handleDelete = (product) => {
    confirmDialog({
      message: `Supprimer "${product.name}" ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      acceptClassName: 'p-button-danger',
      accept: async () => {
        try {
          await ApiService.request(`/api/products/${product.id}`, { method: 'DELETE' });
          showSuccess('Produit supprimé');
          loadData();
        } catch (error) {
          showError('Erreur lors de la suppression');
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

  // Templates optimisés
  const imageTemplate = (product) => (
    <div className="flex align-items-center justify-content-center">
      {product.image ? (
        <img 
          src={product.image} 
          alt={product.name}
          className="w-3rem h-3rem border-circle object-fit-cover"
        />
      ) : (
        <div className="w-3rem h-3rem border-circle bg-gray-100 flex align-items-center justify-content-center">
          <i className="pi pi-image text-gray-400"></i>
        </div>
      )}
    </div>
  );

  const codeTemplate = (product) => (
    <Badge value={product.code} severity="info" />
  );

  const nameTemplate = (product) => (
    <div>
      <div className="font-bold text-primary">{product.name}</div>
      {product.description && (
        <div className="text-sm text-gray-600 mt-1">
          {product.description.length > 60 ? 
            `${product.description.substring(0, 60)}...` : 
            product.description}
        </div>
      )}
    </div>
  );

  const categoryTemplate = (product) => (
    <Tag 
      value={product.category?.name || 'Non définie'} 
      className="bg-primary text-white"
    />
  );

  const priceTemplate = (product) => (
    <div className="text-right">
      <div className="font-bold text-green-600">
        {formatCurrency(product.purchase_price)}
      </div>
    </div>
  );

  const salePriceTemplate = (product) => (
    <div className="text-right">
      <div className="font-bold text-blue-600">
        {formatCurrency(product.sale_price_ttc)}
      </div>
      {product.sale_price_ht && (
        <div className="text-sm text-gray-500">
          HT: {formatCurrency(product.sale_price_ht)}
        </div>
      )}
    </div>
  );

  const unitTemplate = (product) => (
    <Tag value={product.unit} severity="secondary" />
  );

  const alertTemplate = (product) => {
    const isAlert = product.current_stock <= product.alert_quantity;
    return (
      <div className="text-center">
        <Badge 
          value={product.alert_quantity} 
          severity={isAlert ? 'danger' : 'success'}
        />
      </div>
    );
  };

  const agencyTemplate = (product) => (
    <div className="text-sm">
      <i className="pi pi-building mr-1"></i>
      {product.agency?.name || 'Non définie'}
    </div>
  );

  const actionsTemplate = (product) => (
    <div className="flex gap-2">
      <Button 
        icon="pi pi-eye" 
        size="small"
        severity="info"
        rounded
        onClick={() => window.location.href = `/products/${product.id}`}
        tooltip="Voir"
      />
      <Button 
        icon="pi pi-pencil" 
        size="small"
        severity="success"
        rounded
        onClick={() => window.location.href = `/products/${product.id}/edit`}
        tooltip="Modifier"
      />
      <Button 
        icon="pi pi-trash" 
        size="small"
        severity="danger"
        rounded
        onClick={() => handleDelete(product)}
        tooltip="Supprimer"
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
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Rechercher..."
            className="w-20rem"
          />
        </span>
        <Dropdown
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.value)}
          options={categories}
          placeholder="Catégorie"
          className="w-12rem"
        />
      </div>
    </div>
  );

  const toolbar = (
    <Toolbar
      left={
        <div className="flex gap-2">
          <Button 
            label="Nouveau" 
            icon="pi pi-plus" 
            severity="success"
            onClick={() => window.location.href = '/products/create'}
          />
          <Button 
            label="Supprimer" 
            icon="pi pi-trash" 
            severity="danger"
            disabled={!selectedProducts.length}
            onClick={() => showError('Fonction en développement')}
          />
        </div>
      }
      right={
        <div className="flex gap-2">
          <Button 
            label="CSV" 
            icon="pi pi-file" 
            severity="help"
            onClick={() => dt.current.exportCSV()}
          />
          <Button 
            label="Excel" 
            icon="pi pi-file-excel" 
            severity="success"
            onClick={() => showError('Fonction en développement')}
          />
        </div>
      }
    />
  );

  return (
    <div className="p-4">
      <Toast ref={toast} />
      <ConfirmDialog />
      
      <div className="mb-4">
        {toolbar}
      </div>
      
      <Card>
        <DataTable
          ref={dt}
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
        >
          <Column selectionMode="multiple" style={{ width: '3rem' }} />
          <Column 
            header="Image" 
            body={imageTemplate} 
            style={{ width: '5rem' }}
          />
          <Column 
            field="code" 
            header="Code" 
            body={codeTemplate}
            sortable 
            style={{ width: '8rem' }}
          />
          <Column 
            field="name" 
            header="Nom" 
            body={nameTemplate}
            sortable 
            style={{ minWidth: '15rem' }}
          />
          <Column 
            header="Catégorie" 
            body={categoryTemplate}
            style={{ width: '10rem' }}
          />
          <Column 
            field="purchase_price"
            header="Prix d'Achat" 
            body={priceTemplate}
            sortable
            style={{ width: '8rem' }}
          />
          <Column 
            field="sale_price_ttc"
            header="Prix de Vente" 
            body={salePriceTemplate}
            sortable
            style={{ width: '10rem' }}
          />
          <Column 
            field="unit"
            header="Unité" 
            body={unitTemplate}
            style={{ width: '6rem' }}
          />
          <Column 
            field="alert_quantity"
            header="Seuil d'Alerte" 
            body={alertTemplate}
            sortable
            style={{ width: '8rem' }}
          />
          <Column 
            header="Agence" 
            body={agencyTemplate}
            style={{ width: '10rem' }}
          />
          <Column 
            header="Actions" 
            body={actionsTemplate}
            style={{ width: '10rem' }}
          />
        </DataTable>
      </Card>
    </div>
  );
};

export default ProductsScreen;