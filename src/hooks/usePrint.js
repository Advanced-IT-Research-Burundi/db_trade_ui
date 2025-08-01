import { useCallback } from 'react';
import html2pdf from 'html2pdf.js';

export default function usePrint() {
  const print = useCallback((elementId = null, format = 'a4', options = {}) => {
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
  
      // Définir le style selon le format
      let pageSizeCSS = '';
  
      if (format === 'thermal58') {
        pageSizeCSS = `
          @page {
            size: 58mm auto;
            margin: 5mm;
          }
          body {
            width: 58mm;
            font-size: 10px;
          }
        `;
      } else if (format === 'thermal80') {
        pageSizeCSS = `
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          body {
            width: 80mm;
            font-size: 10px;
          }
        `;
      } else {
        // format A4 par défaut
        pageSizeCSS = `
          @page {
            size: A4;
            margin: 1cm;
          }
          body {
            width: 100%;
          }
        `;
      }
  
      printWindow.document.write(`
        <html>
          <head>
            <title>Impression</title>
            <meta charset="utf-8">
            <style>
              @media print {
                ${pageSizeCSS}
              }
              body {
                padding: 10px;
                font-family: Arial, sans-serif;
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
  
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      window.print();
    }
  }, []);
  

  const generatePdf = useCallback((elementId = null, format = 'a4') => {
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
        jsPDF: { unit: 'mm', format: format, orientation: 'portrait' },
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
        jsPDF: { unit: 'mm', format: format, orientation: 'portrait' },
      }).from(document.body).save();
    }
  }, []);

  

  return { print, generatePdf };
}
