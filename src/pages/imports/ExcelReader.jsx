import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Toast } from 'primereact/toast';
import ApiService from '../../services/api.js';
import ImportHeader from './ImportHeader.jsx';

const ExcelReader = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadingError, setUploadingError] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  
  const toast = useRef(null);
  const fileInputRef = useRef(null);

  // Computed values
  const hasData = data.length > 0;
  const hasValidData = data.filter(row => row.length >= 11).length > 0;
  const dataRows = data.length > 0 ? data.length - 1 : 0; // Exclude header row

  const showToast = (severity, detail, summary = null) => {
    const summaryText = summary || (
      severity === 'error' ? 'Erreur' : 
      severity === 'success' ? 'Succès' : 'Info'
    );
    toast.current?.show({ 
      severity, 
      summary: summaryText, 
      detail, 
      life: severity === 'error' ? 5000 : 3000 
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      showToast('error', 'Veuillez sélectionner un fichier Excel valide (.xlsx ou .xls)');
      return;
    }

    setFileName(file.name);
    setUploadingError(null);
    setIsProcessing(true);
    
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target.result, { type: 'binary' });
        setWorkbook(wb);
        
        // Get all sheet names
        const sheetNames = wb.SheetNames;
        setSheets(sheetNames);
        
        // Read the first sheet by default
        const firstSheet = sheetNames[0];
        setActiveSheet(firstSheet);
        
        const worksheet = wb.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        setData(jsonData);
        showToast('success', `Fichier "${file.name}" chargé avec succès. ${jsonData.length - 1} lignes trouvées.`);
      } catch (error) {
        console.error('Error reading file:', error);
        showToast('error', 'Erreur lors de la lecture du fichier. Assurez-vous qu\'il s\'agit d\'un fichier Excel valide.');
        resetFileData();
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      showToast('error', 'Erreur lors de la lecture du fichier');
      setIsProcessing(false);
      resetFileData();
    };

    reader.readAsBinaryString(file);
  };

  const resetFileData = () => {
    setData([]);
    setFileName('');
    setSheets([]);
    setActiveSheet('');
    setWorkbook(null);
    setUploadingError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const switchSheet = (sheetName) => {
    if (!workbook || !sheetName) return;
    
    setActiveSheet(sheetName);
    
    try {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setData(jsonData);
      setUploadingError(null);
      showToast('info', `Feuille "${sheetName}" chargée avec ${jsonData.length - 1} lignes`);
    } catch (error) {
      showToast('error', 'Erreur lors du changement de feuille');
    }
  };

  const downloadAsJSON = () => {
    if (!hasData) return;
    
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName.split('.')[0]}_${activeSheet}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      showToast('success', 'Fichier JSON téléchargé avec succès');
    } catch (error) {
      showToast('error', 'Erreur lors du téléchargement du fichier JSON');
    }
  };

  const saveToDatabase = async () => {
    if (!hasValidData) {
      showToast('error', 'Aucune donnée valide à enregistrer');
      return;
    }

    setLoading(true);
    setUploadingError(null);
    
    try {
      const dataToSave = data.filter(row => row.length >= 11);
      const response = await ApiService.post('/api/imports/company_products', dataToSave);
      
      if (response.errors && response.errors.length > 0) {
        setUploadingError(response.errors);
        showToast('warning', 'Importation partiellement réussie. Voir les détails des erreurs ci-dessous.');
      } else {
        showToast('success', `${dataToSave.length} lignes enregistrées avec succès dans la base de données !`);
        // Optionally reset the form after successful save
        // resetFileData();
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setUploadingError([error.message || 'Erreur inconnue']);
      showToast('error', error.message || 'Erreur lors de l\'enregistrement des données');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    resetFileData();
    showToast('info', 'Fichier supprimé');
  };

  return (
    <div className="container-fluid">
      <Toast ref={toast} />
      <ImportHeader activeTab="importFile" />
      
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-primary mb-1">
                <i className="pi pi-file-excel me-2"></i>Import de fichier Excel
              </h2>
              <p className="text-muted mb-0">Charger et importer des données depuis un fichier Excel</p>
            </div>
            {hasData && (
              <div className="badge bg-success fs-6">
                <i className="pi pi-check me-1"></i>
                {dataRows} ligne{dataRows > 1 ? 's' : ''} chargée{dataRows > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* File Upload Section */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="pi pi-upload me-2"></i>1. Sélection du fichier
              </h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Fichier Excel (.xlsx, .xls)</label>
                <input 
                  ref={fileInputRef}
                  className="form-control" 
                  type="file" 
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isProcessing}
                />
              </div>

              {isProcessing && (
                <div className="text-center py-3">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Traitement...</span>
                  </div>
                  <p className="mt-2 text-muted">Traitement du fichier...</p>
                </div>
              )}

              {fileName && !isProcessing && (
                <div className="alert alert-info">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <strong><i className="pi pi-file me-1"></i>{fileName}</strong><br/>
                      <small>{dataRows} ligne{dataRows > 1 ? 's' : ''} de données</small>
                    </div>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={clearFile}
                      title="Supprimer le fichier"
                    >
                      <i className="pi pi-times"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Sheet Selection */}
              {sheets.length > 1 && (
                <div className="mb-3">
                  <label className="form-label">Feuille de calcul</label>
                  <select 
                    className="form-select" 
                    value={activeSheet} 
                    onChange={(e) => switchSheet(e.target.value)}
                  >
                    {sheets.map(sheet => (
                      <option key={sheet} value={sheet}>{sheet}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              {hasData && (
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-success" 
                    onClick={saveToDatabase}
                    disabled={loading || !hasValidData}
                  >
                    <i className="pi pi-save me-2"></i>
                    {loading ? 'Enregistrement...' : 'Enregistrer en base'}
                  </button>
                  
                  <button 
                    className="btn btn-outline-primary" 
                    onClick={downloadAsJSON}
                  >
                    <i className="pi pi-download me-2"></i>
                    Télécharger JSON
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Preview Section */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="pi pi-table me-2"></i>2. Aperçu des données
                {activeSheet && <span className="badge bg-light text-dark ms-2">{activeSheet}</span>}
              </h5>
            </div>
            <div className="card-body">
              {/* Error Messages */}
              {uploadingError && uploadingError.length > 0 && (
                <div className="alert alert-warning mb-4">
                  <h6><i className="pi pi-exclamation-triangle me-2"></i>Éléments non importés :</h6>
                  <div className="mt-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {uploadingError.map((error, index) => (
                      <div key={index} className="border-bottom pb-2 mb-2">
                        <small className="text-muted">#{index + 1}:</small>
                        <pre className="mb-0" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                          {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Data State */}
              {!hasData && !isProcessing && (
                <div className="alert alert-info text-center py-5">
                  <i className="pi pi-file-excel" style={{ fontSize: '3rem', color: '#6c757d' }}></i>
                  <h5 className="mt-3 mb-2">Aucun fichier chargé</h5>
                  <p className="text-muted mb-0">
                    Sélectionnez un fichier Excel pour voir l'aperçu des données
                  </p>
                </div>
              )}

              {/* Data Table */}
              {hasData && (
                <div className="table-responsive">
                  <table className="table table-hover table-sm align-middle">
                    <thead className="bg-light sticky-top">
                      <tr>
                        <th style={{ width: '50px' }}>#</th>
                        {data[0]?.map((header, index) => (
                          <th key={index} className="text-nowrap">
                            {header || `Colonne ${index + 1}`}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(1).map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className="text-muted">{rowIndex + 1}</td>
                          {row.map((cell, cellIndex) => (
                            <td key={cellIndex} className="text-nowrap">
                              {cell !== null && cell !== undefined ? String(cell) : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Data Summary */}
              {hasData && (
                <div className="mt-3 p-3 bg-light rounded">
                  <div className="row text-center">
                    <div className="col-md-4">
                      <div className="text-primary fw-bold fs-4">{data.length - 1}</div>
                      <small className="text-muted">Lignes de données</small>
                    </div>
                    <div className="col-md-4">
                      <div className="text-success fw-bold fs-4">{data[0]?.length || 0}</div>
                      <small className="text-muted">Colonnes</small>
                    </div>
                    <div className="col-md-4">
                      <div className="text-info fw-bold fs-4">{sheets.length}</div>
                      <small className="text-muted">Feuille{sheets.length > 1 ? 's' : ''}</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelReader;