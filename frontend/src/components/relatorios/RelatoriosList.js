import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faBalanceScale } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

const RelatoriosList = () => {
	const navigate = useNavigate();

	const handleVerBalanco = () => {
		navigate("/relatorios/balanco-patrimonial");
	};

	return (
		<Container>
			<h1 className="mb-4">Relatórios</h1>
			<Row className="justify-content-center">
				<Col md={3} sm={6} className="mb-4">
					<Card className="shadow">
						<Card.Body className="p-3">
							<div className="d-flex align-items-center mb-2">
								<div className="bg-primary text-white p-2 rounded me-2">
									<FontAwesomeIcon icon={faBalanceScale} />
								</div>
								<h5 className="card-title mb-0">Balanço Patrimonial</h5>
							</div>
							<Card.Text className="my-2 small">
								Relatório com ativos, passivos e patrimônio líquido da empresa.
							</Card.Text>
						</Card.Body>
						<Card.Footer className="bg-white border-0 p-2">
							<Button
								variant="primary"
								size="sm"
								className="w-100"
								onClick={handleVerBalanco}
							>
								<FontAwesomeIcon icon={faFileAlt} className="me-1" /> Gerar
							</Button>
						</Card.Footer>
					</Card>
				</Col>
			</Row>
		</Container>
	);
};

export default RelatoriosList;
