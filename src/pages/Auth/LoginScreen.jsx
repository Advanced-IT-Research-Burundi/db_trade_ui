import React, { useState, useCallback } from "react";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useAuth } from "../../contexts/AuthContext";

const APP_CONFIG = {
  name: process.env.APP_NAME || "Advanced IT Store",
  description:
    process.env.APP_DESCRIPTION ||
    "Système de gestion des ventes et produits",
  version: process.env.APP_VERSION || "1.0.0",
};

const FEATURES = [
  {
    icon: "pi-shopping-cart",
    label: "Ventes",
    description: "Gestion des commandes et factures",
  },
  { icon: "pi-box", label: "Stock", description: "Inventaire en temps réel" },
  {
    icon: "pi-chart-line",
    label: "Rapports",
    description: "Analyses et statistiques",
  },
  {
    icon: "pi-users",
    label: "Clients",
    description: "Base de données clients",
  },
];

const LoginScreen = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { login } = useAuth();
  const [loginloading, setLoginloading] = useState(false);

  const handleInputChange = useCallback(
    (field, value) => {
      setCredentials((prev) => ({ ...prev, [field]: value }));
      if (error) setError("");
    },
    [error]
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        setLoginloading(true);
        const result = await login(credentials);
        if (!result.success) {
          setError(result.error || "Erreur de connexion");
        }
        setLoginloading(false);
      } catch (err) {
        setError("Erreur de connexion. Veuillez réessayer" + err.message);
        setLoginloading(false);
      }
    },
    [credentials, login]
  );

  const isFormValid = credentials.email.trim() && credentials.password.trim();

  return (
    <div
      className="d-flex align-items-center justify-content-center min-vh-100"
      style={{
        backgroundColor: "#f8fafc",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div className="container-fluid px-3">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <Card
              className="border-0 shadow-lg"
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                maxWidth: "1000px",
                margin: "0 auto",
              }}
            >
              <div className="row g-0">
                <div className="col-lg-6 d-none d-lg-block">
                  <div
                    className="h-100 d-flex flex-column p-5"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                      color: "white",
                    }}
                  >
                    <div className="text-center mb-5">
                      <div
                        className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "rgba(255, 255, 255, 0.2)",
                          backdropFilter: "blur(10px)",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        <i
                          className="pi pi-shop"
                          style={{ fontSize: "2rem" }}
                        ></i>
                      </div>
                      <h1 className="h2 fw-bold mb-2">{APP_CONFIG.name}</h1>
                      <p className="opacity-75 mb-0">
                        {APP_CONFIG.description}
                      </p>
                      <small className="opacity-50">
                        Version {APP_CONFIG.version}
                      </small>
                    </div>

                    <div className="flex-grow-1">
                      <h5 className="mb-4 fw-bold">
                        Fonctionnalités principales
                      </h5>
                      {FEATURES.map((feature, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-start mb-4"
                        >
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle me-3"
                            style={{
                              width: "50px",
                              height: "50px",
                              background: "rgba(255, 255, 255, 0.2)",
                              backdropFilter: "blur(10px)",
                            }}
                          >
                            <i
                              className={`pi ${feature.icon}`}
                              style={{ fontSize: "1.5rem" }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="mb-1 fw-bold">{feature.label}</h6>
                            <p className="mb-0 opacity-75 small">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto">
                      <div className="d-flex align-items-center">
                        <i className="pi pi-shield opacity-75 me-2"></i>
                        <small className="opacity-75">
                          Connexion sécurisée SSL
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <div className="h-100 d-flex flex-column justify-content-center p-5">
                    {error && (
                      <Message
                        severity="error"
                        text={error}
                        className="mb-4 w-100"
                        style={{
                          borderRadius: "12px",
                          border: "none",
                          background:
                            "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                          color: "white",
                        }}
                      />
                    )}

                    <div className="text-center mb-5">
                      <h2 className="h3 fw-bold mb-2 text-dark">Connexion</h2>
                      <p className="text-muted mb-0">
                        Accédez à votre espace de gestion
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="w-100">
                      <div className="mb-4">
                        <label
                          htmlFor="email"
                          className="form-label fw-semibold mb-2 text-dark"
                        >
                          <i className="pi pi-envelope me-2 text-muted"></i>
                          Adresse email
                        </label>
                        <InputText
                          id="email"
                          type="email"
                          value={credentials.email}
                          onChange={(e) =>
                            handleInputChange("email", e.target.value)
                          }
                          className="w-100"
                          placeholder="votre@email.com"
                          style={{
                            padding: "0.875rem 1rem",
                            borderRadius: "12px",
                            border: "2px solid #e5e7eb",
                            backgroundColor: "#f9fafb",
                            fontSize: "1rem",
                          }}
                          autoComplete="email"
                          required
                        />
                      </div>

                      <div className="mb-4">
                        <label
                          htmlFor="password"
                          className="form-label fw-semibold mb-2 text-dark"
                        >
                          <i className="pi pi-lock me-2 text-muted"></i>
                          Mot de passe
                        </label>
                        <InputText
                          id="password"
                          type="password"
                          value={credentials.password}
                          onChange={(e) =>
                            handleInputChange("password", e.target.value)
                          }
                          className="w-100"
                          placeholder="Votre mot de passe"
                          style={{
                            padding: "0.875rem 1rem",
                            borderRadius: "12px",
                            border: "2px solid #e5e7eb",
                            backgroundColor: "#f9fafb",
                            fontSize: "1rem",
                          }}
                          autoComplete="current-password"
                          required
                        />
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember"
                          />
                          <label
                            className="form-check-label text-muted ms-2"
                            htmlFor="remember"
                          >
                            Se souvenir de moi
                          </label>
                        </div>
                        <a
                          href="#"
                          className="text-decoration-none fw-semibold"
                          style={{ color: "#3b82f6" }}
                        >
                          Mot de passe oublié ?
                        </a>
                      </div>

                      <Button
                        type="submit"
                        label={
                          loginloading
                            ? "Connexion en cours..."
                            : "Se connecter"
                        }
                        loading={loginloading}
                        icon={!loginloading ? "pi pi-sign-in" : ""}
                        className="w-100"
                        style={{
                          background:
                            "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                          border: "none",
                          padding: "1rem",
                          borderRadius: "12px",
                          fontSize: "1.1rem",
                          fontWeight: "600",
                          boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3)",
                        }}
                        disabled={!isFormValid || loginloading}
                      />
                    </form>

                    <div className="text-center mt-4">
                      <small className="text-muted">
                        <i className="pi pi-info-circle me-1"></i>
                        Besoin d'aide ? Contactez le support technique
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <style>{`
        .p-inputtext:focus,
        .p-password input:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
          background-color: white !important;
        }
        
        .p-inputtext:hover,
        .p-password input:hover {
          border-color: #9ca3af !important;
          background-color: white !important;
        }
        
        .p-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(59, 130, 246, 0.4) !important;
        }
        
        .p-password .p-inputtext {
          width: 100% !important;
        }
        
        .p-password {
          width: 100% !important;
        }
        
        .form-check-input:checked {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
