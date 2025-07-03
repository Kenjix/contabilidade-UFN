import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Card, Badge, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faMoneyBill, faCreditCard } from '@fortawesome/free-solid-svg-icons';
import { getVendas } from '../../services/api';

const VendasList = () => {  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);  const [resumoVendas, setResumoVendas] = useState({
    totalVendasAVista: 0,
    totalVendasAPrazo: 0,
    qtdVendasAVista: 0,
    qtdVendasAPrazo: 0,
    contasReceber: 0
  });

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const response = await getVendas();       
        const vendasData = response.data || [];
        setVendas(vendasData);
          // Calcula totais de vendas finalizadas à vista e a prazo
        const vendasFinalizadas = vendasData.filter(venda => venda.status === 'finalizada');
          const vendasAVista = vendasFinalizadas.filter(
          venda => venda.tipo_pagamento === 'avista'
        );
        
        const vendasAPrazo = vendasFinalizadas.filter(
          venda => venda.tipo_pagamento === 'aprazo'
        );
        
        const totalAVista = vendasAVista.reduce((acc, venda) => acc + parseFloat(venda.valor_total || 0), 0);
        const totalAPrazo = vendasAPrazo.reduce((acc, venda) => acc + parseFloat(venda.valor_total || 0), 0);
        
        setResumoVendas({
          totalVendasAVista: totalAVista,
          totalVendasAPrazo: totalAPrazo,
          qtdVendasAVista: vendasAVista.length,
          qtdVendasAPrazo: vendasAPrazo.length
        });
        
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

      <Row className="mb-4">
        <Col md={6}>
          <Card className="h-100 bg-success bg-opacity-10 border-success">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Vendas à Vista Finalizadas</h5>
                  <h2 className="mb-0">R$ {resumoVendas.totalVendasAVista.toFixed(2)}</h2>
                  <p className="text-muted mt-2 mb-0">Total de {resumoVendas.qtdVendasAVista} vendas</p>
                </div>
                <div className="align-self-center">
                  <FontAwesomeIcon icon={faMoneyBill} size="3x" className="text-success opacity-50" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100 bg-warning bg-opacity-10 border-warning">
            <Card.Body>
              <div className="d-flex justify-content-between">
                <div>
                  <h5 className="card-title">Vendas a Prazo Finalizadas</h5>
                  <h2 className="mb-0">R$ {resumoVendas.totalVendasAPrazo.toFixed(2)}</h2>
                  <p className="text-muted mt-2 mb-0">Total de {resumoVendas.qtdVendasAPrazo} vendas</p>
                </div>
                <div className="align-self-center">
                  <FontAwesomeIcon icon={faCreditCard} size="3x" className="text-warning opacity-50" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

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
                    ? venda.percentual_icms.toFixed(1)
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
                      <td>{venda.tipo_pagamento === 'avista' ? 'À Vista' : 'A Prazo'}</td>
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