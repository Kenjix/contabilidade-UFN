import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Form,
	Button,
	Card,
	Table,
	Row,
	Col,
	Alert,
	Modal,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faSave,
	faTimes,
	faPlus,
	faTrash,
} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { getClientes, getProdutos, getProdutoInfo } from "../../services/api";

const VendaForm = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const isEditMode = !!id;

	const [venda, setVenda] = useState({
		cliente: "",
		tipo_pagamento: "a_vista",
		observacao: "",
	});
	const [itens, setItens] = useState([]);
	const [clientes, setClientes] = useState([]);
	const [produtos, setProdutos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);

	const [showConfirmModal, setShowConfirmModal] = useState(false);

	const [novoItem, setNovoItem] = useState({
		produto: "",
		quantidade: 0,
		preco_unitario: 0.0,
		icms_valor: 0.0,
		icms_aliquota: 0.0
	});

	useEffect(() => {
		const fetchData = async () => {
			try {
				const [clientesResponse, produtosResponse] = await Promise.all([
					axios.get("/api/clientes/"),
					axios.get("/api/produtos/"),
				]);

				setClientes(clientesResponse.data);
				setProdutos(produtosResponse.data);

				if (isEditMode) {
					const vendaResponse = await axios.get(`/api/vendas/${id}/`);
					const vendaData = vendaResponse.data;

					setVenda({
						cliente: vendaData.cliente.id,
						tipo_pagamento: vendaData.tipo_pagamento,
						observacao: vendaData.observacao || "",
					});

					setItens(
						vendaData.itens.map((item) => ({
							id: item.id,
							produto: item.produto.id,
							quantidade: item.quantidade,
							preco_unitario: item.preco_unitario,
							subtotal: item.subtotal,
							icms_valor: item.icms / item.quantidade || 0,
							icms_aliquota: item.icms_percentual || 0
						}))
					);
				}

				setLoading(false);
			} catch (err) {
				console.error("Erro ao carregar dados:", err);
				setError("Não foi possível carregar os dados necessários.");
				setLoading(false);
			}
		};

		fetchData();
	}, [id, isEditMode]);

	const handleClienteChange = async (e) => {
		const clienteId = e.target.value;

		setVenda({ ...venda, cliente: clienteId });

		let estadoCliente = null;
		if (clienteId) {
			const clienteSelecionado = clientes.find(c => c.id === parseInt(clienteId));
			if (clienteSelecionado && clienteSelecionado.estado) {
				estadoCliente = clienteSelecionado.estado;
				console.log(`Cliente alterado para: ${clienteSelecionado.nome}, Estado: ${estadoCliente}`);
			}
		}

		if (novoItem.produto) {
			try {
				console.log(`Atualizando ICMS para o produto atual ${novoItem.produto} com estado do cliente ${estadoCliente || 'não definido'}`);
				const response = await getProdutoInfo(novoItem.produto, estadoCliente);
				const produtoInfo = response.data;
				
				setNovoItem({
					...novoItem,
					icms_valor: produtoInfo.icms_valor,
					icms_aliquota: produtoInfo.icms
				});
				
				console.log(`ICMS do produto atual atualizado: ${produtoInfo.icms}%, Valor ICMS: ${produtoInfo.icms_valor}`);
			} catch (err) {
				console.error("Erro ao atualizar ICMS do produto atual:", err);
			}
		}

		if (itens.length > 0) {
			console.log(`Atualizando ICMS para ${itens.length} itens já adicionados na venda`);

			const atualizacaoPromessas = itens.map(async (item) => {
				try {
					const response = await getProdutoInfo(item.produto, estadoCliente);
					const produtoInfo = response.data;
					
					return {
						...item,
						icms_valor: produtoInfo.icms_valor,
						icms_aliquota: produtoInfo.icms
					};
				} catch (err) {
					console.error(`Erro ao atualizar ICMS do item ${item.produto}:`, err);
					return item;
				}
			});

			try {
				const itensAtualizados = await Promise.all(atualizacaoPromessas);
				setItens(itensAtualizados);
				console.log("ICMS de todos os itens da venda foi atualizado com sucesso!");
			} catch (err) {
				console.error("Erro ao atualizar ICMS de todos os itens:", err);
			}
		}
	};

	const handleProdutoChange = async (e) => {
		const produtoId = e.target.value;
		
		if (!produtoId) {
			setNovoItem({
				produto: "",
				quantidade: 0,
				preco_unitario: 0,
				icms_valor: 0,
				icms_aliquota: 0
			});
			return;
		}
		
		try {
			const clienteId = venda.cliente;
			let estadoCliente = null;
			
			if (clienteId) {
				const clienteSelecionado = clientes.find(c => c.id === parseInt(clienteId));
				if (clienteSelecionado && clienteSelecionado.estado) {
					estadoCliente = clienteSelecionado.estado;
					console.log(`Cliente selecionado: ${clienteSelecionado.nome}, Estado: ${estadoCliente}`);
				}
			}

			if (!estadoCliente) {
				console.log("Atenção: Cliente sem estado definido ou estado inválido, ICMS será calculado pela alíquota padrão do produto");
			}

			console.log(`Buscando informações do produto ID ${produtoId} com estado ${estadoCliente || 'não definido'}`);
			const response = await getProdutoInfo(produtoId, estadoCliente);
			const produtoInfo = response.data;
			
			setNovoItem({
				produto: produtoId,
				quantidade: 1,
				preco_unitario: produtoInfo.preco_venda,
				icms_valor: produtoInfo.icms_valor,
				icms_aliquota: produtoInfo.icms
			});
			
			console.log(`Produto selecionado: ID ${produtoId}, Estado: ${estadoCliente || 'Não definido'}, ICMS: ${produtoInfo.icms}%, Valor ICMS: ${produtoInfo.icms_valor}`);
		} catch (err) {
			console.error("Erro ao obter informações do produto:", err);
			const produto = produtos.find((p) => p.id === parseInt(produtoId));
			
			if (produto) {
				setNovoItem({
					produto: produtoId,
					quantidade: 1,
					preco_unitario: produto.preco_venda,
					icms_valor: 0,
					icms_aliquota: 0
				});
			}
		}
	};

	const handleAddItem = () => {
		if (!novoItem.produto || novoItem.quantidade <= 0) {
			setMessage({
				type: "danger",
				text: "Selecione um produto e informe uma quantidade válida.",
			});
			return;
		}

		const produto = produtos.find((p) => p.id === parseInt(novoItem.produto));

		if (novoItem.quantidade > produto.quantidade_estoque) {
			setMessage({
				type: "warning",
				text: `Quantidade insuficiente em estoque. Disponível: ${produto.quantidade_estoque}`,
			});
			return;
		}

		const subtotal = novoItem.quantidade * novoItem.preco_unitario;

		const novoItemCompleto = {
			...novoItem,
			subtotal,
			tempId: Date.now(),
		};

		setItens([...itens, novoItemCompleto]);

		setNovoItem({
			produto: "",
			quantidade: 0,
			preco_unitario: 0.0,
			icms_valor: 0.0,
			icms_aliquota: 0.0
		});
		
		console.log("Item adicionado e campos resetados, incluindo ICMS");
	};

	const handleRemoveItem = (index) => {
		const novosItens = [...itens];
		novosItens.splice(index, 1);
		setItens(novosItens);
	};

	const calcularTotal = () => {
		return itens.reduce(
			(total, item) => total + item.quantidade * item.preco_unitario,
			0
		);
	};
	
	const calcularTotalIcms = () => {
		return itens.reduce(
			(total, item) => total + (item.icms_valor ? item.icms_valor * item.quantidade : 0),
			0
		);
	};
	
	const calcularValorLiquido = () => {
		return calcularTotal() - calcularTotalIcms();
	};

	const handleSubmit = async (e, forceSubmit = false) => {
		if (e) e.preventDefault();

		if (!venda.cliente) {
			setMessage({ type: "danger", text: "Selecione um cliente." });
			return;
		}

		if (itens.length === 0) {
			setMessage({
				type: "danger",
				text: "Adicione pelo menos um item à venda.",
			});
			return;
		}

		if (!forceSubmit && novoItem.produto && novoItem.quantidade > 0) {
			setShowConfirmModal(true);
			return;
		}

		try {
			const vendaData = {
				...venda,
				cliente: parseInt(venda.cliente),
				itens: itens.map((item) => ({
					produto: parseInt(item.produto),
					quantidade: item.quantidade,
					preco_unitario: parseFloat(item.preco_unitario),
					icms_valor: item.icms_valor || 0,
					icms_aliquota: item.icms_aliquota || 0,
					id: item.id,
				})),
			};

			if (isEditMode) {
				await axios.post(`/api/vendas/${id}/editar/`, vendaData);
			} else {
				await axios.post("/api/vendas/criar/", vendaData);
			}

			navigate("/vendas");
		} catch (err) {
			console.error("Erro ao salvar:", err);
			setMessage({
				type: "danger",
				text:
					err.response?.data?.error ||
					"Erro ao salvar. Verifique os dados informados.",
			});
		}
	};

	const handleConfirmModalClose = () => {
		setShowConfirmModal(false);
	};

	const handleConfirmModalConfirm = async () => {
		setShowConfirmModal(false);
		await handleSubmit(null, true);
	};

	if (loading) return <div className="text-center p-5">Carregando...</div>;
	if (error) return <div className="alert alert-danger">{error}</div>;

	return (
		<div>
			<div className="page-header">
				<h1>
					{isEditMode ? `Editar Venda #${id}` : "Nova Venda"}
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

			<Form onSubmit={handleSubmit}>
				<Card className="mb-4">
					<Card.Header className="bg-primary text-white">
						<div className="d-flex justify-content-between align-items-center">
							<h5 className="mb-0">
									{isEditMode ? `Dados da Venda #${id}` : "Dados da Venda"}
							</h5>
						</div>
					</Card.Header>
					<Card.Body>
						<Row>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label className="required-field">Cliente</Form.Label>
									<Form.Select
										value={venda.cliente}
										onChange={handleClienteChange}
										required
									>
										<option value="">Selecione um cliente</option>
										{clientes.map((cliente) => (
											<option key={cliente.id} value={cliente.id}>
												{cliente.nome} {cliente.estado ? `(${cliente.estado})` : ''}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Tipo de Pagamento</Form.Label>
									<Form.Select
										value={venda.tipo_pagamento}
										onChange={(e) =>
											setVenda({ ...venda, tipo_pagamento: e.target.value })
											}
									>
										<option value="a_vista">À Vista</option>
										<option value="a_prazo">A Prazo</option>
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={12}>
								<Form.Group className="mb-3">
									<Form.Label>Observação</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										value={venda.observacao}
										onChange={(e) =>
											setVenda({ ...venda, observacao: e.target.value })
										}
											placeholder="Observações sobre a venda (opcional)"
									/>
								</Form.Group>
							</Col>
						</Row>
					</Card.Body>
				</Card>

				<Card className="mb-4">
					<Card.Header className="bg-primary text-white">
						<h5 className="mb-0">
							Itens da Venda
						</h5>
					</Card.Header>
					<Card.Body>
						
						<Row className="mb-3 align-items-end">
							<Col md={4}>
								<Form.Group>
									<Form.Label>Produto</Form.Label>
									<Form.Select
										value={novoItem.produto}
										onChange={handleProdutoChange}
										disabled={!venda.cliente}
									>
										<option value="">
											{!venda.cliente 
												? "Selecione um cliente primeiro" 
												: "Selecione um produto"
											}
										</option>
										{produtos.map((produto) => (
											<option key={produto.id} value={produto.id}>
												{produto.nome} - R$ {produto.preco_venda.toFixed(2)} -
												Estoque: {produto.quantidade_estoque}
											</option>
										))}
									</Form.Select>
								</Form.Group>
							</Col>
							<Col md={2}>
								<Form.Group>
									<Form.Label>Quantidade</Form.Label>
									<Form.Control
										type="number"
										min="1"
										step="1"
										value={novoItem.quantidade}
										onChange={(e) =>
											setNovoItem({
												...novoItem,
												quantidade: parseInt(e.target.value) || 0,
											})
										}
										disabled={!novoItem.produto}
									/>
								</Form.Group>
							</Col>
							<Col md={2}>
								<Form.Group>
									<Form.Label>Preço Unitário</Form.Label>
									<Form.Control
										type="text"
										value={`R$ ${novoItem.preco_unitario.toFixed(2)}`}
										disabled={true}
										readOnly
									/>
								</Form.Group>
							</Col>
							<Col md={2}>
								<Form.Group>
									<Form.Label>ICMS ({novoItem.icms_aliquota?.toFixed(2)}%)</Form.Label>
									<Form.Control
										type="text"
										value={`R$ ${(novoItem.icms_valor * novoItem.quantidade).toFixed(2)}`}
										disabled={true}
										readOnly
									/>
								</Form.Group>
							</Col>
							<Col md={1} className="d-flex justify-content-end">
								<Button
									variant="success"
									onClick={handleAddItem}
									disabled={!novoItem.produto}
								>
									<FontAwesomeIcon icon={faPlus} />
								</Button>
							</Col>
						</Row>

						<Table striped bordered hover>
							<thead>
								<tr>
									<th>Produto</th>
									<th className="text-center">Quantidade</th>
									<th className="text-end">Preço Unitário</th>
									<th className="text-end">ICMS</th>
									<th className="text-end">Subtotal</th>
									<th className="text-center" style={{ width: "80px" }}>
										Ações
									</th>
								</tr>
							</thead>
							<tbody>
								{itens.length === 0 ? (
									<tr>
										<td colSpan="6" className="text-center">
											Nenhum item adicionado
										</td>
									</tr>
								) : (
									itens.map((item, index) => {
										const produto = produtos.find(
											(p) => p.id === parseInt(item.produto)
										);
										return (
											<tr key={item.id || item.tempId}>
												<td>{produto?.nome || "Produto não encontrado"}</td>
												<td className="text-center">{item.quantidade}</td>
												<td className="text-end">
													R$ {parseFloat(item.preco_unitario).toFixed(2)}
												</td>
												<td className="text-end">
													R$ {item.icms_valor 
														? (item.icms_valor * item.quantidade).toFixed(2) 
														: '0.00'
													}
												</td>
												<td className="text-end">
													R$ {(item.quantidade * item.preco_unitario).toFixed(2)}
												</td>
												<td className="text-center">
													<Button
														variant="danger"
														size="sm"
														onClick={() => handleRemoveItem(index)}
													>
														<FontAwesomeIcon icon={faTrash} />
													</Button>
												</td>
											</tr>
										);
									})
								)}
							</tbody>
							<tfoot>
								<tr>
									<th colSpan="3" className="text-end">
											ICMS:
									</th>
									<th className="text-end">R$ {calcularTotalIcms().toFixed(2)}</th>
									<th></th>
									<th></th>
								</tr>
								<tr>
									<th colSpan="4" className="text-end">
										Total Produtos:
									</th>
									<th className="text-end">R$ {calcularTotal().toFixed(2)}</th>
									<th></th>
								</tr>
								<tr className="table-success">
									<th colSpan="4" className="text-end">
										Total Líquido:
									</th>
									<th className="text-end">R$ {calcularValorLiquido().toFixed(2)}</th>
									<th></th>
								</tr>
							</tfoot>
						</Table>
					</Card.Body>
				</Card>

				<div className="d-flex justify-content-end">
					<Button
						variant="secondary"
						className="me-2"
						onClick={() => navigate("/vendas")}
					>
						<FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar
					</Button>
					<Button variant="primary" type="submit">
						<FontAwesomeIcon icon={faSave} className="me-1" /> Salvar
					</Button>
				</div>
			</Form>

			<Modal show={showConfirmModal} onHide={handleConfirmModalClose}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmação</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Há um produto selecionado que não foi adicionado à venda. Deseja
					continuar mesmo assim?
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleConfirmModalClose}>
						Cancelar
					</Button>
					<Button variant="primary" onClick={handleConfirmModalConfirm}>
						Confirmar
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default VendaForm;
