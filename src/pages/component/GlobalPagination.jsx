import React from 'react';
import PropTypes from 'prop-types';

const GlobalPagination = ({
  currentPage = 1,
  lastPage = 1,
  total = 0,
  from = 0,
  to = 0,
  onPageChange,
  showInfo = true,
  showFirstLast = true,
  maxVisiblePages = 7,
  size = 'sm', // 'sm', 'md', 'lg'
  className = '',
  disabled = false,
  infoTemplate = null, // Custom info template
  translations = {
    showing: 'Affichage de',
    to: 'à',
    of: 'sur',
    results: 'résultats',
    first: 'Premier',
    last: 'Dernier',
    previous: 'Précédent',
    next: 'Suivant'
  }
}) => {
  // Ne pas afficher si une seule page
  if (lastPage <= 1) return null;

  // Calcul des pages visibles
  const getVisiblePages = () => {
    const pages = [];
    const current = currentPage;
    const last = lastPage;

    if (last <= maxVisiblePages) {
      return Array.from({ length: last }, (_, i) => i + 1);
    }

    // Toujours afficher la première page
    pages.push(1);

    // Ajouter des points de suspension si nécessaire
    if (current > Math.floor(maxVisiblePages / 2) + 1) {
      pages.push('...');
    }

    // Pages autour de la page actuelle
    const start = Math.max(2, current - Math.floor((maxVisiblePages - 2) / 2));
    const end = Math.min(last - 1, current + Math.floor((maxVisiblePages - 2) / 2));

    for (let i = start; i <= end; i++) {
      if (i !== 1 && i !== last) {
        pages.push(i);
      }
    }

    // Ajouter des points de suspension si nécessaire
    if (current < last - Math.floor(maxVisiblePages / 2)) {
      if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }

    // Toujours afficher la dernière page
    if (last !== 1) {
      pages.push(last);
    }

    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== '...' && page !== currentPage && !disabled) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1 && !disabled) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < lastPage && !disabled) {
      onPageChange(currentPage + 1);
    }
  };

  const handleFirst = () => {
    if (currentPage !== 1 && !disabled) {
      onPageChange(1);
    }
  };

  const handleLast = () => {
    if (currentPage !== lastPage && !disabled) {
      onPageChange(lastPage);
    }
  };

  // Classes CSS selon la taille
  const sizeClasses = {
    sm: 'pagination-sm',
    md: '',
    lg: 'pagination-lg'
  };

  // Template d'information par défaut
  const defaultInfoTemplate = () => (
    <div className="text-muted small">
      {translations.showing} <strong>{from}</strong> {translations.to} <strong>{to}</strong> {translations.of} <strong>{total}</strong> {translations.results}
    </div>
  );

  const visiblePages = getVisiblePages();

  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      {/* Information sur les résultats */}
      {showInfo && (
        <div>
          {infoTemplate ? infoTemplate({ from, to, total, currentPage, lastPage }) : defaultInfoTemplate()}
        </div>
      )}

      {/* Navigation pagination */}
      <nav aria-label="Pagination">
        <ul className={`pagination ${sizeClasses[size]} mb-0`}>
          {/* Bouton Premier */}
          {showFirstLast && (
            <li className={`page-item ${currentPage === 1 || disabled ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={handleFirst}
                disabled={currentPage === 1 || disabled}
                title={translations.first}
              >
                <i className="pi pi-angle-double-left"></i>
              </button>
            </li>
          )}

          {/* Bouton Précédent */}
          <li className={`page-item ${currentPage === 1 || disabled ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handlePrevious}
              disabled={currentPage === 1 || disabled}
              title={translations.previous}
            >
              <i className="pi pi-chevron-left"></i>
            </button>
          </li>

          {/* Pages numérotées */}
          {visiblePages.map((page, index) => (
            <li 
              key={index} 
              className={`page-item ${
                page === currentPage ? 'active' : ''
              } ${
                page === '...' || disabled ? 'disabled' : ''
              }`}
            >
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button 
                  className="page-link" 
                  onClick={() => handlePageClick(page)}
                  disabled={disabled}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Bouton Suivant */}
          <li className={`page-item ${currentPage === lastPage || disabled ? 'disabled' : ''}`}>
            <button 
              className="page-link" 
              onClick={handleNext}
              disabled={currentPage === lastPage || disabled}
              title={translations.next}
            >
              <i className="pi pi-chevron-right"></i>
            </button>
          </li>

          {/* Bouton Dernier */}
          {showFirstLast && (
            <li className={`page-item ${currentPage === lastPage || disabled ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={handleLast}
                disabled={currentPage === lastPage || disabled}
                title={translations.last}
              >
                <i className="pi pi-angle-double-right"></i>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};

GlobalPagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  lastPage: PropTypes.number.isRequired,
  total: PropTypes.number,
  from: PropTypes.number,
  to: PropTypes.number,
  onPageChange: PropTypes.func.isRequired,
  showInfo: PropTypes.bool,
  showFirstLast: PropTypes.bool,
  maxVisiblePages: PropTypes.number,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
  infoTemplate: PropTypes.func,
  translations: PropTypes.object
};

export default GlobalPagination;