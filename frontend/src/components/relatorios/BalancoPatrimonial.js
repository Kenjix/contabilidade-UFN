import React, { useState, useEffect } from "react";
import {
	Container,
	Row,
	Col,
	Card,
	Table,
	Spinner,
	Alert,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { getBalancoPatrimonial } from "../../services/patrimonioService";

const formatCurrency = (value) => {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(Number(value));
};

const BalancoPatrimonial = () => {
	const [balanco, setBalanco] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchBalanco = async () => {
			try {
				setLoading(true);
				const response = await getBalancoPatrimonial();
				setBalanco(response.data);
				setError(null);
			} catch (err) {
				setError(
					"Erro ao carregar o balanço patrimonial. Por favor, tente novamente."
				);
				console.error("Erro ao carregar balanço:", err);
			} finally {
				setLoading(false);
			}
		};

		fetchBalanco();
	}, []);

	if (loading) {
		return (
			<Container className="text-center my-5">
				<Spinner animation="border" role="status">
					<span className="visually-hidden">Carregando...</span>
				</Spinner>
			</Container>
		);
	}

	if (error) {
		return (
			<Container className="my-4">
				<Alert variant="danger">{error}</Alert>
			</Container>
		);
	}

	return (
		<Container className="py-4">
			<h1 className="mb-4">Balanço Patrimonial</h1>
			<p className="text-muted">
				Data de referência: {new Date().toLocaleDateString("pt-BR")}
			</p>
			<Alert variant="info" className="mb-4">
				<div className="d-flex">
					<div className="me-3">
						<FontAwesomeIcon icon={faInfoCircle} size="lg" />
					</div>
					<div className="d-flex flex-column align-items-center w-100">
						<h5>Composição do Patrimônio da Empresa</h5>
						<span className="align-self-start text-start">
							O patrimônio da empresa é composto por{" "}
							<strong>bens e direitos</strong> (ativos) que são classificados
							em:
						</span>
						<ul className="mb-0 align-self-start text-start">
							<li>
								<strong>Ativo Circulante:</strong> Mercadorias para revenda,
								contas a receber de vendas a prazo e caixa.
							</li>
							<li>
								<strong>Ativo Não Circulante:</strong> Bens que não se destinam
								à revenda (imóveis, veículos, máquinas e equipamentos).
							</li>
						</ul>
					</div>
				</div>
			</Alert>
			<Row className="mt-4">
				<Col md={6}>
					<Card className="mb-4 shadow-sm">
						<Card.Header className="bg-primary text-white">
							<h4 className="mb-0">Ativo</h4>
						</Card.Header>
						<Card.Body>
							<Table striped hover>
								<thead>
									<tr>
										<th>Item</th>
										<th className="text-end">Valor</th>
									</tr>
								</thead>
								<tbody>
									{/* Bens e Direitos */}
									<tr className="table-light fw-bold">
										<td colSpan="2">Bens e Direitos</td>
									</tr>

									{/* Ativo Circulante */}
									<tr className="table-info">
										<td className="ps-3 fw-bold">
											Ativo Circulante
											<span
												className="text-muted ms-2"
												title="Soma do estoque, contas a receber e caixa"
											>
												(A.Circ)
											</span>
										</td>
										<td className="text-end fw-bold">
											{formatCurrency(balanco?.ativo?.circulante?.valor || 0)}
										</td>
									</tr>
									<tr>
										<td className="ps-4">
											Estoque de Mercadorias
											<span
												className="text-muted ms-2"
												title="Mercadorias para revenda"
											>
												(EM)
											</span>
										</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.ativo?.circulante?.estoque_mercadorias || 0
											)}
										</td>
									</tr>
									<tr>
										<td className="ps-4">
											Contas a Receber
											<span className="text-muted ms-2" title="Vendas a prazo">
												(CR)
											</span>
										</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.ativo?.circulante?.contas_receber || 0
											)}
										</td>
									</tr>
									<tr>
										<td className="ps-4">
											Caixa e Equivalentes
											<span
												className="text-muted ms-2"
												title="Capital social + vendas à vista"
											>
												(CX)
											</span>
										</td>
										<td className="text-end">
											{formatCurrency(balanco?.ativo?.circulante?.caixa || 0)}
										</td>
									</tr>

									{/* Ativo Não Circulante */}
									<tr className="table-info">
										<td className="ps-3 fw-bold">
											Ativo Não Circulante (Bens Patrimoniais)
										</td>
										<td className="text-end fw-bold">
											{formatCurrency(
												balanco?.ativo?.nao_circulante?.valor || 0
											)}
										</td>
									</tr>
									<tr>
										<td className="ps-4">Imóveis, Veículos e Equipamentos</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.ativo?.nao_circulante?.bens_patrimoniais
													?.valor || 0
											)}
										</td>
									</tr>
								</tbody>
								<tfoot>
									<tr className="fw-bold">
										<td>Total do Ativo</td>
										<td className="text-end">
											{formatCurrency(balanco?.ativo?.total || 0)}
										</td>
									</tr>
								</tfoot>
							</Table>
						</Card.Body>
					</Card>
				</Col>

				<Col md={6}>
					<Card className="mb-4 shadow-sm">
						<Card.Header className="bg-success text-white">
							<h4 className="mb-0">Passivo</h4>
						</Card.Header>
						<Card.Body>
							<Table striped hover>
								<thead>
									<tr>
										<th>Item</th>
										<th className="text-end">Valor</th>
									</tr>
								</thead>
								<tbody>
									{/* Obrigações */}
									<tr className="table-light fw-bold">
										<td colSpan="2">Exigível (Obrigações)</td>
									</tr>

									{/* Passivo Circulante */}
									<tr className="table-warning">
										<td className="ps-3 fw-bold">Passivo Circulante</td>
										<td className="text-end fw-bold">
											{formatCurrency(
												parseFloat(
													balanco?.passivo?.exigivel?.circulante?.contas_pagar
														?.fornecedores_bens?.valor || 0
												) +
													parseFloat(
														balanco?.passivo?.exigivel?.circulante?.contas_pagar
															?.fornecedores_mercadorias?.valor || 0
													) +
													0 +
													0
											)}
										</td>
									</tr>

									<tr>
										<td className="ps-5">Fornecedores - Bens Patrimoniais</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.passivo?.exigivel?.circulante?.contas_pagar
													?.fornecedores_bens?.valor || 0
											)}
										</td>
									</tr>
									<tr>
										<td className="ps-5">Fornecedores - Mercadorias</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.passivo?.exigivel?.circulante?.contas_pagar
													?.fornecedores_mercadorias?.valor || 0
											)}
										</td>
									</tr>

									{/* Impostos a Pagar */}
									<tr>
										<td className="ps-4">Impostos a Pagar</td>
										<td className="text-end">{formatCurrency(0)}</td>
									</tr>

									{/* Financiamentos */}
									<tr>
										<td className="ps-4">Financiamentos</td>
										<td className="text-end">{formatCurrency(0)}</td>
									</tr>

									{/* Passivo Não Circulante */}
									<tr className="table-warning">
										<td className="ps-3 fw-bold">Passivo Não Circulante</td>
										<td className="text-end fw-bold">
											{formatCurrency(
												balanco?.passivo?.exigivel?.nao_circulante
													?.total_nao_circulante || 0
											)}
										</td>
									</tr>

									{/* Patrimônio Líquido */}
									<tr className="table-light fw-bold">
										<td colSpan="2">Patrimônio Líquido</td>
									</tr>
									<tr>
										<td className="ps-3">
											Capital Social
											<span
												className="text-muted ms-2"
												title={
													balanco?.passivo?.patrimonio_liquido?.capital_social
														?.descricao || ""
												}
											>
												(CS)
											</span>
										</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.passivo?.patrimonio_liquido?.capital_social
													?.valor || 0
											)}
										</td>
									</tr>
									<tr>
										<td className="ps-3">
											Lucros/Prejuízos Acumulados
											<span
												className="text-muted ms-2"
												title={
													balanco?.passivo?.patrimonio_liquido
														?.lucros_prejuizos_acumulados?.descricao || ""
												}
											>
												(LPA)
											</span>
										</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.passivo?.patrimonio_liquido
													?.lucros_prejuizos_acumulados?.valor || 0
											)}
										</td>
									</tr>
									<tr className="table-secondary fw-bold">
										<td className="ps-3">Total Patrimônio Líquido</td>
										<td className="text-end">
											{formatCurrency(
												balanco?.passivo?.patrimonio_liquido
													?.total_patrimonio_liquido || 0
											)}
										</td>
									</tr>
								</tbody>
								<tfoot>
									<tr className="fw-bold">
										<td>Total do Passivo</td>
										<td className="text-end">
											{formatCurrency(balanco?.passivo?.total_passivo || 0)}
										</td>
									</tr>
								</tfoot>
							</Table>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row className="mt-4">
				{balanco?.ativo?.bens_patrimoniais?.itens?.length > 0 && (
					<Col md={12}>
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-light">
								<h5 className="mb-0">Detalhamento dos Bens Patrimoniais</h5>
								<small className="text-muted">
									Bens que permanecem no patrimônio da empresa e não se destinam
									à revenda
								</small>
							</Card.Header>
							<Card.Body>
								<Table striped hover responsive>
									<thead>
										<tr>
											<th>Nome</th>
											<th>Tipo</th>
											<th>Data de Aquisição</th>
											<th>Valor de Aquisição</th>
											<th>Depreciação</th>
											<th>Valor Atual</th>
										</tr>
									</thead>
									<tbody>
										{balanco.ativo.bens_patrimoniais.itens.map((bem) => {
											const depreciacao = bem.valor_aquisicao - bem.valor_atual;
											return (
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
													<td>
														{new Date(bem.data_aquisicao).toLocaleDateString(
															"pt-BR"
														)}
													</td>
													<td className="text-end">
														{formatCurrency(bem.valor_aquisicao)}
													</td>
													<td className="text-end text-danger">
														-{formatCurrency(depreciacao)}
													</td>
													<td className="text-end">
														{formatCurrency(bem.valor_atual)}
													</td>
												</tr>
											);
										})}
									</tbody>
									<tfoot>
										<tr className="fw-bold">
											<td colSpan="3">Total</td>
											<td className="text-end">
												{formatCurrency(
													balanco.ativo.bens_patrimoniais.itens.reduce(
														(sum, bem) => sum + Number(bem.valor_aquisicao),
														0
													)
												)}
											</td>
											<td className="text-end text-danger">
												-
												{formatCurrency(
													balanco.ativo.bens_patrimoniais.itens.reduce(
														(sum, bem) =>
															sum +
															(Number(bem.valor_aquisicao) -
																Number(bem.valor_atual)),
														0
													)
												)}
											</td>
											<td className="text-end">
												{formatCurrency(
													balanco.ativo.bens_patrimoniais.itens.reduce(
														(sum, bem) => sum + Number(bem.valor_atual),
														0
													)
												)}
											</td>
										</tr>
									</tfoot>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				)}

				{balanco?.ativo?.circulante?.estoque_mercadorias_itens?.length > 0 && (
					<Col md={12}>
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-primary text-white">
								<h5 className="mb-0">Detalhamento do Estoque de Mercadorias</h5>
								<small className="text-white-50">
									Mercadorias adquiridas para revenda
								</small>
							</Card.Header>
							<Card.Body>
								<Table striped hover responsive>
									<thead>
										<tr>
											<th>Código</th>
											<th>Nome</th>
											<th>Quantidade</th>
											<th>Valor Unitário</th>
											<th>Valor Total</th>
										</tr>
									</thead>
									<tbody>
										{balanco.ativo.circulante.estoque_mercadorias_itens.map(
											(item) => (
												<tr key={item.id}>
													<td>{item.codigo}</td>
													<td>{item.nome}</td>
													<td className="text-end">{item.quantidade}</td>
													<td className="text-end">
														{formatCurrency(item.preco_compra)}
													</td>
													<td className="text-end">
														{formatCurrency(item.valor_total)}
													</td>
												</tr>
											)
										)}
									</tbody>
									<tfoot>
										<tr className="fw-bold">
											<td colSpan="4">Total</td>
											<td className="text-end">
												{formatCurrency(
													balanco.ativo.circulante.estoque_mercadorias
												)}
											</td>
										</tr>
									</tfoot>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				)}
			</Row>

			{/* Detalhamento das Compras de Mercadorias a Prazo */}
			{balanco?.passivo?.exigivel?.circulante?.contas_pagar?.fornecedores_mercadorias?.detalhes?.filter(
				(compra) => parseFloat(compra.valores.pendente) > 0
			)?.length > 0 && (
				<Row className="mt-4">
					<Col md={12}>
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-warning text-dark">
								<h5 className="mb-0">
									Compras de Mercadorias a Prazo (Pendentes)
								</h5>
								<small className="text-muted">
									Obrigações com fornecedores de mercadorias - Total:{" "}
									{formatCurrency(
										balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_mercadorias.detalhes
											.filter(
												(compra) => parseFloat(compra.valores.pendente) > 0
											)
											.reduce(
												(sum, compra) =>
													sum + parseFloat(compra.valores.pendente),
												0
											)
									)}
									(
									{
										balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_mercadorias.detalhes.filter(
											(compra) => parseFloat(compra.valores.pendente) > 0
										).length
									}{" "}
									compras pendentes)
								</small>
							</Card.Header>
							<Card.Body>
								<Table striped hover responsive>
									<thead>
										<tr>
											<th>ID</th>
											<th>Fornecedor</th>
											<th>Data da Compra</th>
											<th>Valor Total</th>
											<th>Entrada</th>
											<th>Pendente</th>
											<th>% Pago</th>
											<th>Parcelas</th>
											<th>Status</th>
											<th>Nota Fiscal</th>
										</tr>
									</thead>
									<tbody>
										{balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_mercadorias.detalhes
											.filter(
												(compra) => parseFloat(compra.valores.pendente) > 0
											)
											.map((compra) => (
												<tr key={compra.compra_id}>
													<td>{compra.compra_id}</td>
													<td>{compra.fornecedor.nome}</td>
													<td>
														{new Date(compra.data_compra).toLocaleDateString(
															"pt-BR"
														)}
													</td>
													<td className="text-end">
														{formatCurrency(compra.valores.total)}
													</td>
													<td className="text-end">
														{formatCurrency(compra.valores.entrada)}
													</td>
													<td className="text-end text-danger">
														{formatCurrency(compra.valores.pendente)}
													</td>
													<td className="text-center">
														<span
															className={`badge ${
																parseFloat(compra.valores.percentual_pago) > 50
																	? "bg-success"
																	: parseFloat(compra.valores.percentual_pago) >
																	  0
																	? "bg-warning text-dark"
																	: "bg-danger"
															}`}
														>
															{compra.valores.percentual_pago}
														</span>
													</td>
													<td className="text-center">
														{compra.pagamento.parcelas}
													</td>
													<td>
														<span
															className={`badge ${
																compra.pagamento.status === "finalizada"
																	? "bg-success"
																	: "bg-warning text-dark"
															}`}
														>
															{compra.pagamento.status === "finalizada"
																? "Finalizada"
																: "Pendente"}
														</span>
													</td>
													<td>{compra.documento.nota_fiscal}</td>
												</tr>
											))}
									</tbody>
									<tfoot>
										<tr className="fw-bold table-warning">
											<td colSpan="5">Total a Pagar - Mercadorias</td>
											<td className="text-end text-danger">
												{formatCurrency(
													balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_mercadorias.detalhes
														.filter(
															(compra) =>
																parseFloat(compra.valores.pendente) > 0
														)
														.reduce(
															(sum, compra) =>
																sum + parseFloat(compra.valores.pendente),
															0
														)
												)}
											</td>
											<td colSpan="4"></td>
										</tr>
									</tfoot>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			)}

			{/* Detalhamento das Aquisições de Bens a Prazo */}
			{balanco?.passivo?.exigivel?.circulante?.contas_pagar?.fornecedores_bens?.detalhes?.filter(
				(aquisicao) => parseFloat(aquisicao.valores.pendente) > 0
			)?.length > 0 && (
				<Row className="mt-4">
					<Col md={12}>
						<Card className="mb-4 shadow-sm">
							<Card.Header className="bg-info text-white">
								<h5 className="mb-0">
									Aquisições de Bens Patrimoniais a Prazo (Pendentes)
								</h5>
								<small className="text-muted">
									Obrigações com fornecedores de bens - Total:{" "}
									{formatCurrency(
										balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_bens.detalhes
											.filter(
												(aquisicao) =>
													parseFloat(aquisicao.valores.pendente) > 0
											)
											.reduce(
												(sum, aquisicao) =>
													sum + parseFloat(aquisicao.valores.pendente),
												0
											)
									)}
									(
									{
										balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_bens.detalhes.filter(
											(aquisicao) => parseFloat(aquisicao.valores.pendente) > 0
										).length
									}{" "}
									aquisições pendentes)
								</small>
							</Card.Header>
							<Card.Body>
								<Table striped hover responsive>
									<thead>
										<tr>
											<th>ID</th>
											<th>Bem</th>
											<th>Categoria</th>
											<th>Fornecedor</th>
											<th>Data Aquisição</th>
											<th>Valor Total</th>
											<th>Entrada</th>
											<th>Pendente</th>
											<th>% Pago</th>
											<th>Parcelas</th>
											<th>Forma Pagto</th>
										</tr>
									</thead>
									<tbody>
										{balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_bens.detalhes
											.filter(
												(aquisicao) =>
													parseFloat(aquisicao.valores.pendente) > 0
											)
											.map((aquisicao) => (
												<tr key={aquisicao.aquisicao_id}>
													<td>{aquisicao.aquisicao_id}</td>
													<td>{aquisicao.bem.nome}</td>
													<td>{aquisicao.bem.categoria}</td>
													<td>{aquisicao.fornecedor.nome}</td>
													<td>
														{new Date(
															aquisicao.data_aquisicao
														).toLocaleDateString("pt-BR")}
													</td>
													<td className="text-end">
														{formatCurrency(aquisicao.valores.total)}
													</td>
													<td className="text-end">
														{formatCurrency(aquisicao.valores.entrada)}
													</td>
													<td className="text-end text-danger">
														{formatCurrency(aquisicao.valores.pendente)}
													</td>
													<td className="text-center">
														<span
															className={`badge ${
																parseFloat(aquisicao.valores.percentual_pago) >
																50
																	? "bg-success"
																	: parseFloat(
																			aquisicao.valores.percentual_pago
																	  ) > 0
																	? "bg-warning text-dark"
																	: "bg-danger"
															}`}
														>
															{aquisicao.valores.percentual_pago}
														</span>
													</td>
													<td className="text-center">
														{aquisicao.pagamento.parcelas}
													</td>
													<td>
														<span className="badge bg-secondary">
															{aquisicao.pagamento.forma === "parcelado"
																? "Parcelado"
																: "Financiado"}
														</span>
													</td>
												</tr>
											))}
									</tbody>
									<tfoot>
										<tr className="fw-bold table-info">
											<td colSpan="7">Total a Pagar - Bens Patrimoniais</td>
											<td className="text-end text-danger">
												{formatCurrency(
													balanco.passivo.exigivel.circulante.contas_pagar.fornecedores_bens.detalhes
														.filter(
															(aquisicao) =>
																parseFloat(aquisicao.valores.pendente) > 0
														)
														.reduce(
															(sum, aquisicao) =>
																sum + parseFloat(aquisicao.valores.pendente),
															0
														)
												)}
											</td>
											<td colSpan="3"></td>
										</tr>
									</tfoot>
								</Table>
							</Card.Body>
						</Card>
					</Col>
				</Row>
			)}

			{/* Resumo Financeiro */}
			{balanco?.resumo && (
				<Row className="mt-4">
					<Col md={12}>
						<Card className="mb-4 shadow-sm border-primary">
							<Card.Header className="bg-primary text-white">
								<h5 className="mb-0">Resumo do Balanço Patrimonial</h5>
							</Card.Header>
							<Card.Body>
								<Row>
									<Col md={3}>
										<div className="text-center p-3 bg-light rounded">
											<h6 className="text-muted">Total do Ativo</h6>
											<h4 className="text-primary">
												{formatCurrency(balanco.resumo.total_ativo)}
											</h4>
										</div>
									</Col>
									<Col md={3}>
										<div className="text-center p-3 bg-light rounded">
											<h6 className="text-muted">Total Obrigações</h6>
											<h4 className="text-danger">
												{formatCurrency(balanco.resumo.total_obrigacoes)}
											</h4>
										</div>
									</Col>
									<Col md={3}>
										<div className="text-center p-3 bg-light rounded">
											<h6 className="text-muted">Patrimônio Líquido</h6>
											<h4 className="text-success">
												{formatCurrency(balanco.resumo.patrimonio_liquido)}
											</h4>
										</div>
									</Col>
									<Col md={3}>
										<div className="text-center p-3 bg-light rounded">
											<h6 className="text-muted">Balanço</h6>
											<h4
												className={
													balanco.resumo.balanco_fechado
														? "text-success"
														: "text-danger"
												}
											>
												{balanco.resumo.balanco_fechado
													? "✓ Fechado"
													: "✗ Aberto"}
											</h4>
										</div>
									</Col>
								</Row>
								{!balanco.resumo.balanco_fechado && (
									<Alert variant="warning" className="mt-3 mb-0">
										<strong>Atenção:</strong> O balanço não está fechado.
										Verifique se todas as transações foram registradas
										corretamente.
									</Alert>
								)}
							</Card.Body>
						</Card>
					</Col>
				</Row>
			)}
		</Container>
	);
};

export default BalancoPatrimonial;
