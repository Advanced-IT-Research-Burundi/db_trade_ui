import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { BreadCrumb } from 'primereact/breadcrumb';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Tooltip } from 'primereact/tooltip';
import { ProgressSpinner } from 'primereact/progressspinner';
import 'bootstrap/dist/css/bootstrap.min.css';

import ApiService from '../../services/api.js';

// import '../../assets/styles/';

const CategoriesScreen = () => {
  const navigate = useNavigate();
  const toast = useRef(null);
  const dt = useRef(null);
  
  // États
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  
  // Pagination et tri
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortBy: 'name',
    sortOrder: 'asc'
  });

  // Breadcrumb
  const breadcrumbItems = [
    { label: 'Tableau de bord', icon: 'pi pi-home', command: () => navigate('/') },
    { label: 'Catégories', icon: 'pi pi-tags' }
  ];

  // Charger les catégories
  useEffect(() => {
    loadCategories();
  }, [lazyParams]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = {
        page: lazyParams.page,
        per_page: lazyParams.rows,
        sort_by: lazyParams.sortBy,
        sort_order: lazyParams.sortOrder,
        search: globalFilterValue
      };
      
      const response = await ApiService.getCategories(params);
      
      if (response.success) {
        setCategories(response.data.data);
        setTotalRecords(response.data.total);
      } else {
        toast.current.show({
          severity: 'error',
          summary: 'Erreur',
          detail: response.message || 'Erreur lors du chargement',
          life: 3000
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors du chargement des catégories',
        life: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  // Gestion du lazy loading
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
      sortBy: event.sortField,
      sortOrder: event.sortOrder === 1 ? 'asc' : 'desc'
    };
    setLazyParams(newLazyParams);
  };

  // Recherche globale
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    
    // Recherche avec délai
    setTimeout(() => {
      const newLazyParams = {
        ...lazyParams,
        first: 0,
        page: 1
      };
      setLazyParams(newLazyParams);
    }, 300);
  };

  // Actions
  const editCategory = (category) => {
    navigate(`/categories/edit/${category.id}`);
  };

  const confirmDeleteCategory = (category) => {
    setCategoryToDelete(category);
    setDeleteDialog(true);
  };

  const deleteCategory = async () => {
    try {
        await ApiService.delete(`/api/categories/${categoryToDelete.id}`);
     
        setCategories(categories.filter(c => c.id !== categoryToDelete.id));
        setDeleteDialog(false);
        setCategoryToDelete(null);
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: 'Catégorie supprimée avec succès',
          life: 3000
        });
     
    } catch (error) {
      console.error('Erreur:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la suppression',
        life: 3000
      });
    }
  };

  const confirmDeleteSelected = () => {
    setDeleteMultipleDialog(true);
  };

  const deleteSelectedCategories = async () => {
    try {
      const ids = selectedCategories.map(c => c.id);
      const response = await ApiService.post('/api/categories/bulk-delete', { ids });

      if (response.success) {
        setCategories(categories.filter(c => !ids.includes(c.id)));
        setSelectedCategories([]);
        setDeleteMultipleDialog(false);
        toast.current.show({
          severity: 'success',
          summary: 'Succès',
          detail: `${ids.length} catégories supprimées avec succès`,
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
      console.error('Erreur:', error);
      toast.current.show({
        severity: 'error',
        summary: 'Erreur',
        detail: 'Erreur lors de la suppression multiple',
        life: 3000
      });
    }
  };

  // Templates des colonnes
  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          onClick={() => editCategory(rowData)}
          tooltip="Modifier"
          tooltipOptions={{ position: 'top' }}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          onClick={() => confirmDeleteCategory(rowData)}
          tooltip="Supprimer"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  const descriptionBodyTemplate = (rowData) => {
    return (
      <div className="description-cell">
        {rowData.description ? (
          <span 
            className="description-text"
            title={rowData.description}
          >
            {rowData.description.length > 50 
              ? `${rowData.description.substring(0, 50)}...` 
              : rowData.description
            }
          </span>
        ) : (
          <span className="text-muted">Aucune description</span>
        )}
      </div>
    );
  };

  const dateBodyTemplate = (rowData) => {
    return new Date(rowData.created_at).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Toolbar
  const leftToolbarTemplate = () => {
    return (
      <div className="d-flex gap-2">
        <Button
          label="Nouvelle catégorie"
          icon="pi pi-plus"
          className="p-button-success"
          onClick={() => navigate('/categories/create')}
        />
        <Button
          label="Supprimer sélection"
          icon="pi pi-trash"
          className="p-button-danger"
          onClick={confirmDeleteSelected}
          disabled={!selectedCategories.length}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="d-flex gap-2 align-items-center">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Rechercher..."
            className="p-inputtext-sm"
          />
        </span>
        <Button
          icon="pi pi-refresh"
          className="p-button-outlined"
          onClick={loadCategories}
          tooltip="Actualiser"
          tooltipOptions={{ position: 'top' }}
        />
      </div>
    );
  };

  // Dialogs
  const deleteDialogFooter = (
    <div>
      <Button
        label="Annuler"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDeleteDialog(false)}
      />
      <Button
        label="Supprimer"
        icon="pi pi-check"
        className="p-button-danger"
        onClick={deleteCategory}
      />
    </div>
  );

  const deleteMultipleDialogFooter = (
    <div>
      <Button
        label="Annuler"
        icon="pi pi-times"
        className="p-button-text"
        onClick={() => setDeleteMultipleDialog(false)}
      />
      <Button
        label="Supprimer"
        icon="pi pi-check"
        className="p-button-danger"
        onClick={deleteSelectedCategories}
      />
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <Toast ref={toast} />
      <Tooltip target=".tooltip-target" />
      
      {/* Breadcrumb */}
      <div className="mb-4">
        <BreadCrumb 
          model={breadcrumbItems} 
          home={{ icon: 'pi pi-home', command: () => navigate('/') }}
          className="custom-breadcrumb"
        />
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-1">
            <i className="pi pi-tags me-2"></i>
            Gestion des Catégories
          </h1>
          <p className="text-muted mb-0">
            Gérez vos catégories de produits
          </p>
        </div>
        <Tag 
          value={`${totalRecords} catégorie${totalRecords > 1 ? 's' : ''}`} 
          severity="info"
          className="fs-6"
        />
      </div>

      {/* Contenu principal */}
      <Card className="shadow-sm">
        <Toolbar 
          className="mb-4 border-bottom pb-3" 
          left={leftToolbarTemplate} 
          right={rightToolbarTemplate}
        />
        
        <DataTable
          ref={dt}
          value={categories}
          lazy
          paginator
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={onPage}
          onSort={onSort}
          sortField={lazyParams.sortBy}
          sortOrder={lazyParams.sortOrder === 'asc' ? 1 : -1}
          loading={loading}
          first={lazyParams.first}
          selection={selectedCategories}
          onSelectionChange={(e) => setSelectedCategories(e.value)}
          dataKey="id"
          removableSort
          rowHover
          stripedRows
          showGridlines
          responsiveLayout="scroll"
          emptyMessage="Aucune catégorie trouvée"
          rowsPerPageOptions={[5, 10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          currentPageReportTemplate="Affichage de {first} à {last} sur {totalRecords} catégories"
          className="category-datatable"
        >
          <Column 
            selectionMode="multiple" 
            headerStyle={{ width: '3em' }}
            exportable={false}
          />
          <Column 
            field="name" 
            header="Nom" 
            sortable 
            className="fw-semibold"
            style={{ minWidth: '200px' }}
          />
          <Column 
            field="description" 
            header="Description"
            body={descriptionBodyTemplate}
            style={{ minWidth: '300px' }}
          />
          <Column 
            field="created_at" 
            header="Date de création" 
            sortable
            body={dateBodyTemplate}
            style={{ minWidth: '150px' }}
          />
          <Column 
            body={actionBodyTemplate}
            header="Actions"
            exportable={false}
            style={{ minWidth: '120px' }}
            className="text-center"
          />
        </DataTable>
      </Card>

      {/* Dialog de suppression simple */}
      <Dialog
        visible={deleteDialog}
        style={{ width: '450px' }}
        header="Confirmer la suppression"
        modal
        footer={deleteDialogFooter}
        onHide={() => setDeleteDialog(false)}
      >
        <div className="d-flex align-items-center">
          <i className="pi pi-exclamation-triangle text-warning me-3" style={{ fontSize: '2rem' }} />
          <span>
            Êtes-vous sûr de vouloir supprimer la catégorie <strong>{categoryToDelete?.name}</strong> ?
          </span>
        </div>
      </Dialog>

      {/* Dialog de suppression multiple */}
      <Dialog
        visible={deleteMultipleDialog}
        style={{ width: '450px' }}
        header="Confirmer la suppression"
        modal
        footer={deleteMultipleDialogFooter}
        onHide={() => setDeleteMultipleDialog(false)}
      >
        <div className="d-flex align-items-center">
          <i className="pi pi-exclamation-triangle text-warning me-3" style={{ fontSize: '2rem' }} />
          <span>
            Êtes-vous sûr de vouloir supprimer les <strong>{selectedCategories.length}</strong> catégories sélectionnées ?
          </span>
        </div>
      </Dialog>
    </div>
  );
};

export default CategoriesScreen;