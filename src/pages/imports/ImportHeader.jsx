import NavItem from "./NavItem";

const ImportHeader = () => {
  return (
    <div className="mb-4">
      <ul className="nav nav-tabs">
        <NavItem to="/commandes" label="Bon de commandes" />
        <NavItem to="/commandes-lists" label="Liste des commandes" />
        <NavItem to="/livraison" label="Bon de livraison" />
        <NavItem to="/importFile" label="Import de fichier des données d'usines" />
      </ul>
    </div>
  );
};

export default ImportHeader;
