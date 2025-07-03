import React from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faBuilding,
	faList,
	faMoneyBillWave,
	faBalanceScale,
	faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const PatrimonioIndex = () => {
	const navigate = useNavigate();

	return (
		<Container className="py-4">
			<h1 className="mb-4">Patrimônio</h1>
			<Alert variant="info" className="mb-4">
				<div className="d-flex">
					<div className="me-3">
						<FontAwesomeIcon icon={faInfoCircle} size="lg" />
					</div>
					<div className="d-flex flex-column align-items-center w-100">
						<h5>Entendendo o Patrimônio da Empresa</h5>
						<span className="align-self-start text-start">
							O sistema gerencia os bens e direitos da empresa da seguinte
							forma:
						</span>
						<ul className="mb-0 align-self-start text-start">
							<li>
								<strong>Bens Patrimoniais:</strong> Ativos fixos como imóveis,
								veículos e equipamentos que permanecem no patrimônio da empresa.
							</li>
							<li>
								<strong>Mercadorias:</strong> Itens adquiridos para revenda,
								gerenciados no módulo de Produtos e Estoque.
							</li>
							<li>
								<strong>Contas a Receber:</strong> Valores a receber de clientes
								por mercadorias vendidas a prazo, controladas no módulo de
								Vendas.
							</li>
						</ul>
					</div>
				</div>
			</Alert>
			<Row className="g-4">
				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body className="d-flex flex-column">
							<div className="d-flex align-items-center mb-3">
								<div className="bg-primary text-white p-3 rounded me-3">
									<FontAwesomeIcon icon={faBuilding} size="lg" />
								</div>
								<h5 className="mb-0">Bens Patrimoniais</h5>
							</div>
							<Card.Text>
								Gerencie os bens patrimoniais da empresa (imóveis, veículos,
								máquinas e equipamentos) que permanecem no patrimônio e não se
								destinam à revenda.
							</Card.Text>
							<Button
								variant="outline-primary"
								className="mt-auto"
								onClick={() => navigate("/patrimonio/bens")}
							>
								Acessar
							</Button>
						</Card.Body>
					</Card>
				</Col>

				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body className="d-flex flex-column">
							<div className="d-flex align-items-center mb-3">
								<div className="bg-success text-white p-3 rounded me-3">
									<FontAwesomeIcon icon={faList} size="lg" />
								</div>
								<h5 className="mb-0">Categorias</h5>
							</div>
							<Card.Text>
								Organize seus bens patrimoniais em categorias para melhor
								controle e organização.
							</Card.Text>
							<Button
								variant="outline-success"
								className="mt-auto"
								onClick={() => navigate("/patrimonio/categorias")}
							>
								Acessar
							</Button>
						</Card.Body>
					</Card>
				</Col>

				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body className="d-flex flex-column">
							<div className="d-flex align-items-center mb-3">
								<div className="bg-warning text-white p-3 rounded me-3">
									<FontAwesomeIcon icon={faMoneyBillWave} size="lg" />
								</div>
								<h5 className="mb-0">Capital Social</h5>
							</div>
							<Card.Text>
								Gerencie o capital social da empresa, valores de abertura e
								aporte de capital.
							</Card.Text>
							<Button
								variant="outline-warning"
								className="mt-auto"
								onClick={() => navigate("/patrimonio/capital-social")}
							>
								Acessar
							</Button>
						</Card.Body>
					</Card>
				</Col>

				<Col md={4}>
					<Card className="h-100 shadow-sm">
						<Card.Body className="d-flex flex-column">
							<div className="d-flex align-items-center mb-3">
								<div className="bg-info text-white p-3 rounded me-3">
									<FontAwesomeIcon icon={faBalanceScale} size="lg" />
								</div>
								<h5 className="mb-0">Balanço Patrimonial</h5>
							</div>
							<Card.Text>
								Visualize o balanço patrimonial da empresa com ativos, passivos
								e patrimônio líquido.
							</Card.Text>
							<Button
								variant="outline-info"
								className="mt-auto"
								onClick={() => navigate("/relatorios/balanco-patrimonial")}
							>
								Acessar
							</Button>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default PatrimonioIndex;
