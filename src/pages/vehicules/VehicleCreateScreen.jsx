import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API_CONFIG } from '../../services/config';
import ApiService from '../../services/api';

export default function VehicleCreateScreen() {
    const navigate = useNavigate();

    const [vehicle, setVehicle] = useState({
        brand: '',
        model: '',
        year: '',
        poids: '',
        immatriculation: '',
        status: 'disponible',
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVehicle({ ...vehicle, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(vehicle);
        ApiService.post(API_CONFIG.ENDPOINTS.VEHICLES, vehicle)
            .then(response => {
                console.log(response);
                navigate('/vehicles');
            })
            .catch(error => {
                console.log(error);
            });
    };
  return (
    <div>
        <h1>Nouveau Véhicule</h1>
          <button onClick={() => navigate('/vehicles')}>Retour</button>
          <div className="row">
               
        <form onSubmit={handleSubmit} className="col-6 shadow-sm border-0 p-4">
            <div className="mb-3">
                <label htmlFor="brand" className="form-label">Marque</label>
                <input type="text" className="form-control" id="brand" name="brand" value={vehicle.brand} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
                <label htmlFor="model" className="form-label">Modèle</label>
                <input type="text" className="form-control" id="model" name="model" value={vehicle.model} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
                <label htmlFor="year" className="form-label">Année</label>
                <input type="number" className="form-control" id="year" name="year" value={vehicle.year} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
                <label htmlFor="poids" className="form-label">Poids Maximal</label>
                <input type="number" className="form-control" id="poids" name="poids" value={vehicle.poids} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
                <label htmlFor="immatriculation" className="form-label">Immatriculation</label>
                <input type="text" className="form-control" id="immatriculation" name="immatriculation" value={vehicle.immatriculation} onChange={handleInputChange} />
            </div>
            <div className="mb-3">
                <label htmlFor="status" className="form-label">Statut</label>
                <select className="form-select" id="status" name="status" value={vehicle.status} onChange={handleInputChange}>
                    <option value="disponible">Disponible</option>
                    <option value="en_location">En location</option>
                    <option value="en_reparation">En réparation</option>
                </select>
            </div>
            <button type="submit" className="btn btn-primary">Enregistrer</button>
        </form>
    </div>
    </div>
  )
}
