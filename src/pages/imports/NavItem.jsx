import { Link, useLocation } from "react-router-dom";

const NavItem = ({ to, label }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className="nav-item">
      <Link className={`nav-link ${isActive ? "active" : ""}`} to={to}>
        {label}
      </Link>
    </li>
  );
};

export default NavItem;
