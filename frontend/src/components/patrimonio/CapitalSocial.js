import React, { useState, useEffect } from "react";
import {
	Container,
	Card,
	Form,
	Button,
	Table,
	Alert,
	Spinner,
	Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSave } from "@fortawesome/free-solid-svg-icons";
import {
	getCapitalSocial,
	createCapitalSocial,
} from "../../services/patrimonioService";

const formatCurrency = (value) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number(value));
};

const CapitalSocial = () => {
	const [capitalSocial, setCapitalSocial] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [form, setForm] = useState({
		valor: "",
		data_registro: new Date().toISOString().slice(0, 10),
		descricao: "",
	});

	useEffect(() => {
		loadCapitalSocial();
	}, []);

	const loadCapitalSocial = async () => {
		try {
			setLoading(true);
			const response = await getCapitalSocial();
			setCapitalSocial(response.data);
			setError(null);
		} catch (err) {
			setError(
				"Erro ao carregar o capital social. Por favor, tente novamente."
			);
			console.error("Erro ao carregar capital social:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({
			...form,
			[name]: value,
		});
	};
	const handleSubmit = async (e) => {
		e.preventDefault();

		if (parseFloat(form.valor) <= 0) {
			setError("O valor do capital social deve ser maior que zero.");
			return;
		}

		if (!form.data_registro) {
			setError("A data de registro é obrigatória.");
			return;
		}

		try {
			setLoading(true);

			const formData = {
				...form,
				valor: parseFloat(form.valor),
			};

			await createCapitalSocial(formData);

			await loadCapitalSocial();

			setForm({
				valor: "",
				data_registro: new Date().toISOString().slice(0, 10),
				descricao: "",
			});
			setShowModal(false);

			setError(null);
		} catch (err) {
			setError(
				"Erro ao registrar o capital social. Por favor, tente novamente."
			);
			console.error("Erro ao registrar capital social:", err);
		} finally {
			setLoading(false);
		}
	};

	if (loading && capitalSocial.length === 0) {
		return (
			<Container className="text-center my-5">
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Carregando...</span>
				</Spinner>
			</Container>
		);
	}

	return (
		<Container className="py-4">
			<h1 className="mb-4">Capital Social</h1>

			{error && <Alert variant="danger">{error}</Alert>}

			<Button
				variant="primary"
				className="mb-4"
				onClick={() => setShowModal(true)}
			>
				<FontAwesomeIcon icon={faPlus} className="me-2" /> Registrar Capital
				Social
			</Button>

			<Card className="shadow-sm">
				<Card.Body>
					<Table striped hover responsive>
						<thead>
							<tr>
								<th>Valor</th>
								<th>Data de Registro</th>
								<th>Descrição</th>
							</tr>
						</thead>
						<tbody>
							{capitalSocial.length === 0 ? (
								<tr>
									<td colSpan="3" className="text-center">
										Nenhum registro de capital social encontrado.
									</td>
								</tr>
							) : (
								capitalSocial.map((item) => (
									<tr key={item.id}>
										<td>{formatCurrency(item.valor)}</td>
										<td>
											{new Date(item.data_registro).toLocaleDateString("pt-BR")}
										</td>
										<td>{item.descricao}</td>
									</tr>
								))
							)}
						</tbody>
					</Table>
				</Card.Body>
			</Card>

			{/* Modal para registro de capital social */}
			<Modal show={showModal} onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Registrar Capital Social</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Valor</Form.Label>
							<Form.Control
								type="number"
								name="valor"
								value={form.valor}
								onChange={handleChange}
								step="0.01"
								min="0"
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Data de Registro</Form.Label>
							<Form.Control
								type="date"
								name="data_registro"
								value={form.data_registro}
								onChange={handleChange}
								required
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Descrição</Form.Label>
							<Form.Control
								as="textarea"
								name="descricao"
								value={form.descricao}
								onChange={handleChange}
								rows={3}
							/>
						</Form.Group>

						<div className="d-flex justify-content-end">
							<Button
								variant="secondary"
								className="me-2"
								onClick={() => setShowModal(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" variant="primary">
								<FontAwesomeIcon icon={faSave} className="me-2" />
								Registrar
							</Button>
						</div>
					</Form>
				</Modal.Body>
			</Modal>
		</Container>
	);
};

export default CapitalSocial;
