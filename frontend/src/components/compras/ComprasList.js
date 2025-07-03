import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ComprasList.css";

export default function ComprasList() {
	const [compras, setCompras] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filtro, setFiltro] = useState({
		status: "",
		fornecedor: "",
		forma_pagamento: "",
	});

	useEffect(() => {
		fetchCompras();
	}, []);
	const fetchCompras = async () => {
		try {
			setLoading(true);
			const response = await axios.get("/api/compras/compras/");
			setCompras(response.data);
			setError("");
		} catch (err) {
			setError("Erro ao carregar compras");
			console.error("Erro ao carregar compras:", err);
		} finally {
			setLoading(false);
		}
	};

	const handleFilterChange = (e) => {
		setFiltro({
			...filtro,
			[e.target.name]: e.target.value,
		});
	};
	const filteredCompras = compras.filter((compra) => {
		const fornecedorNome =
			compra.fornecedor_nome || compra.fornecedor?.nome || "";
		return (
			(!filtro.status || compra.status === filtro.status) &&
			(!filtro.fornecedor ||
				fornecedorNome
					.toLowerCase()
					.includes(filtro.fornecedor.toLowerCase())) &&
			(!filtro.forma_pagamento ||
				compra.forma_pagamento === filtro.forma_pagamento)
		);
	});

	const formatCurrency = (value) => {
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString("pt-BR");
	};

	const getStatusBadge = (status) => {
		const statusClasses = {
			pendente: "badge-warning",
			finalizada: "badge-success",
			cancelada: "badge-danger",
		};

		const statusLabels = {
			pendente: "Pendente",
			finalizada: "Finalizada",
			cancelada: "Cancelada",
		};

		return (
			<span className={`badge ${statusClasses[status]}`}>
				{statusLabels[status] || status}
			</span>
		);
	};

	const getPaymentBadge = (forma_pagamento) => {
		const paymentClasses = {
			avista: "badge-info",
			aprazo: "badge-primary",
			parcelado: "badge-secondary",
		};

		const paymentLabels = {
			avista: "À Vista",
			aprazo: "A Prazo",
			parcelado: "Parcelado",
		};

		return (
			<span className={`badge ${paymentClasses[forma_pagamento]}`}>
				{paymentLabels[forma_pagamento] || forma_pagamento}
			</span>
		);
	};

	if (loading) {
		return (
			<div className="compras-list-container">
				<div className="loading">Carregando compras...</div>
			</div>
		);
	}

	return (
		<div className="compras-list-container">
			<div className="header">
				<h3>Lista de Compras</h3>
				<button onClick={fetchCompras} className="btn btn-secondary">
					🔄 Atualizar
				</button>
			</div>

			{error && <div className="message error">{error}</div>}

			<div className="filters">
				<div className="filter-group">
					<label>Status:</label>
					<select
						name="status"
						value={filtro.status}
						onChange={handleFilterChange}
						className="form-control"
					>
						<option value="">Todos</option>
						<option value="pendente">Pendente</option>
						<option value="finalizada">Finalizada</option>
						<option value="cancelada">Cancelada</option>
					</select>
				</div>

				<div className="filter-group">
					<label>Fornecedor:</label>
					<input
						type="text"
						name="fornecedor"
						value={filtro.fornecedor}
						onChange={handleFilterChange}
						placeholder="Buscar por fornecedor..."
						className="form-control"
					/>
				</div>

				<div className="filter-group">
					<label>Forma de Pagamento:</label>
					<select
						name="forma_pagamento"
						value={filtro.forma_pagamento}
						onChange={handleFilterChange}
						className="form-control"
					>
						<option value="">Todas</option>
						<option value="avista">À Vista</option>
						<option value="aprazo">A Prazo</option>
						<option value="parcelado">Parcelado</option>
					</select>
				</div>
			</div>

			{filteredCompras.length === 0 ? (
				<div className="no-data">
					{compras.length === 0
						? "Nenhuma compra encontrada. Crie sua primeira compra!"
						: "Nenhuma compra encontrada com os filtros aplicados."}
				</div>
			) : (
				<div className="compras-grid">
					{filteredCompras.map((compra) => (
						<div key={compra.id} className="compra-card">
							<div className="card-header">
								<div className="compra-id">Compra #{compra.id}</div>
								<div className="badges">
									{getStatusBadge(compra.status)}
									{getPaymentBadge(compra.forma_pagamento)}
								</div>
							</div>{" "}
							<div className="card-body">
								<div className="fornecedor">
									<strong>Fornecedor:</strong>{" "}
									{compra.fornecedor_nome || compra.fornecedor?.nome || "N/A"}
								</div>
								<div className="data-compra">
									<strong>Data:</strong> {formatDate(compra.data_compra)}
								</div>
								<div className="valores">
									<div className="valor-total">
										<strong>Total:</strong> {formatCurrency(compra.valor_total)}
									</div>

									{compra.valor_entrada > 0 && (
										<div className="valor-entrada">
											<strong>Entrada:</strong>{" "}
											{formatCurrency(compra.valor_entrada)}
										</div>
									)}

									<div className="valor-pendente">
										<strong>Pendente:</strong>{" "}
										{formatCurrency(
											compra.valor_pendente ||
												compra.valor_total - compra.valor_entrada
										)}
									</div>
								</div>
								{compra.parcelas > 1 && (
									<div className="parcelas">
										<strong>Parcelas:</strong> {compra.parcelas}x
									</div>
								)}
								{compra.nota_fiscal && (
									<div className="nota-fiscal">
										<strong>NF:</strong> {compra.nota_fiscal}
									</div>
								)}
								{compra.observacao && (
									<div className="observacao">
										<strong>Obs:</strong> {compra.observacao}
									</div>
								)}{" "}
								{compra.itens && compra.itens.length > 0 && (
									<div className="itens-preview">
										<strong>Itens ({compra.itens.length}):</strong>
										<ul>
											{compra.itens.slice(0, 3).map((item, idx) => (
												<li key={idx}>
													{item.quantidade}x{" "}
													{item.produto_nome ||
														item.produto?.nome ||
														`Produto ID ${item.produto}`}
												</li>
											))}
											{compra.itens.length > 3 && (
												<li>... e mais {compra.itens.length - 3} item(s)</li>
											)}
										</ul>
									</div>
								)}
							</div>
						</div>
					))}
				</div>
			)}

			<div className="summary">
				<p>
					Total de compras: {filteredCompras.length}
					{compras.length !== filteredCompras.length &&
						` (de ${compras.length})`}
				</p>

				{filteredCompras.length > 0 && (
					<p>
						Valor total:{" "}
						{formatCurrency(
							filteredCompras.reduce(
								(sum, compra) => sum + parseFloat(compra.valor_total),
								0
							)
						)}
					</p>
				)}
			</div>
		</div>
	);
}
