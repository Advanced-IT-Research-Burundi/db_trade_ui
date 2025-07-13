import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CategoryScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (response.ok) {
        setCategories(data.data || []);
      } else {
        toast.error(data.message || 'Erreur lors du chargement');
      }
    } catch (error) {
      toast.error('Erreur de connexion: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteCategory = (category) => {
    setSelectedCategory(category);
    setDeleteDialog(true);
  };

  const deleteCategory = async () => {
    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== selectedCategory.id));
        toast.success('Catégorie supprimée avec succès');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur de connexion: ' + error.message);
    } finally {
      setDeleteDialog(false);
      setSelectedCategory(null);
    }
  };

  const actionBodyTemplate = (rowData) => {
    return (
      <div className="d-flex gap-2">
        <Button
          icon="pi pi-eye"
          className="p-button-rounded p-button-info p-button-sm"
          tooltip="Voir"
          onClick={() => navigate(`/categories/${rowData.id}`)}
        />
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-success p-button-sm"
          tooltip="Modifier"
          onClick={() => navigate(`/categories/${rowData.id}/edit`)}
        />
        <Button
          icon="pi pi-trash"
          className="p-button-rounded p-button-danger p-button-sm"
          tooltip="Supprimer"
          onClick={() => confirmDeleteCategory(rowData)}
        />
      </div>
    );
  };

  const descriptionBodyTemplate = (rowData) => {
    return (
      <div className="text-truncate" style={{ maxWidth: '200px' }}>
        {rowData.description || <em className="text-muted">Aucune description</em>}
      </div>
    );
  };

  const leftToolbarTemplate = () => {
    return (
      <div className="d-flex">
        <Button
          label="Nouvelle catégorie"
          icon="pi pi-plus"
          className="p-button-success me-2"
          onClick={() => navigate('/categories/create')}
        />
        <Button
          label="Actualiser"
          icon="pi pi-refresh"
          className="p-button-info"
          onClick={loadCategories}
        />
      </div>
    );
  };

  const rightToolbarTemplate = () => {
    return (
      <div className="d-flex align-items-center">
        <i className="pi pi-search me-2"></i>
        <InputText
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Rechercher..."
          className="p-inputtext-sm"
        />
      </div>
    );
  };

  const header = (
    <div className="d-flex justify-content-between align-items-center">
      <h4 className="m-0">
        <i className="pi pi-list me-2"></i>
        Liste des catégories
      </h4>
      <span className="badge bg-primary">
        {categories.length} catégorie(s)
      </span>
    </div>
  );

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <Card>
            <Toolbar 
              className="mb-4" 
              left={leftToolbarTemplate} 
              right={rightToolbarTemplate}
            />
            
            <DataTable
              value={categories}
              loading={loading}
              paginator
              rows={10}
              rowsPerPageOptions={[5, 10, 25]}
              globalFilter={globalFilter}
              header={header}
              emptyMessage="Aucune catégorie trouvée"
              responsiveLayout="scroll"
              stripedRows
              className="p-datatable-sm"
            >
              <Column 
                field="id" 
                header="ID" 
                sortable 
                style={{ width: '80px' }}
              />
              <Column 
                field="name" 
                header="Nom" 
                sortable 
                filter 
                filterPlaceholder="Rechercher par nom"
              />
              <Column 
                field="description" 
                header="Description" 
                body={descriptionBodyTemplate}
                style={{ width: '300px' }}
              />
              <Column 
                header="Actions" 
                body={actionBodyTemplate}
                style={{ width: '150px' }}
                exportable={false}
              />
            </DataTable>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        visible={deleteDialog}
        onHide={() => setDeleteDialog(false)}
        message={`Êtes-vous sûr de vouloir supprimer la catégorie "${selectedCategory?.name}" ?`}
        header="Confirmer la suppression"
        icon="pi pi-exclamation-triangle"
        accept={deleteCategory}
        reject={() => setDeleteDialog(false)}
        acceptLabel="Oui, supprimer"
        rejectLabel="Annuler"
        acceptClassName="p-button-danger"
      />
    </div>
  );
};

export default CategoryScreen;