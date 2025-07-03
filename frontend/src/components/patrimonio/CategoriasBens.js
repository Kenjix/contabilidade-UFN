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
import {
	faPlus,
	faEdit,
	faTrash,
	faSave,
} from "@fortawesome/free-solid-svg-icons";
import {
	getCategoriasBens,
	createCategoriaBem,
	updateCategoriaBem,
	deleteCategoriaBem,
} from "../../services/patrimonioService";

const CategoriasBens = () => {
	const [categorias, setCategorias] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState({
		nome: "",
		descricao: "",
	});
	useEffect(() => {
		loadCategorias();
	}, []);

	const loadCategorias = async () => {
		try {
			setLoading(true);
			const response = await getCategoriasBens();
			if (response && response.data) {
				setCategorias(response.data);
				setError(null);
			}
		} catch (err) {
			setError("Erro ao carregar as categorias. Por favor, tente novamente.");
			console.error("Erro ao carregar categorias:", err);
			setCategorias([]);
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

		if (!form.nome.trim()) {
			setError("O nome da categoria é obrigatório.");
			return;
		}

		try {
			setLoading(true);

			if (editingId) {
				await updateCategoriaBem(editingId, form);
			} else {
				await createCategoriaBem(form);
			}

			await loadCategorias();

			setForm({
				nome: "",
				descricao: "",
			});
			setShowModal(false);
			setEditingId(null);

			setError(null);
		} catch (err) {
			console.error(
				`Erro ao ${editingId ? "atualizar" : "criar"} categoria:`,
				err
			);
			setError(
				`Erro ao ${
					editingId ? "atualizar" : "criar"
				} a categoria. Por favor, tente novamente.`
			);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (categoria) => {
		setForm({
			nome: categoria.nome,
			descricao: categoria.descricao || "",
		});
		setEditingId(categoria.id);
		setShowModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Tem certeza que deseja excluir esta categoria?")) {
			try {
				setLoading(true);
				await deleteCategoriaBem(id);
				await loadCategorias();
				setError(null);
			} catch (err) {
				setError("Erro ao excluir a categoria. Por favor, tente novamente.");
				console.error("Erro ao excluir categoria:", err);
			} finally {
				setLoading(false);
			}
		}
	};

	if (loading && categorias.length === 0) {
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
			<h1 className="mb-4">Categorias de Bens</h1>
			{error && <Alert variant="danger">{error}</Alert>}
			<Button
				variant="primary"
				className="mb-4"
				onClick={() => setShowModal(true)}
			>
				<FontAwesomeIcon icon={faPlus} className="me-2" /> Nova Categoria
			</Button>
			<Card className="shadow-sm">
				<Card.Body>
					<Table striped hover responsive>
						<thead>
							<tr>
								<th>Nome</th>
								<th>Descrição</th>
								<th>Ações</th>
							</tr>
						</thead>
						<tbody>
							{categorias.length === 0 ? (
								<tr>
									<td colSpan="3" className="text-center">
										Nenhuma categoria encontrada.
									</td>
								</tr>
							) : (
								categorias.map((categoria) => (
									<tr key={categoria.id}>
										<td>{categoria.nome}</td>
										<td>{categoria.descricao}</td>
										<td>
											<Button
												variant="outline-primary"
												size="sm"
												className="me-2"
												onClick={() => handleEdit(categoria)}
											>
												<FontAwesomeIcon icon={faEdit} />
											</Button>
											<Button
												variant="outline-danger"
												size="sm"
												onClick={() => handleDelete(categoria.id)}
											>
												<FontAwesomeIcon icon={faTrash} />
											</Button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</Table>
				</Card.Body>
			</Card>
			{/* Modal para nova categoria */}
			<Modal
				show={showModal}
				onHide={() => {
					setShowModal(false);
					setEditingId(null);
					setForm({
						nome: "",
						descricao: "",
					});
				}}
			>
				<Modal.Header closeButton>
					<Modal.Title>
						{editingId ? "Editar Categoria" : "Nova Categoria"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Nome</Form.Label>
							<Form.Control
								type="text"
								name="nome"
								value={form.nome}
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
								onClick={() => {
									setShowModal(false);
									setEditingId(null);
									setForm({
										nome: "",
										descricao: "",
									});
								}}
							>
								Cancelar
							</Button>
							<Button type="submit" variant="primary">
								<FontAwesomeIcon icon={faSave} className="me-2" />
								{editingId ? "Atualizar" : "Salvar"}
							</Button>
						</div>
					</Form>
				</Modal.Body>
			</Modal>
		</Container>
	);
};

export default CategoriasBens;
