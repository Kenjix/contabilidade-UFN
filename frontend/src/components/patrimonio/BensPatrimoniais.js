import React, { useState, useEffect } from "react";
import {
	Container,
	Table,
	Button,
	Card,
	Form,
	Row,
	Col,
	Alert,
	Spinner,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faEdit,
	faTrash,
	faSave,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import {
	getBensPatrimoniais,
	createBemPatrimonial,
	updateBemPatrimonial,
	deleteBemPatrimonial,
	getCategoriasBens,
} from "../../services/patrimonioService";

const formatCurrency = (value) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number(value));
};

const BensPatrimoniais = () => {
	const [bens, setBens] = useState([]);
	const [categorias, setCategorias] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [form, setForm] = useState({
		nome: "",
		tipo: "imovel",
		categoria: "",
		descricao: "",
		valor_aquisicao: "",
		data_aquisicao: new Date().toISOString().slice(0, 10),
		fornecedor: null,
		vida_util_anos: 5,
		taxa_depreciacao_anual: 20.0,
		numero_serie: "",
		localizacao: "",
		nota_fiscal: "",
		forma_pagamento: "à vista",
		parcelas: 1,
	});

	useEffect(() => {
		loadBens();
		loadCategorias();
	}, []);

	const loadBens = async () => {
		try {
			setLoading(true);
			const response = await getBensPatrimoniais();
			setBens(response.data);
			setError(null);
		} catch (err) {
			setError(
				"Erro ao carregar os bens patrimoniais. Por favor, tente novamente."
			);
			console.error("Erro ao carregar bens:", err);
		} finally {
			setLoading(false);
		}
	};

	const loadCategorias = async () => {
		try {
			const response = await getCategoriasBens();
			setCategorias(response.data);
		} catch (err) {
			console.error("Erro ao carregar categorias:", err);
		}
	};
	const handleChange = (e) => {
		const { name, value } = e.target;

		if (name === "forma_pagamento" && value === "à vista") {
			setForm({
				...form,
				[name]: value,
				parcelas: 1,
			});
		} else if (name === "vida_util_anos") {
			const vidaUtil = parseInt(value);
			if (vidaUtil > 0) {
				const taxaDepreciacao = (100 / vidaUtil).toFixed(2);
				setForm({
					...form,
					[name]: value,
					taxa_depreciacao_anual: taxaDepreciacao,
				});
			} else {
				setForm({
					...form,
					[name]: value,
				});
			}
		} else if (name === "taxa_depreciacao_anual") {
			const taxa = parseFloat(value);
			if (taxa > 0) {
				const vidaUtil = Math.round(100 / taxa);
				setForm({
					...form,
					[name]: value,
					vida_util_anos: vidaUtil,
				});
			} else {
				setForm({
					...form,
					[name]: value,
				});
			}
		} else {
			setForm({
				...form,
				[name]: value,
			});
		}
	};

	const resetForm = () => {
		setForm({
			nome: "",
			tipo: "imovel",
			categoria: "",
			descricao: "",
			valor_aquisicao: "",
			data_aquisicao: new Date().toISOString().slice(0, 10),
			fornecedor: null,
			vida_util_anos: 5,
			taxa_depreciacao_anual: 20.0,
			numero_serie: "",
			localizacao: "",
			nota_fiscal: "",
			forma_pagamento: "à vista",
			parcelas: 1,
		});
		setEditingId(null);
	};
	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate form fields
		if (!form.nome.trim()) {
			setError("O nome do bem patrimonial é obrigatório.");
			return;
		}

		if (parseFloat(form.valor_aquisicao) <= 0) {
			setError("O valor de aquisição deve ser maior que zero.");
			return;
		}

		if (parseInt(form.vida_util_anos) <= 0) {
			setError("A vida útil deve ser maior que zero.");
			return;
		}

		if (
			parseFloat(form.taxa_depreciacao_anual) <= 0 ||
			parseFloat(form.taxa_depreciacao_anual) > 100
		) {
			setError("A taxa de depreciação anual deve estar entre 0 e 100%.");
			return;
		}

		if (form.forma_pagamento !== "à vista" && parseInt(form.parcelas) < 1) {
			setError(
				"O número de parcelas deve ser maior que zero para pagamentos parcelados."
			);
			return;
		}

		try {
			setLoading(true);

			const formData = {
				...form,
				valor_aquisicao: parseFloat(form.valor_aquisicao),
				vida_util_anos: parseInt(form.vida_util_anos),
				taxa_depreciacao_anual: parseFloat(form.taxa_depreciacao_anual),
				parcelas: parseInt(form.parcelas),
			};

			if (editingId) {
				await updateBemPatrimonial(editingId, formData);
			} else {
				await createBemPatrimonial(formData);
			}

			// Recarrega a lista de bens
			await loadBens();

			// Reseta o formulário
			resetForm();
			setShowForm(false);

			setError(null);
		} catch (err) {
			setError(
				`Erro ao ${
					editingId ? "atualizar" : "cadastrar"
				} o bem patrimonial. Por favor, tente novamente.`
			);
			console.error(
				`Erro ao ${editingId ? "atualizar" : "cadastrar"} bem:`,
				err
			);
		} finally {
			setLoading(false);
		}
	};

	const handleEdit = (bem) => {
		setForm({
			nome: bem.nome,
			tipo: bem.tipo,
			categoria: bem.categoria,
			descricao: bem.descricao || "",
			valor_aquisicao: bem.valor_aquisicao,
			data_aquisicao: bem.data_aquisicao,
			fornecedor: bem.fornecedor,
			vida_util_anos: bem.vida_util_anos,
			taxa_depreciacao_anual: bem.taxa_depreciacao_anual,
			numero_serie: bem.numero_serie || "",
			localizacao: bem.localizacao || "",
			nota_fiscal: bem.nota_fiscal || "",
			forma_pagamento: bem.forma_pagamento || "à vista",
			parcelas: bem.parcelas || 1,
		});
		setEditingId(bem.id);
		setShowForm(true);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const handleDelete = async (id) => {
		if (
			window.confirm("Tem certeza que deseja excluir este bem patrimonial?")
		) {
			try {
				setLoading(true);
				await deleteBemPatrimonial(id);
				await loadBens();
				setError(null);
			} catch (err) {
				setError(
					"Erro ao excluir o bem patrimonial. Por favor, tente novamente."
				);
				console.error("Erro ao excluir bem:", err);
			} finally {
				setLoading(false);
			}
		}
	};

	if (loading && bens.length === 0) {
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
			<h1 className="mb-4">Bens Patrimoniais</h1>

			<Alert variant="info" className="mb-4">
				<strong>Nota:</strong> Neste módulo devem ser registrados apenas os bens
				que permanecem no patrimônio da empresa, como imóveis, veículos,
				máquinas e equipamentos. Mercadorias para revenda devem ser registradas
				no módulo de Produtos/Estoque.
			</Alert>

			{error && <Alert variant="danger">{error}</Alert>}

			<Button
				variant={showForm ? "secondary" : "primary"}
				className="mb-4"
				onClick={() => {
					if (showForm) {
						resetForm();
					}
					setShowForm(!showForm);
				}}
			>
				{showForm ? (
					<>
						<FontAwesomeIcon icon={faTimes} className="me-2" /> Cancelar
					</>
				) : (
					<>
						<FontAwesomeIcon icon={faPlus} className="me-2" /> Novo Bem
					</>
				)}
			</Button>

			{showForm && (
				<Card className="mb-4 shadow-sm">
					{" "}
					<Card.Header className="bg-light">
						<h5 className="mb-0">
							{editingId ? "Editar" : "Novo"} Bem Patrimonial
						</h5>
						<small className="text-muted">
							Registre aqui bens que fazem parte do patrimônio da empresa e não
							se destinam à revenda.
						</small>
					</Card.Header>
					<Card.Body>
						<Form onSubmit={handleSubmit}>
							<Row>
								<Col md={6}>
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
								</Col>
								<Col md={3}>
									<Form.Group className="mb-3">
										<Form.Label>Tipo</Form.Label>
										<Form.Select
											name="tipo"
											value={form.tipo}
											onChange={handleChange}
											required
										>
											<option value="imovel">Imóvel</option>
											<option value="veiculo">Veículo</option>
											<option value="maquina">Máquina</option>
											<option value="equipamento">Equipamento</option>
											<option value="movel">Móvel</option>
											<option value="utensilio">Utensílio</option>
											<option value="outro">Outro</option>
										</Form.Select>
									</Form.Group>
								</Col>
								<Col md={3}>
									<Form.Group className="mb-3">
										<Form.Label>Categoria</Form.Label>
										<Form.Select
											name="categoria"
											value={form.categoria}
											onChange={handleChange}
										>
											<option value="">Selecione...</option>
											{categorias.map((cat) => (
												<option key={cat.id} value={cat.id}>
													{cat.nome}
												</option>
											))}
										</Form.Select>
									</Form.Group>
								</Col>
							</Row>

							<Form.Group className="mb-3">
								<Form.Label>Descrição</Form.Label>
								<Form.Control
									as="textarea"
									name="descricao"
									value={form.descricao}
									onChange={handleChange}
									rows={2}
								/>
							</Form.Group>

							<Row>
								<Col md={3}>
									<Form.Group className="mb-3">
										<Form.Label>Valor de Aquisição</Form.Label>
										<Form.Control
											type="number"
											name="valor_aquisicao"
											value={form.valor_aquisicao}
											onChange={handleChange}
											step="0.01"
											min="0"
											required
										/>
									</Form.Group>
								</Col>
								<Col md={3}>
									<Form.Group className="mb-3">
										<Form.Label>Data de Aquisição</Form.Label>
										<Form.Control
											type="date"
											name="data_aquisicao"
											value={form.data_aquisicao}
											onChange={handleChange}
											required
										/>
									</Form.Group>
								</Col>
								<Col md={3}>
									<Form.Group className="mb-3">
										<Form.Label>Vida Útil (anos)</Form.Label>
										<Form.Control
											type="number"
											name="vida_util_anos"
											value={form.vida_util_anos}
											onChange={handleChange}
											min="1"
											required
										/>
									</Form.Group>
								</Col>
								<Col md={3}>
									<Form.Group className="mb-3">
										<Form.Label>Taxa de Depreciação Anual (%)</Form.Label>
										<Form.Control
											type="number"
											name="taxa_depreciacao_anual"
											value={form.taxa_depreciacao_anual}
											onChange={handleChange}
											step="0.01"
											min="0"
											max="100"
											required
										/>
									</Form.Group>
								</Col>
							</Row>

							<Row>
								<Col md={4}>
									<Form.Group className="mb-3">
										<Form.Label>Número de Série/Identificação</Form.Label>
										<Form.Control
											type="text"
											name="numero_serie"
											value={form.numero_serie}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group className="mb-3">
										<Form.Label>Localização</Form.Label>
										<Form.Control
											type="text"
											name="localizacao"
											value={form.localizacao}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
								<Col md={4}>
									<Form.Group className="mb-3">
										<Form.Label>Nota Fiscal</Form.Label>
										<Form.Control
											type="text"
											name="nota_fiscal"
											value={form.nota_fiscal}
											onChange={handleChange}
										/>
									</Form.Group>
								</Col>
							</Row>

							<Row>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Forma de Pagamento</Form.Label>
										<Form.Select
											name="forma_pagamento"
											value={form.forma_pagamento}
											onChange={handleChange}
										>
											<option value="à vista">À Vista</option>
											<option value="parcelado">Parcelado</option>
											<option value="financiado">Financiado</option>
											<option value="leasing">Leasing</option>
											<option value="outro">Outro</option>
										</Form.Select>
									</Form.Group>
								</Col>
								<Col md={6}>
									<Form.Group className="mb-3">
										<Form.Label>Número de Parcelas</Form.Label>
										<Form.Control
											type="number"
											name="parcelas"
											value={form.parcelas}
											onChange={handleChange}
											min="1"
											disabled={form.forma_pagamento === "à vista"}
										/>
									</Form.Group>
								</Col>
							</Row>

							<div className="d-flex justify-content-end mt-3">
								<Button
									variant="secondary"
									className="me-2"
									onClick={() => {
										resetForm();
										setShowForm(false);
									}}
								>
									Cancelar
								</Button>
								<Button type="submit" variant="primary">
									<FontAwesomeIcon icon={faSave} className="me-2" />
									{editingId ? "Atualizar" : "Cadastrar"}
								</Button>
							</div>
						</Form>
					</Card.Body>
				</Card>
			)}

			<Card className="shadow-sm">
				<Card.Body>
					<Table striped hover responsive>
						<thead>
							<tr>
								<th>Nome</th>
								<th>Tipo</th>
								<th>Valor de Aquisição</th>
								<th>Data de Aquisição</th>
								<th>Valor Atual</th>
								<th>Ações</th>
							</tr>
						</thead>
						<tbody>
							{bens.length === 0 ? (
								<tr>
									<td colSpan="6" className="text-center">
										Nenhum bem patrimonial cadastrado.
									</td>
								</tr>
							) : (
								bens.map((bem) => (
									<tr key={bem.id}>
										<td>{bem.nome}</td>
										<td>
											{(() => {
												switch (bem.tipo) {
													case "imovel":
														return "Imóvel";
													case "veiculo":
														return "Veículo";
													case "maquina":
														return "Máquina";
													case "equipamento":
														return "Equipamento";
													case "movel":
														return "Móvel";
													case "utensilio":
														return "Utensílio";
													default:
														return "Outro";
												}
											})()}
										</td>
										<td>{formatCurrency(bem.valor_aquisicao)}</td>
										<td>
											{new Date(bem.data_aquisicao).toLocaleDateString("pt-BR")}
										</td>
										<td>{formatCurrency(bem.valor_atual)}</td>
										<td>
											<Button
												variant="outline-primary"
												size="sm"
												className="me-2"
												onClick={() => handleEdit(bem)}
											>
												<FontAwesomeIcon icon={faEdit} />
											</Button>
											<Button
												variant="outline-danger"
												size="sm"
												onClick={() => handleDelete(bem.id)}
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
		</Container>
	);
};

export default BensPatrimoniais;
