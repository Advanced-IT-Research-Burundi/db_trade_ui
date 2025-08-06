import { Link } from "react-router-dom"

const ImportHeader = () => {
    return (
        <div>
            <ul className="nav nav-tabs">
                <li className="nav-item">
                    <Link className="nav-link" to="/commandes">Bon de commandes</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/livraison">Bon de livraison</Link>
                </li>
                <li className="nav-item">
                    <Link className="nav-link" to="/importFile">Import de fichier des donnees d'usines </Link>
                </li>
           </ul>
        </div>
    )
}

export default ImportHeader