import { useCallback } from 'react';
import html2pdf from 'html2pdf.js';

export default function usePrint() {
  const print = useCallback((elementId = null) => {
    if (elementId) {
      const element = document.getElementById(elementId);
      if (!element) {
        console.warn("Élément introuvable pour impression.");
        return;
      }
  
      const printWindow = window.open('', '', 'width=800,height=600');
      
      if (!printWindow) {
        console.error("Impossible d'ouvrir la fenêtre d'impression.");
        return;
      }
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression</title>
            <meta charset="utf-8">
            <style>
              body { 
                font-family: sans-serif; 
                padding: 20px; 
                margin: 0;
              }
              @media print {
                body { margin: 0; padding: 10px; }
                @page { margin: 1cm; }
              }
            </style>
          </head>
          <body>
            ${element.innerHTML}
          </body>
        </html>
      `);
      
      printWindow.document.close();
      printWindow.focus();
      
      // Attendre un peu avant d'imprimer
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
      
    } else {
      window.print();
    }
  }, []);

  const generatePdf = useCallback((elementId = null) => {
    if (elementId) {
      // Générer un PDF spécifique
      const element = document.getElementById(elementId);
      html2pdf().set({
        margin: 0,
        filename: `${elementId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(element).save();
    } else {
      // Générer un PDF de la page entière
      html2pdf().set({
        margin: 0,
        filename: 'page.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(document.body).save();
    }
  }, []);

  

  return { print, generatePdf };
}
