import React from 'react';
import { NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHome, 
  faShoppingCart, 
  faUsers, 
  faBoxes, 
  faWarehouse 
} from '@fortawesome/free-solid-svg-icons';

const SideNav = () => {
  return (
    <div className="sidebar">
      <div className="p-3 text-white">
        <h4>Sistema de Contabilidade</h4>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item">
          <NavLink to="/" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FontAwesomeIcon icon={faHome} className="me-2" /> Início
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/vendas" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FontAwesomeIcon icon={faShoppingCart} className="me-2" /> Vendas
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/clientes" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FontAwesomeIcon icon={faUsers} className="me-2" /> Clientes
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/produtos" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FontAwesomeIcon icon={faBoxes} className="me-2" /> Produtos
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/estoque" className={({isActive}) => isActive ? "sidebar-link active" : "sidebar-link"}>
            <FontAwesomeIcon icon={faWarehouse} className="me-2" /> Estoque
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default SideNav;