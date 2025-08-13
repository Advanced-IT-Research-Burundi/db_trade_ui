import React from 'react'
import { useNavigate } from 'react-router-dom';

function RapportHeader() {

    const navigate = useNavigate();
  return (
      <div>
          <div className="row">
              <div className="col-12">
                  <ul className="nav nav-tabs">
                      <li className="nav-item">
                          <a className="nav-link active" href="#" onClick={() => navigate('/reports/financial')}>
                              <i className="pi pi-chart-bar"></i>
                              <span>Rapports des depenses Annuelles</span>
                          </a>
                      </li>
                  </ul>
              </div>
          </div>
    </div>
  )
}

export default RapportHeader