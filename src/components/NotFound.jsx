import React from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';

const NotFound = () => {
  const goHome = () => {
    window.location.href = '/dashboard';
  };

  const goBack = () => {
    window.history.back();
  };


  return (
    <div 
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{ 
        background: 'linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-xl-6">
            <Card className="shadow-lg border-0" style={{ borderRadius: '20px' }}>
              {/* Animation 404 */}
              <div className="text-center mb-4">
                <div 
                  className="d-inline-block position-relative"
                  style={{
                    animation: 'bounce 2s infinite',
                  }}
                >
                  <div 
                    className="display-1 fw-bold mb-0"
                    style={{ 
                      fontSize: '8rem',
                      background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    404
                  </div>
                  
                  {/* Icônes flottantes */}
                  <div 
                    className="position-absolute"
                    style={{
                      top: '20%',
                      left: '-20%',
                      animation: 'float 3s ease-in-out infinite'
                    }}
                  >
                    <i 
                      className="pi pi-search text-primary" 
                      style={{ fontSize: '2rem', opacity: 0.6 }}
                    ></i>
                  </div>
                  
                  <div 
                    className="position-absolute"
                    style={{
                      top: '10%',
                      right: '-25%',
                      animation: 'float 4s ease-in-out infinite reverse'
                    }}
                  >
                    <i 
                      className="pi pi-question-circle text-warning" 
                      style={{ fontSize: '1.5rem', opacity: 0.6 }}
                    ></i>
                  </div>
                  
                  <div 
                    className="position-absolute"
                    style={{
                      bottom: '10%',
                      left: '10%',
                      animation: 'float 2.5s ease-in-out infinite'
                    }}
                  >
                    <i 
                      className="pi pi-exclamation-triangle text-danger" 
                      style={{ fontSize: '1.2rem', opacity: 0.6 }}
                    ></i>
                  </div>
                </div>
              </div>

              {/* Message principal */}
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-3" style={{ color: 'var(--primary-blue)' }}>
                  Oups ! Page non trouvée
                </h2>
                <p className="text-muted fs-5 mb-4">
                  La page que vous recherchez semble avoir pris des vacances.<br />
                  Elle n'existe pas ou a été déplacée.
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="d-flex justify-content-center gap-3 mb-4">
                <Button
                  label="Retour en arrière"
                  icon="pi pi-arrow-left"
                  outlined
                  onClick={goBack}
                  className="px-4 py-2"
                  style={{ 
                    borderColor: 'var(--primary-blue)',
                    color: 'var(--primary-blue)'
                  }}
                />
                <Button
                  label="Aller à l'accueil"
                  icon="pi pi-home"
                  onClick={goHome}
                  className="px-4 py-2"
                  style={{ 
                    background: 'linear-gradient(135deg, var(--primary-blue) 0%, var(--secondary-blue) 100%)',
                    border: 'none'
                  }}
                />
              </div>

              

              <div 
                className="text-center mt-4 p-3 rounded"
                style={{ backgroundColor: '#f8fafc' }}
              >
                <div className="d-flex justify-content-center align-items-center mb-2">
                  <i className="pi pi-info-circle me-2 text-info"></i>
                  <span className="fw-semibold text-muted">Besoin d'aide ?</span>
                </div>
                
                <div className="row text-center">
                  <div className="col-4">
                    <Button
                      icon="pi pi-phone"
                      rounded
                      outlined
                      className="mb-1"
                      style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}
                      onClick={() => {
                        window.location.href = 'tel:+25779123456';
                      }}
                    />
                    <div>
                      <small className="text-muted d-block">Support</small>
                      <small className="fw-semibold">+257 79 123 456</small>
                    </div>
                  </div>
                  
                  <div className="col-4">
                    <Button
                      icon="pi pi-envelope"
                      rounded
                      outlined
                      className="mb-1"
                      style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}
                      onClick={() => {
                        window.location.href = 'mailto:support@advancedit.bi';
                      }}
                    />
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <small className="fw-semibold">support@advancedit.bi</small>
                    </div>
                  </div>
                  
                  <div className="col-4">
                    <Button
                      icon="pi pi-question-circle"
                      rounded
                      outlined
                      className="mb-1"
                      style={{ borderColor: 'var(--primary-blue)', color: 'var(--primary-blue)' }}
                      onClick={() => {
                        alert('Centre d\'aide en cours de développement');
                      }}
                    />
                    <div>
                      <small className="text-muted d-block">FAQ</small>
                      <small className="fw-semibold">Centre d'aide</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-3">
                <small className="text-muted">
                  © 2025 Advanced IT Store - Système de gestion
                </small>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0, 0, 0);
          }
          40%, 43% {
            transform: translate3d(0, -15px, 0);
          }
          70% {
            transform: translate3d(0, -7px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) rotate(5deg);
          }
        }
        
        .card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95) !important;
        }
        
        .btn:hover {
          transform: translateY(-2px);
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .display-1 {
          position: relative;
        }
        
        .display-1::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120%;
          height: 120%;
          background: radial-gradient(circle, rgba(46, 125, 184, 0.1) 0%, transparent 70%);
          border-radius: 50%;
          z-index: -1;
        }
        
        @media (max-width: 768px) {
          .display-1 {
            font-size: 5rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .display-1 {
            font-size: 4rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default NotFound;