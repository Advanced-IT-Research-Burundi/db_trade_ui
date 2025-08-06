import { Link } from "react-router-dom"

const ImportHeader = () => {
    return (
        <div>
            <ul>
                <li>
                    <Link to="/commandes">Bon de commandes</Link>
                </li>
                <li>
                    <Link to="/livraison">Bon de livraison</Link>
                </li>
                <li>
                    <Link to="/importFile">Import de fichier des donnees d'usines </Link>
                </li>
           </ul>
        </div>
    )
}

export default ImportHeader