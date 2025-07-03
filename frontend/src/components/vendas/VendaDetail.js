import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, Button, Table, Badge, Row, Col, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faCheck } from "@fortawesome/free-solid-svg-icons";
import { getVendaById, finalizarVenda } from "../../services/api";

const VendaDetail = () => {
	const { id } = useParams();
	const [venda, setVenda] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [message, setMessage] = useState(null);

	useEffect(() => {
		const fetchVenda = async () => {
			try {
				const response = await getVendaById(id);
				setVenda(response.data);
				setLoading(false);
			} catch (err) {
				console.error("Erro ao carregar detalhes da venda:", err);
				setError("Não foi possível carregar os detalhes da venda.");
				setLoading(false);
			}
		};

		fetchVenda();
	}, [id]);

	const handleFinalizarVenda = async () => {
		if (
			!window.confirm(
				"Tem certeza que deseja finalizar esta venda? Esta ação atualizará o estoque e não poderá ser desfeita."
			)
		) {
			return;
		}
		setMessage(null);

		try {
			const response = await finalizarVenda(id);
			if (response && response.data && response.data.success) {
				setVenda((prevVenda) => ({
					...prevVenda,
					status: "finalizada",
				}));
				setMessage({
					type: "success",
					text: response.data.message || "Venda finalizada com sucesso!",
				});
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				setMessage({
					type: "danger",
					text:
						response.data && response.data.message
							? response.data.message
							: "Não foi possível finalizar a venda.",
				});
			}
		} catch (err) {
			console.error("Erro ao finalizar a venda:", err);
			setMessage({
				type: "danger",
				text: "Não foi possível finalizar a venda.",
			});
		}
	};

	const getStatusBadge = (status) => {
		switch (status) {
			case "pendente":
				return (
					<Badge bg="warning" text="dark">
						Pendente
					</Badge>
				);
			case "finalizada":
				return <Badge bg="success">Finalizada</Badge>;
			case "cancelada":
				return <Badge bg="danger">Cancelada</Badge>;
			default:
				return <Badge bg="secondary">{status}</Badge>;
		}
	};

	if (loading)
		return (
			<div className="text-center p-5">Carregando detalhes da venda...</div>
		);
	if (error) return <div className="alert alert-danger">{error}</div>;

	const icms_total = venda.itens.reduce((total, item) => {
		const icms_percentual = item.percentual_icms || 0;
		const subtotal =
			typeof item.subtotal === "number" && !isNaN(item.subtotal)
				? item.subtotal
				: item.quantidade * item.preco_unitario;
		return total + (subtotal * icms_percentual) / 100;
	}, 0);

	return (
		<div>
			<div className="page-header">
				<h1>Detalhes da Venda #{venda.id}</h1>
				<div>
					{venda.status === "pendente" && (
						<Button
							variant="success"
							onClick={handleFinalizarVenda}
							className="me-2"
						>
							<FontAwesomeIcon icon={faCheck} className="me-1" /> Finalizar
							Venda
						</Button>
					)}
					<Link to="/vendas" className="btn btn-secondary">
						<FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Voltar para
						Lista
					</Link>
				</div>
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

			<Card className="mb-4">
				<Card.Header className="bg-primary text-white">
					<h5 className="mb-0">Informações da Venda</h5>
				</Card.Header>
				<Card.Body>
					<Row>
						<Col md={6}>
							<Table borderless>
								<tbody>
									<tr>
										<th style={{ width: "150px" }}>Cliente:</th>
										<td>{venda.cliente.nome}</td>
									</tr>
									<tr>
										<th>Data/Hora:</th>
										<td>{new Date(venda.data_venda).toLocaleString()}</td>
									</tr>
									<tr>
										<th>Status:</th>
										<td>{getStatusBadge(venda.status)}</td>
									</tr>
									<tr>
										<th>Pagamento:</th>
										<td>
											{venda.tipo_pagamento === "avista" ? (
												<Badge bg="success">À Vista</Badge>
											) : (
												<Badge bg="warning" text="dark">
													A Prazo
												</Badge>
											)}
										</td>
									</tr>
								</tbody>
							</Table>
						</Col>
						<Col md={6}>
							<Card className="h-100">
								<Card.Header className="bg-light">
									<h6 className="mb-0">Observações</h6>
								</Card.Header>
								<Card.Body>
									{venda.observacao ? (
										<p>{venda.observacao}</p>
									) : (
										<p className="text-muted">Nenhuma observação registrada.</p>
									)}
								</Card.Body>
							</Card>
						</Col>
					</Row>
				</Card.Body>
			</Card>

			<Card className="mb-4">
				<Card.Header className="bg-primary text-white">
					<h5 className="mb-0">Itens da Venda</h5>
				</Card.Header>
				<Card.Body className="p-0">
					<Table striped hover responsive className="mb-0">
						<thead>
							<tr className="table-light">
								<th>Produto</th>
								<th className="text-center">Quantidade</th>
								<th className="text-end">Preço Unitário</th>
								<th className="text-end">ICMS</th>
								<th className="text-end">Subtotal</th>
							</tr>
						</thead>
						<tbody>
							{venda.itens.map((item) => {
								const subtotal =
									typeof item.subtotal === "number" && !isNaN(item.subtotal)
										? item.subtotal
										: item.quantidade * item.preco_unitario;

								const icms_percentual = item.percentual_icms;
								const icms_valor =
									((item.preco_unitario * icms_percentual) / 100) *
										item.quantidade || 0;
								const estadoCliente =
									venda.cliente && venda.cliente.estado
										? venda.cliente.estado
										: "N/D";

								return (
									<tr key={item.id}>
										<td>{item.produto.nome}</td>
										<td className="text-center">{item.quantidade}</td>
										<td className="text-end">
											R$ {parseFloat(item.preco_unitario).toFixed(2)}
										</td>
										<td className="text-end">
											R$ {parseFloat(icms_valor).toFixed(2)}
											<span className="text-muted ms-1">
												<small
													className="text-muted"
													title={`ICMS para o estado ${estadoCliente}`}
												>
													({icms_percentual}% - {estadoCliente})
												</small>
											</span>
										</td>
										<td className="text-end">
											R$ {parseFloat(subtotal).toFixed(2)}
										</td>
									</tr>
								);
							})}
						</tbody>
						<tfoot>
							<tr className="table-light">
								<th colSpan="3" className="text-end">
									Total ICMS:
								</th>
								<th className="text-end">R$ {icms_total.toFixed(2)}</th>
								<th></th>
							</tr>
							<tr className="table-light">
								<th colSpan="4" className="text-end">
									Total Produtos:
								</th>
								<th className="text-end">
									R$ {parseFloat(venda.valor_total || 0).toFixed(2)}
								</th>
							</tr>
							<tr className="table-success">
								<th colSpan="4" className="text-end">
									Valor Líquido:
								</th>
								<th className="text-end">
									R$ {(parseFloat(venda.valor_total) - icms_total).toFixed(2)}
								</th>
							</tr>
						</tfoot>
					</Table>
				</Card.Body>
			</Card>
		</div>
	);
};

export default VendaDetail;
