import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Table, Card, Badge, Form, InputGroup, Nav } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faPlus,
	faSearch,
	faBoxOpen,
	faArrowRight,
	faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";

const EstoqueList = () => {
	const [produtos, setProdutos] = useState([]);
	const [movimentacoes, setMovimentacoes] = useState([]);
	const [filteredItems, setFilteredItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [activeTab, setActiveTab] = useState("produtos");

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [produtosResponse, movimentacoesResponse] = await Promise.all([
					axios.get("/api/produtos/"),
					axios.get("/api/estoque/movimentacoes/"),
				]);

				setProdutos(produtosResponse.data);
				setMovimentacoes(movimentacoesResponse.data);

				setFilteredItems(produtosResponse.data);

				setLoading(false);
			} catch (err) {
				console.error("Erro ao carregar dados de estoque:", err);
				setError("Não foi possível carregar os dados de estoque.");
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (searchTerm.trim() === "") {
			setFilteredItems(activeTab === "produtos" ? produtos : movimentacoes);
		} else {
			if (activeTab === "produtos") {
				const filtered = produtos.filter(
					(produto) =>
						produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
						produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
						produto.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
				);
				setFilteredItems(filtered);
			} else {
				const filtered = movimentacoes.filter(
					(movimentacao) =>
						movimentacao.produto.nome
							.toLowerCase()
							.includes(searchTerm.toLowerCase()) ||
						movimentacao.tipo
							.toLowerCase()
							.includes(searchTerm.toLowerCase()) ||
						movimentacao.observacao
							?.toLowerCase()
							.includes(searchTerm.toLowerCase())
				);
				setFilteredItems(filtered);
			}
		}
	}, [searchTerm, activeTab, produtos, movimentacoes]);

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setSearchTerm("");
		setFilteredItems(tab === "produtos" ? produtos : movimentacoes);
	};

	const getEstoqueBadge = (quantidade) => {
		if (quantidade <= 0) {
			return <Badge bg="danger">Esgotado</Badge>;
		} else if (quantidade <= 5) {
			return (
				<Badge bg="warning" text="dark">
					Baixo
				</Badge>
			);
		} else {
			return <Badge bg="success">Normal</Badge>;
		}
	};

	const getTipoBadge = (tipo) => {
		switch (tipo) {
			case "entrada":
				return (
					<Badge bg="success">
						<FontAwesomeIcon icon={faArrowRight} className="me-1" /> Entrada
					</Badge>
				);
			case "saida":
				return (
					<Badge bg="danger">
						<FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Saída
					</Badge>
				);
			default:
				return <Badge bg="secondary">{tipo}</Badge>;
		}
	};

	if (loading)
		return (
			<div className="text-center p-5">Carregando dados de estoque...</div>
		);
	if (error) return <div className="alert alert-danger">{error}</div>;

	return (
		<div>
			<div className="page-header">
				<h1>Estoque</h1>
				<Link to="/estoque/movimentacao" className="btn btn-primary">
					<FontAwesomeIcon icon={faPlus} className="me-2" />
					Nova Movimentação
				</Link>
			</div>

			<Nav variant="tabs" className="mb-3">
				<Nav.Item>
					<Nav.Link
						active={activeTab === "produtos"}
						onClick={() => handleTabChange("produtos")}
					>
						<FontAwesomeIcon icon={faBoxOpen} className="me-2" />
						Produtos em Estoque
					</Nav.Link>
				</Nav.Item>
				<Nav.Item>
					<Nav.Link
						active={activeTab === "movimentacoes"}
						onClick={() => handleTabChange("movimentacoes")}
					>
						<FontAwesomeIcon icon={faArrowRight} className="me-2" />
						Movimentações
					</Nav.Link>
				</Nav.Item>
			</Nav>

			<Card className="mb-4">
				<Card.Header className="bg-primary text-white">
					<div className="d-flex justify-content-between align-items-center">
						<h5 className="mb-0">
							{activeTab === "produtos"
								? "Produtos em Estoque"
								: "Movimentações de Estoque"}
						</h5>
						<InputGroup className="w-50">
							<Form.Control
								placeholder={`Buscar ${
									activeTab === "produtos" ? "produtos" : "movimentações"
								}...`}
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
							<InputGroup.Text>
								<FontAwesomeIcon icon={faSearch} />
							</InputGroup.Text>
						</InputGroup>
					</div>
				</Card.Header>
				<Card.Body>
					{filteredItems.length === 0 ? (
						<div className="text-center p-4">
							<p className="text-muted">
								{searchTerm
									? `Nenhum ${
											activeTab === "produtos" ? "produto" : "movimentação"
									  } encontrado com os critérios de busca.`
									: `Nenhum ${
											activeTab === "produtos" ? "produto" : "movimentação"
									  } cadastrado.`}
							</p>
							{!searchTerm && activeTab === "movimentacoes" && (
								<Link to="/estoque/movimentacao" className="btn btn-primary">
									Registrar Nova Movimentação
								</Link>
							)}
						</div>
					) : activeTab === "produtos" ? (
						<Table striped hover responsive>
							<thead>
								<tr>
									<th>Código</th>
									<th>Nome</th>
									<th>Categoria</th>
									<th className="text-center">Quantidade</th>
									<th className="text-center">Status</th>
									<th className="text-end">Preço de Custo</th>
									<th className="text-end">Preço de Venda</th>
									<th className="text-end">Valor em Estoque</th>
								</tr>
							</thead>
							<tbody>
								{filteredItems.map((produto) => (
									<tr key={produto.id}>
										<td>{produto.codigo}</td>
										<td>{produto.nome}</td>
										<td>{produto.categoria || "—"}</td>
										<td className="text-center">
											{produto.quantidade_estoque}
										</td>
										<td className="text-center">
											{getEstoqueBadge(produto.quantidade_estoque)}
										</td>
										<td className="text-end">
											R$ {parseFloat(produto.preco_compra).toFixed(2)}
										</td>
										<td className="text-end">
											R$ {parseFloat(produto.preco_venda).toFixed(2)}
										</td>
										<td className="text-end">
											R${" "}
											{(
												produto.quantidade_estoque * produto.preco_compra
											).toFixed(2)}
										</td>
									</tr>
								))}
							</tbody>
						</Table>
					) : (
						<Table striped hover responsive>
							<thead>
								<tr>
									<th>Data/Hora</th>
									<th>Produto</th>
									<th className="text-center">Tipo</th>
									<th className="text-center">Quantidade</th>
									<th>Documento Ref.</th>
									<th>Observação</th>
								</tr>
							</thead>
							<tbody>
								{filteredItems.map((movimentacao) => (
									<tr key={movimentacao.id}>
										<td>
											{new Date(
												movimentacao.data_movimentacao
											).toLocaleString()}
										</td>
										<td>{movimentacao.produto.nome}</td>
										<td className="text-center">
											{getTipoBadge(movimentacao.tipo)}
										</td>
										<td className="text-center">{movimentacao.quantidade}</td>
										<td>{movimentacao.documento_ref || "—"}</td>
										<td>{movimentacao.observacao || "—"}</td>
									</tr>
								))}
							</tbody>
						</Table>
					)}
				</Card.Body>
			</Card>
		</div>
	);
};

export default EstoqueList;
