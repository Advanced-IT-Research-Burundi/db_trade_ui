import { useCallback } from 'react';

export default function usePrint() {
  const print = useCallback((elementId = null) => {
    if (elementId) {
      // Imprimer seulement un élément spécifique
      const element = document.getElementById(elementId);
      const printContent = element.innerHTML;
      const originalContent = document.body.innerHTML;
      
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload(); // Restaurer les event listeners
    } else {
      // Imprimer toute la page
      window.print();
    }
  }, []);

  return { print };
}
