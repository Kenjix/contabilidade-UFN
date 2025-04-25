import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Card, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus } from '@fortawesome/free-solid-svg-icons';
import { getVendas } from '../../services/api';

const VendasList = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        console.log("Buscando dados de vendas...");
        const response = await getVendas();        

        console.log('\n========= DEBUG ICMS FRONTEND =========');
        if (response.data && response.data.length > 0) {
          response.data.forEach((venda, index) => {

            if (!venda || !venda.cliente) {
              console.error('Venda inválida ou incompleta:', venda);
              return;
            }

            const valorTotal = typeof venda.valor_total === 'number' ? venda.valor_total : 0;
            const icmsTotal = typeof venda.icms_total === 'number' ? venda.icms_total : 0;
            const valorLiquido = typeof venda.valor_liquido === 'number' ? venda.valor_liquido : 0;

            const icmsPercentual = valorTotal > 0 
              ? ((icmsTotal / valorTotal) * 100).toFixed(2) 
              : '0';
              
            console.log(`\n----- VENDA #${venda.id || 'ID não definido'} -----`);
            console.log(`Cliente: ${venda.cliente.nome || 'Nome não definido'}`);
            console.log(`Estado do cliente: ${venda.cliente.estado || 'Não definido'}`);
            console.log(`Valor Total: R$${valorTotal.toFixed(2)}`);
            console.log(`ICMS Total: R$${icmsTotal.toFixed(2)}`);
            console.log(`ICMS Percentual: ${icmsPercentual}%`);
            console.log(`Valor Líquido: R$${valorLiquido.toFixed(2)}`);

            if (!venda.cliente.estado || venda.cliente.estado === 'Não definido') {
              console.warn(`⚠️ Alerta: Cliente ${venda.cliente.nome} (Venda #${venda.id}) não tem estado definido!`);
              console.warn('   → O cálculo de ICMS está usando a alíquota padrão do produto, não a alíquota estadual.');
            }

            const commonRates = {
              7: 'SP, RJ, MG, PR',
              12: 'SC, RS',
              17: 'Outros estados',
              18: 'MS'
            };
            
            for (const [rate, states] of Object.entries(commonRates)) {
              const rateNum = parseFloat(rate);
              if (Math.abs(parseFloat(icmsPercentual) - rateNum) < 0.5) {
                console.log(`NOTA: Alíquota de ${icmsPercentual}% está muito próxima da alíquota de ${rate}% (${states})`);
              }
            }            

            if (index < 3) {
              if (venda.cliente.estado) {
                console.log(`Estado do cliente definido: ${venda.cliente.estado}`);
              } else {
                console.log("ALERTA: Cliente sem estado definido!");
              }
            }
          });
        } else {
          console.log("Nenhuma venda encontrada na resposta.");
        }
        console.log('=======================================\n');
        
        setVendas(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar vendas:', err);
        setError('Não foi possível carregar a lista de vendas.');
        setLoading(false);
      }
    };

    fetchVendas();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente':
        return <Badge bg="warning" text="dark">Pendente</Badge>;
      case 'finalizada':
        return <Badge bg="success">Finalizada</Badge>;
      case 'cancelada':
        return <Badge bg="danger">Cancelada</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) return <div className="text-center p-5">Carregando vendas...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Vendas</h1>
        <Link to="/vendas/nova" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Nova Venda
        </Link>
      </div>

      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Lista de Vendas</h5>
        </Card.Header>
        <Card.Body>
          {vendas.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">Nenhuma venda encontrada.</p>
              <Link to="/vendas/nova" className="btn btn-primary">Criar Nova Venda</Link>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Estado</th>
                  <th>Data</th>
                  <th>Valor Total</th>
                  <th>ICMS</th>
                  <th>Valor Líquido</th>
                  <th>Status</th>
                  <th>Pagamento</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => {
                  if (!venda || !venda.cliente) return null;                  

                  const valorTotal = typeof venda.valor_total === 'number' ? venda.valor_total : 0;
                  const icmsTotal = typeof venda.icms_total === 'number' ? venda.icms_total : 0;
                  const valorLiquido = typeof venda.valor_liquido === 'number' ? venda.valor_liquido : 0;                  

                  const icmsPercentual = valorTotal > 0
                    ? ((icmsTotal / valorTotal) * 100).toFixed(1)
                    : '0';
                  
                  return (
                    <tr key={venda.id}>
                      <td>{venda.id}</td>
                      <td>{venda.cliente.nome}</td>
                      <td>
                        {venda.cliente.estado || 
                          <span className="text-danger">Não definido</span>}
                      </td>
                      <td>{new Date(venda.data_venda).toLocaleDateString()}</td>
                      <td>R$ {parseFloat(valorTotal).toFixed(2)}</td>
                      <td>
                        <div>R$ {parseFloat(icmsTotal).toFixed(2)}</div>
                        <small className="text-muted">
                          ({icmsPercentual}%)
                        </small>
                      </td>
                      <td>R$ {parseFloat(valorLiquido).toFixed(2)}</td>
                      <td>{getStatusBadge(venda.status)}</td>
                      <td>{venda.tipo_pagamento === 'avista' || venda.tipo_pagamento === 'a_vista' ? 'À Vista' : 'A Prazo'}</td>
                      <td className="text-center">
                        <Link to={`/vendas/${venda.id}`} className="btn btn-sm btn-info">
                          <FontAwesomeIcon icon={faEye} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default VendasList;