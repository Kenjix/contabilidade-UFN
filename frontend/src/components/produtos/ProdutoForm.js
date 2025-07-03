import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Card, Row, Col, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave, faTimes } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const ProdutoForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = !!id;

	const [produto, setProduto] = useState({
		nome: "",
		codigo: "",
		categoria: "",
		preco_compra: 0,
		preco_venda: 0,
		quantidade_estoque: 0,
		descricao: "",
		fornecedor: "",
		icms: 17.0,
	});
	const [loading, setLoading] = useState(isEditMode);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);

	useEffect(() => {
		const fetchProduto = async () => {
			if (isEditMode) {
				try {
					const response = await axios.get(`/api/produtos/${id}/`);
					setProduto(response.data);
					setLoading(false);
				} catch (err) {
					console.error("Erro ao carregar dados do produto:", err);
					setError("Não foi possível carregar os dados do produto.");
					setLoading(false);
				}
			}
		};

		fetchProduto();
	}, [id, isEditMode]);

	const handleChange = (e) => {
		const { name, value } = e.target;

		if (
			["preco_compra", "preco_venda", "quantidade_estoque", "icms"].includes(
				name
			)
		) {
			setProduto({ ...produto, [name]: parseFloat(value) || 0 });
		} else {
			setProduto({ ...produto, [name]: value });
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (produto.preco_venda <= 0) {
			setMessage({
				type: "danger",
				text: "O preço de venda deve ser maior que zero.",
			});
			return;
		}

		try {
			if (isEditMode) {
				await axios.put(`/api/produtos/${id}/editar/`, produto);
			} else {
				await axios.post("/api/produtos/cadastrar/", produto);
			}

			navigate("/produtos");
		} catch (err) {
			console.error("Erro ao salvar produto:", err);
			setMessage({
				type: "danger",
				text:
					err.response?.data?.error ||
					"Erro ao salvar o produto. Verifique os dados informados.",
			});
		}
	};

	const calcularMargemLucro = () => {
		if (produto.preco_compra <= 0) return 0;
		const lucro = produto.preco_venda - produto.preco_compra;
		return ((lucro / produto.preco_compra) * 100).toFixed(2);
	};

	if (loading)
		return (
			<div className="text-center p-5">Carregando dados do produto...</div>
		);
	if (error) return <div className="alert alert-danger">{error}</div>;

	return (
		<div>
			<div className="page-header">
				<h1>
					{isEditMode ? `Editar Produto: ${produto.nome}` : "Novo Produto"}
				</h1>
			</div>

			{message && (
				<Alert
					variant={message.type}
					dismissible
					onClose={() => setMessage(null)}
				>
					{message.text}
				</Alert>
			)}

			<Card>
				<Card.Header className="bg-primary text-white">
					<h5 className="mb-0">Dados do Produto</h5>
				</Card.Header>
				<Card.Body>
					<Form onSubmit={handleSubmit}>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">Nome</Form.Label>
									<Form.Control
										type="text"
										name="nome"
										value={produto.nome}
										onChange={handleChange}
										required
										placeholder="Nome do produto"
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">Código</Form.Label>
									<Form.Control
										type="text"
										name="codigo"
										value={produto.codigo}
										onChange={handleChange}
										required
										placeholder="Código ou referência do produto"
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Categoria</Form.Label>
									<Form.Control
										type="text"
										name="categoria"
										value={produto.categoria || ""}
										onChange={handleChange}
										placeholder="Categoria do produto"
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Fornecedor</Form.Label>
									<Form.Control
										type="text"
										name="fornecedor"
										value={produto.fornecedor || ""}
										onChange={handleChange}
										placeholder="Fornecedor do produto"
									/>
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">
										Preço de Compra (R$)
									</Form.Label>
									<Form.Control
										type="number"
										name="preco_compra"
										value={produto.preco_compra}
										onChange={handleChange}
										required
										min="0"
										step="0.01"
										placeholder="0,00"
									/>
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">
										Preço de Venda (R$)
									</Form.Label>
									<Form.Control
										type="number"
										name="preco_venda"
										value={produto.preco_venda}
										onChange={handleChange}
										required
										min="0.01"
										step="0.01"
										placeholder="0,00"
									/>
								</Form.Group>
							</Col>
							<Col md={4}>
								<Form.Group className="mb-3">
									<Form.Label>Margem de Lucro (%)</Form.Label>
									<Form.Control
										type="text"
										value={calcularMargemLucro()}
										readOnly
										disabled
									/>
									<Form.Text className="text-muted">
										Calculada automaticamente
									</Form.Text>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">
										Quantidade em Estoque
									</Form.Label>
									<Form.Control
										type="number"
										name="quantidade_estoque"
										value={produto.quantidade_estoque}
										onChange={handleChange}
										required
										min="0"
										step="1"
										placeholder="0"
									/>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">ICMS (%)</Form.Label>
									<Form.Control
										type="number"
										name="icms"
										value={produto.icms}
										onChange={handleChange}
										required
										min="0"
										max="100"
										step="0.1"
										placeholder="17,0"
									/>
									<Form.Text className="text-muted">
										Porcentagem de ICMS aplicável ao produto
									</Form.Text>
								</Form.Group>
							</Col>
							<Col md={12}>
								<Form.Group className="mb-3">
									<Form.Label>Descrição</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										name="descricao"
										value={produto.descricao || ""}
										onChange={handleChange}
										placeholder="Descrição detalhada do produto"
									/>
								</Form.Group>
							</Col>
						</Row>

						<div className="d-flex justify-content-end mt-3">
							<Button
								variant="secondary"
								className="me-2"
								onClick={() => navigate("/produtos")}
							>
								<FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar
							</Button>
							<Button variant="primary" type="submit">
								<FontAwesomeIcon icon={faSave} className="me-1" /> Salvar
							</Button>
						</div>
					</Form>
				</Card.Body>
			</Card>
		</div>
	);
};

export default ProdutoForm;
