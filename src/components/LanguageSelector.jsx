import React, { useState } from 'react';
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { localeSelector } from '../stores/selectors/appSelectors.js';
import { setLocaleAction } from '../stores/actions/appActions.js';

const LanguageSelector = ({ onToggleParent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const locale = useSelector(localeSelector);
  const intl = useIntl();

  const handleLocaleChange = (e, newLocale) => {
    e.preventDefault();
    dispatch(setLocaleAction(newLocale));
    setIsOpen(false);
    if (onToggleParent) {
      onToggleParent();
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary btn-sm dropdown-toggle  d-flex align-items-center justify-content-center"
        type="button"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
      >
        <i className="pi pi-globe me-2"></i>
        <span className="text-uppercase">{locale}</span>
      </button>
      
      {isOpen && (
        <>
          {/* Overlay pour fermer le dropdown en cliquant à l'extérieur */}
          <div 
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ zIndex: 1040 }}
            onClick={() => setIsOpen(false)}
          />
          
          <ul 
            className="dropdown-menu show position-absolute end-0"
            style={{ zIndex: 1050 }}
          >
            <li>
              <button
                className="dropdown-item d-flex align-items-center"
                onClick={(e) => handleLocaleChange(e, 'en')}
              >
                <i className="pi pi-flag me-2"></i>
                English
              </button>
            </li>
            <li>
              <button
                className="dropdown-item d-flex align-items-center"
                onClick={(e) => handleLocaleChange(e, 'fr')}
              >
                <i className="pi pi-flag me-2"></i>
                Français
              </button>
            </li>
          </ul>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;