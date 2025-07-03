import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faHome,
	faShoppingCart,
	faUsers,
	faBox,
	faBoxes,
	faChartBar,
	faBuilding,
	faTruck,
} from "@fortawesome/free-solid-svg-icons";

const Navigation = () => {
	return (
		<Navbar bg="dark" variant="dark" expand="lg" fixed="top">
			<Container fluid>
				<Navbar.Brand as={Link} to="/">
					Sistema de Contabilidade
				</Navbar.Brand>
				<Navbar.Toggle aria-controls="navbar-nav" />
				<Navbar.Collapse id="navbar-nav">
					<Nav className="me-auto">
						<Nav.Link as={NavLink} to="/" end>
							<FontAwesomeIcon icon={faHome} className="me-1" /> Dashboard
						</Nav.Link>
						<Nav.Link as={NavLink} to="/vendas">
							<FontAwesomeIcon icon={faShoppingCart} className="me-1" /> Vendas
						</Nav.Link>
						<Nav.Link as={NavLink} to="/clientes">
							<FontAwesomeIcon icon={faUsers} className="me-1" /> Clientes
						</Nav.Link>
						<Nav.Link as={NavLink} to="/produtos">
							<FontAwesomeIcon icon={faBox} className="me-1" /> Produtos
						</Nav.Link>
						<Nav.Link as={NavLink} to="/compras">
							<FontAwesomeIcon icon={faTruck} className="me-1" /> Compras
						</Nav.Link>
						<Nav.Link as={NavLink} to="/estoque">
							<FontAwesomeIcon icon={faBoxes} className="me-1" /> Estoque
						</Nav.Link>
						<Nav.Link as={NavLink} to="/patrimonio">
							<FontAwesomeIcon icon={faBuilding} className="me-1" /> Patrimônio
						</Nav.Link>
						<Nav.Link as={NavLink} to="/relatorios">
							<FontAwesomeIcon icon={faChartBar} className="me-1" /> Relatórios
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Navigation;
