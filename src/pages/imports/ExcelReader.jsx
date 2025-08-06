import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Container, Button, Card, Table, Form, Row, Col, Alert } from 'react-bootstrap';
import ApiService from '../../services/api.js';
import ImportHeader from './ImportHeader.jsx';

const ExcelReader = () => {
  const [data, setData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sheets, setSheets] = useState([]);
  const [activeSheet, setActiveSheet] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: 'binary' });
        
        // Get all sheet names
        const sheetNames = workbook.SheetNames;
        setSheets(sheetNames);
        
        // Read the first sheet by default
        const firstSheet = sheetNames[0];
        setActiveSheet(firstSheet);
        
        const worksheet = workbook.Sheets[firstSheet];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        setData(jsonData);
      } catch (error) {
        console.error('Error reading file:', error);
        setError('Error reading file. Please make sure it\'s a valid Excel file.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const switchSheet = (sheetName) => {
    if (!sheets.length) return;
    
    setActiveSheet(sheetName);
    
    const fileInput = document.querySelector('input[type="file"]');
    const file = fileInput?.files[0];
    
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          setData(jsonData);
          setError('');
        } catch (err) {
          setError('Error switching sheets. Please try again.');
        }
      };
      reader.readAsBinaryString(file);
    }
  };

  const downloadAsJSON = () => {
    if (data.length === 0) return;
    
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.split('.')[0]}_${activeSheet}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };
  const [loading, setLoading] = useState(false);
  const [uploadingError, setUploadingError] = useState(null);
  

  const saveToDatabase = () => {
    // Implement your database save logic here
    if (data.length === 0) return;
    setLoading(true) 
    const dataToSave = data.filter(row => row.length >= 11);
    
    ApiService.post('/api/imports/company_products', dataToSave)
      .then(response => {
        console.log('Data saved successfully:', response.errors);
        if(response.errors){
          setUploadingError(response.errors);
        }else{
          alert('Data saved successfully!');
        }
      })
      .catch(error => {
        setUploadingError(error);
        console.log('Error saving data:', error);
        
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Container className="my-4">
      <ImportHeader />
      {loading && <div className="text-center">Enregistrement en cours...</div>}
      <Card className="mb-4">
        <Card.Header as="h4" className="bg-primary text-white">
          Excel File Reader
        </Card.Header>

        <Card.Footer className="bg-light">
          <div className="d-flex justify-content-between">
            <Button 
              variant="success" 
              onClick={() =>  saveToDatabase()}
              disabled={data.length === 0}
            >
              <i className="bi bi-save me-2"></i>
              Enregistrer dans la base de données
            </Button>
            
            <Button 
              variant="outline-primary" 
              onClick={downloadAsJSON}
              disabled={data.length === 0}
            >
              <i className="bi bi-download me-2"></i>
              Télécharger en JSON
            </Button>
          </div>
        </Card.Footer>
        <Card.Body>

          {uploadingError && <div className="alert alert-danger">
            <h6>Impossible d'importer les elements suivants car ils existents deja</h6>
            <ul>
              {JSON.stringify(uploadingError.length)}

              { uploadingError.length > 0 && uploadingError.map((error) => (
                <li >{JSON.stringify(error)}</li>
              ))}
            </ul>
          </div>}
          <Card.Text className="text-muted mb-4">
            Upload an Excel file to view and convert its contents
          </Card.Text>


          
          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Choose Excel File (.xlsx, .xls)</Form.Label>
            <Form.Control 
              type="file" 
              accept=".xlsx,.xls" 
              onChange={handleFileUpload}
            />
          </Form.Group>

          {error && <Alert variant="danger">{error}</Alert>}

          {fileName && (
            <div className="mb-3">
              <p className="mb-2">
                <strong>File:</strong> {fileName}
              </p>
              
              {sheets.length > 1 && (
                <div className="mb-3">
                  <p className="mb-2"><strong>Sheets:</strong></p>
                  <div className="d-flex flex-wrap gap-2">
                    {sheets.map((sheet) => (
                      <Button
                        key={sheet}
                        variant={activeSheet === sheet ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => switchSheet(sheet)}
                        className="text-nowrap"
                      >
                        {sheet}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {data.length > 0 && (
            <div className="table-responsive">
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    {data[0].map((header, index) => (
                      <th key={index}>{header || `Column ${index + 1}`}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
       
      </Card>
    </Container>
  );
};

export default ExcelReader;