import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(credentials);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div 
      className="login-container d-flex align-items-center justify-content-center min-vh-100"
      style={{ backgroundColor: '#f8f9fa' }}
    >
      <div className="login-card">
        <Card 
          title="Connexion"
          className="shadow-lg"
          style={{ width: '400px', maxWidth: '90vw' }}
        >
          <div className="text-center mb-4">
            <i className="pi pi-desktop" style={{ fontSize: '3rem', color: 'var(--primary-blue)' }}></i>
            <h3 className="mt-2" style={{ color: 'var(--primary-blue)' }}>Advanced IT</h3>
          </div>

          {error && (
            <Message 
              severity="error" 
              text={error} 
              className="mb-3 w-100" 
            />
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email</label>
              <InputText
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-100"
                placeholder="Entrez votre email"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <Password
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-100"
                placeholder="Entrez votre mot de passe"
                toggleMask
                feedback={false}
                required
              />
            </div>

            <Button
              type="submit"
              label="Se connecter"
              loading={loading}
              className="w-100"
              style={{ backgroundColor: 'var(--primary-blue)', border: 'none' }}
            />
          </form>

          <div className="text-center mt-3">
            <a href="#" className="text-decoration-none" style={{ color: 'var(--primary-blue)' }}>
              Mot de passe oublié ?
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginScreen;