import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchApiData } from "../../stores/slicer/apiDataSlicer";
import { API_CONFIG } from "../../services/config";
import LoadingComponent from "../component/LoadingComponent";
import GlobalPagination from "../component/GlobalPagination";
import { Card, Table, Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { FaEdit, FaEye, FaSearch, FaTimes, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect } from "react";
export default function StockShowScreen() {
    const { id } = useParams();
    const dispatch = useDispatch();
    const currentStock = useSelector((state) => state.apiData?.data?.currentStock);

    useEffect(() => {
        dispatch(fetchApiData({
            url: `${API_CONFIG.ENDPOINTS.STOCKS}/${id}`,
            itemKey: 'currentStock'
        }));
    }, [id, dispatch]);


   
    // Données placeholder
    const stock = {
        id: 1,
        name: "Stock Principal",
        location: "Entrepôt Central - Zone A",
        description: "Stock principal pour les produits électroniques et accessoires",
        agency: {
            id: 1,
            name: "Agence Centrale"
        },
        createdBy: {
            full_name: "Jean Dupont"
        },
        created_at: "2024-01-15T10:30:00Z",
        users: [
            {
                id: 1,
                first_name: "Marie",
                last_name: "Martin",
                email: "marie.martin@example.com",
                role: "manager",
                agency: { name: "Agence Nord" },
                profile_photo: null,
                initials: "MM",
                pivot: { created_at: "2024-01-20T14:00:00Z" }
            },
            {
                id: 2,
                first_name: "Pierre",
                last_name: "Durand",
                email: "pierre.durand@example.com",
                role: "employee",
                agency: { name: "Agence Sud" },
                profile_photo: null,
                initials: "PD",
                pivot: { created_at: "2024-01-22T09:15:00Z" }
            }
        ],
        proformas: [
            {
                id: 1,
                number: "PRF-2024-001",
                client: { name: "Société ABC" },
                total_amount: 250000,
                invoice_type: "standard",
                sale_date: "2024-07-20",
                note: "Commande urgente pour le client VIP"
            },
            {
                id: 2,
                number: "PRF-2024-002", 
                client: { name: "Entreprise XYZ" },
                total_amount: 180000,
                invoice_type: "express",
                sale_date: "2024-07-19",
                note: null
            }
        ]
    };

    const recentProducts = [
        {
            id: 1,
            product: {
                id: 1,
                name: "iPhone 15 Pro",
                code: "IPH15P",
                unit: "Unité",
                image: null
            },
            quantity: 25,
            created_at: "2024-07-22T08:30:00Z"
        },
        {
            id: 2,
            product: {
                id: 2,
                name: "Samsung Galaxy S24",
                code: "SGS24",
                unit: "Unité", 
                image: null
            },
            quantity: 15,
            created_at: "2024-07-21T16:45:00Z"
        }
    ];

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString('fr-FR');
    };

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
    };

    return (
        <div className="container-fluid px-4">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="d-flex justify-content-between mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link to="/dashboard">
                            <i className="bi bi-house"></i> Accueil
                        </Link>
                    </li>
                    <li className="breadcrumb-item">
                        <Link to="/stocks">
                            <i className="bi bi-boxes"></i> Stocks
                        </Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {stock.name}
                    </li>
                </ol>
                <div className="ms-auto">
                    <button className="btn btn-warning">
                        <i className="bi bi-pencil me-2"></i>
                        Modifier
                    </button>
                </div>
            </nav>

            <div className="row">
                { JSON.stringify(currentStock) }
                {/* Informations principales */}
                <div className="col-lg-8">
                    {/* Section des derniers produits ajoutés */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                            <h6 className="card-title mb-0">
                                <i className="bi bi-clock-history me-2"></i>
                                Derniers produits ajoutés
                            </h6>
                            <button className="btn btn-outline-light btn-sm">
                                <i className="bi bi-boxes me-1"></i>
                                Voir tous les produits
                            </button>
                        </div>
                        <div className="card-body">
                            {recentProducts.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-sm table-hover">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Produit</th>
                                                <th>Code</th>
                                                <th>Quantité</th>
                                                <th>Date d'ajout</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentProducts.map(stockProduct => (
                                                <tr key={stockProduct.id}>
                                                    <td>
                                                        <div className="d-flex align-items-center">
                                                            {stockProduct.product.image ? (
                                                                <img 
                                                                    src={stockProduct.product.image}
                                                                    alt={stockProduct.product.name}
                                                                    className="rounded me-2"
                                                                    style={{width: '32px', height: '32px', objectFit: 'cover'}}
                                                                />
                                                            ) : (
                                                                <div 
                                                                    className="rounded bg-secondary me-2 d-flex align-items-center justify-content-center"
                                                                    style={{width: '32px', height: '32px'}}
                                                                >
                                                                    <i className="bi bi-box text-white"></i>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <strong>{stockProduct.product.name}</strong>
                                                                <br />
                                                                <small className="text-muted">{stockProduct.product.unit}</small>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">
                                                            {stockProduct.product.code}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-primary">
                                                            {stockProduct.quantity.toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small>
                                                            <i className="bi bi-calendar me-1"></i>
                                                            {formatDate(stockProduct.created_at)}
                                                            <br />
                                                            <i className="bi bi-clock me-1"></i>
                                                            {formatTime(stockProduct.created_at)}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <div className="btn-group btn-group-sm">
                                                            <button className="btn btn-outline-info" title="Voir les mouvements">
                                                                <i className="bi bi-arrows-angle-contract"></i> Mouvement
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-inbox display-4 text-muted"></i>
                                    <p className="text-muted mt-2">Aucun produit dans ce stock</p>
                                    <button className="btn btn-primary">
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Ajouter des produits
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Informations du stock */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-info text-white">
                            <h5 className="card-title mb-0">
                                <i className="bi bi-box-fill me-2"></i>
                                {stock.name}
                            </h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6 className="text-muted mb-3">Informations générales</h6>

                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Nom:</label>
                                        <p className="mb-1">{stock.name}</p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Localisation:</label>
                                        <p className="mb-1">
                                            {stock.location ? (
                                                <>
                                                    <i className="bi bi-geo-alt text-primary me-1"></i>
                                                    {stock.location}
                                                </>
                                            ) : (
                                                <span className="text-muted">Non spécifiée</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Description:</label>
                                        <p className="mb-1">
                                            {stock.description || <span className="text-muted">Aucune description</span>}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-md-6">
                                    <h6 className="text-muted mb-3">Assignations</h6>

                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Agence:</label>
                                        <p className="mb-1">
                                            {stock.agency ? (
                                                <>
                                                    <i className="bi bi-building text-info me-1"></i>
                                                    <a href={`/agencies/${stock.agency.id}`} className="text-decoration-none">
                                                        {stock.agency.name}
                                                    </a>
                                                </>
                                            ) : (
                                                <span className="text-muted">Non assigné</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Utilisateurs associés:</label>
                                        <p className="mb-1">
                                            {stock.users.length > 0 ? (
                                                <>
                                                    <i className="bi bi-people text-success me-1"></i>
                                                    <span className="badge bg-success">{stock.users.length} utilisateur(s)</span>
                                                    <br />
                                                    <small className="text-muted">
                                                        {stock.users.slice(0, 3).map((user, index) => (
                                                            <span key={user.id}>
                                                                {user.first_name} {user.last_name}
                                                                {index < Math.min(stock.users.length, 3) - 1 && ', '}
                                                            </span>
                                                        ))}
                                                        {stock.users.length > 3 && ` et ${stock.users.length - 3} autre(s)...`}
                                                    </small>
                                                </>
                                            ) : (
                                                <span className="text-muted">Aucun utilisateur associé</span>
                                            )}
                                        </p>
                                    </div>

                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Créé par:</label>
                                        <p className="mb-1">
                                            <i className="bi bi-person-circle text-success me-1"></i>
                                            {stock.createdBy?.full_name || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="col-lg-4">
                    {/* Informations système */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-secondary text-white">
                            <h6 className="card-title mb-0">
                                <i className="bi bi-info-circle me-2"></i>
                                Informations système
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-6">
                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">ID:</label>
                                        <p className="mb-1">
                                            <span className="badge bg-secondary">#{stock.id}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="mb-3">
                                        <label className="fw-bold text-muted">Date de création:</label>
                                        <p className="mb-1">
                                            <i className="bi bi-calendar text-primary me-1"></i>
                                            {formatDateTime(stock.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Proformas associés */}
                    <div className="card shadow-sm mb-4">
                        <div className="card-header bg-info text-white">
                            <h6 className="card-title mb-0">
                                <i className="bi bi-receipt me-2"></i>
                                Proformas associés
                                <span className="badge bg-light text-dark ms-2">{stock.proformas.length}</span>
                            </h6>
                        </div>
                        <div className="card-body">
                            {stock.proformas.length > 0 ? (
                                <div className="list-group list-group-flush">
                                    {stock.proformas.slice(0, 5).map(proforma => (
                                        <div key={proforma.id} className="list-group-item px-0 py-2 border-0 border-bottom">
                                            <div className="d-flex justify-content-between align-items-start">
                                                <div className="flex-grow-1">
                                                    <div className="d-flex gap-4">
                                                        <h6 className="mb-1">
                                                            <i className="bi bi-file-earmark-text text-primary me-1"></i>
                                                            #{proforma.number}
                                                        </h6>
                                                        <p className="mb-1 text-muted small">
                                                            <i className="bi bi-person me-1"></i>
                                                            {proforma.client?.name || 'Client non spécifié'}
                                                        </p>
                                                    </div>
                                                    <div className="d-flex gap-4">
                                                        <div className="d-flex align-items-center">
                                                            <span className="badge bg-success me-2">
                                                                {formatCurrency(proforma.total_amount)}
                                                            </span>
                                                            {proforma.invoice_type && (
                                                                <span className="badge bg-secondary">
                                                                    {proforma.invoice_type.charAt(0).toUpperCase() + proforma.invoice_type.slice(1)}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="mb-1 text-muted small">
                                                            <i className="bi bi-calendar-event me-1"></i>
                                                            {proforma.sale_date ? formatDate(proforma.sale_date) : 'Date non définie'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="dropdown">
                                                    <button className="btn btn-sm btn-outline-secondary" 
                                                            type="button" 
                                                            data-bs-toggle="dropdown">
                                                        <i className="bi bi-three-dots-vertical"></i>
                                                    </button>
                                                    <ul className="dropdown-menu">
                                                        <li>
                                                            <a className="dropdown-item" href={`/proformas/${proforma.id}`}>
                                                                <i className="bi bi-eye me-2"></i>Voir détails
                                                            </a>
                                                        </li>
                                                        <li><hr className="dropdown-divider" /></li>
                                                        <li>
                                                            <button className="dropdown-item text-danger">
                                                                <i className="bi bi-trash me-2"></i>Supprimer
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                            {proforma.note && (
                                                <small className="text-muted">
                                                    <i className="bi bi-chat-left-text me-1"></i>
                                                    {proforma.note.length > 50 ? proforma.note.substring(0, 50) + '...' : proforma.note}
                                                </small>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="bi bi-receipt-cutoff text-muted" style={{fontSize: '2rem'}}></i>
                                    <p className="text-muted mt-2 mb-0">Aucune proforma associée</p>
                                    <button className="btn btn-sm btn-primary mt-2">
                                        <i className="bi bi-plus-circle me-1"></i>
                                        Créer une proforma
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions rapides */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white">
                            <h6 className="card-title mb-0">
                                <i className="bi bi-lightning me-2"></i>
                                Actions rapides
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="d-grid gap-2">
                                <button className="btn btn-outline-primary">
                                    <i className="bi bi-boxes me-2"></i>
                                    Gérer les produits
                                </button>

                                <button className="btn btn-outline-info">
                                    <i className="bi bi-people me-2"></i>
                                    Gérer les utilisateurs
                                </button>

                                <button className="btn btn-warning">
                                    <i className="bi bi-pencil me-2"></i>
                                    Modifier ce stock
                                </button>

                                <button className="btn btn-primary">
                                    <i className="bi bi-plus-circle me-2"></i>
                                    Créer un nouveau stock
                                </button>

                                <hr />

                                <button className="btn btn-danger w-100">
                                    <i className="bi bi-trash me-2"></i>
                                    Supprimer ce stock
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section des utilisateurs associés */}
            <div className="card shadow-sm mb-4">
                <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
                    <h6 className="card-title mb-0">
                        <i className="bi bi-people me-2"></i>
                        Utilisateurs associés à ce stock
                    </h6>
                    <div className="btn-group">
                        <span className="badge bg-light text-dark me-2">
                            {stock.users.length} utilisateur(s)
                        </span>
                        {stock.users.length > 5 && (
                            <button className="btn btn-outline-light btn-sm">
                                <i className="bi bi-people me-1"></i>
                                Voir tous les utilisateurs
                            </button>
                        )}
                    </div>
                </div>
                <div className="card-body">
                    {stock.users.length > 0 ? (
                        <div className="table-responsive">
                            <table className="table table-sm table-hover">
                                <thead className="table-light">
                                    <tr>
                                        <th>Utilisateur</th>
                                        <th>Rôle</th>
                                        <th>Agence</th>
                                        <th>Date d'assignation</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stock.users.slice(0, 5).map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="d-flex align-items-center">
                                                    {user.profile_photo ? (
                                                        <img 
                                                            src={user.profile_photo}
                                                            alt={`${user.first_name} ${user.last_name}`}
                                                            className="rounded-circle me-2"
                                                            style={{width: '32px', height: '32px', objectFit: 'cover'}}
                                                        />
                                                    ) : (
                                                        <div 
                                                            className="rounded-circle bg-primary me-2 d-flex align-items-center justify-content-center text-white"
                                                            style={{width: '32px', height: '32px'}}
                                                        >
                                                            {user.initials}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <strong>{user.first_name} {user.last_name}</strong>
                                                        <br />
                                                        <small className="text-muted">{user.email}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge bg-secondary">
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </span>
                                            </td>
                                            <td>
                                                {user.agency ? (
                                                    <>
                                                        <i className="bi bi-geo-alt text-warning me-1"></i>
                                                        {user.agency.name}
                                                    </>
                                                ) : (
                                                    <span className="text-muted">Aucune agence</span>
                                                )}
                                            </td>
                                            <td>
                                                <small>
                                                    <i className="bi bi-calendar me-1"></i>
                                                    {formatDate(user.pivot.created_at)}
                                                    <br />
                                                    <i className="bi bi-clock me-1"></i>
                                                    {formatTime(user.pivot.created_at)}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button className="btn btn-outline-primary" title="Voir le profil">
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    <button className="btn btn-outline-danger" title="Désassigner">
                                                        <i className="bi bi-x-circle"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <i className="bi bi-people display-4 text-muted"></i>
                            <p className="text-muted mt-2">Aucun utilisateur associé à ce stock</p>
                            <button className="btn btn-primary">
                                <i className="bi bi-person-plus me-2"></i>
                                Assigner des utilisateurs
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bouton retour */}
            <div className="row mt-4">
                <div className="col-12">
                    <button className="btn btn-secondary">
                        <i className="bi bi-arrow-left me-2"></i>
                        Retour à la liste des stocks
                    </button>
                </div>
            </div>
        </div>
    );
}