import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { Divider } from 'primereact/divider';
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
      className="login-container min-vh-100 d-flex align-items-center justify-content-center"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Animated Background Elements */}
      <div className="position-absolute w-100 h-100">
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: '200px',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            top: '10%',
            left: '10%',
            animation: 'float 6s ease-in-out infinite'
          }}
        />
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            top: '60%',
            right: '15%',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div 
          className="position-absolute rounded-circle"
          style={{
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.1)',
            bottom: '20%',
            left: '20%',
            animation: 'float 4s ease-in-out infinite'
          }}
        />
      </div>

      {/* Login Card */}
      <div className="login-card position-relative" style={{ zIndex: 2 }}>
        <Card 
          className="shadow-lg border-0"
          style={{ 
            width: '450px', 
            maxWidth: '95vw',
            borderRadius: '20px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)'
          }}
        >
          <div className="text-center mb-4">
            <div 
              className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)',
                boxShadow: '0 8px 32px rgba(46, 125, 184, 0.3)'
              }}
            >
              <i className="pi pi-desktop text-white" style={{ fontSize: '2rem' }}></i>
            </div>
            <h2 className="fw-bold mb-2" style={{ color: 'var(--primary-blue)' }}>
              Advanced IT
            </h2>
            <p className="text-muted mb-0">Connectez-vous à votre espace</p>
          </div>

          {error && (
            <Message 
              severity="error" 
              text={error} 
              className="mb-3 w-100"
              style={{ 
                borderRadius: '10px',
                border: 'none',
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
                color: 'white'
              }}
            />
          )}

          <form onSubmit={handleSubmit} className="px-3">
            <div className="mb-4">
              <label htmlFor="email" className="form-label fw-semibold mb-2" style={{ color: 'var(--primary-blue)' }}>
                <i className="pi pi-envelope me-2"></i>
                Adresse email
              </label>
              <InputText
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                className="w-100"
                placeholder="exemple@email.com"
                style={{ 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e1e8ed',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold mb-2" style={{ color: 'var(--primary-blue)' }}>
                <i className="pi pi-lock me-2"></i>
                Mot de passe
              </label>
              <Password
                id="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="w-100"
                placeholder="Entrez votre mot de passe"
                toggleMask
                feedback={false}
                style={{ 
                  borderRadius: '12px',
                }}
                inputStyle={{ 
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e1e8ed',
                  fontSize: '1rem'
                }}
                required
              />
            </div>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="rememberMe" />
                <label className="form-check-label text-muted" htmlFor="rememberMe">
                  Se souvenir de moi
                </label>
              </div>
              <a 
                href="#" 
                className="text-decoration-none fw-semibold"
                style={{ color: 'var(--primary-blue)' }}
              >
                Mot de passe oublié ?
              </a>
            </div>

            <Button
              type="submit"
              label={loading ? "Connexion en cours..." : "Se connecter"}
              loading={loading}
              className="w-100 mb-3"
              style={{ 
                background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)',
                border: 'none',
                padding: '12px',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                boxShadow: '0 4px 16px rgba(46, 125, 184, 0.3)'
              }}
            />

            <Divider className="my-3">
              <span className="text-muted">ou</span>
            </Divider>

            <div className="d-flex gap-2 mb-3">
              <Button
                type="button"
                icon="pi pi-google"
                className="flex-fill"
                outlined
                style={{ 
                  borderColor: '#db4437',
                  color: '#db4437',
                  borderRadius: '12px',
                  padding: '10px'
                }}
              />
              <Button
                type="button"
                icon="pi pi-microsoft"
                className="flex-fill"
                outlined
                style={{ 
                  borderColor: '#0078d4',
                  color: '#0078d4',
                  borderRadius: '12px',
                  padding: '10px'
                }}
              />
            </div>
          </form>

          <div className="text-center mt-4 pt-3" style={{ borderTop: '1px solid #e1e8ed' }}>
            <p className="text-muted mb-0">
              Nouveau sur Advanced IT ? 
              <a 
                href="#" 
                className="text-decoration-none fw-semibold ms-1"
                style={{ color: 'var(--primary-blue)' }}
              >
                Créer un compte
              </a>
            </p>
          </div>
        </Card>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        .login-card {
          animation: slideInUp 0.8s ease-out;
        }
        
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .p-inputtext:focus,
        .p-password input:focus {
          border-color: var(--primary-blue) !important;
          box-shadow: 0 0 0 0.2rem rgba(46, 125, 184, 0.25) !important;
        }
        
        .p-button:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;


