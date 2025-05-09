import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart, faUsers, faBox, faMoneyBillWave, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { getDashboardData } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalVendas: 0,
    totalClientes: 0,
    totalProdutos: 0,
    valorTotalVendas: 0,
    vendasRecentes: [],
    produtosBaixoEstoque: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {        
        const response = await getDashboardData();   

        setStats(response.data);
        setLoading(false);  
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);       
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center p-5">Carregando dados...</div>;
  
  return (
    <div className="dashboard">
      <h1 className="mb-4">Dashboard</h1>     
      <Row>
        <Col md={3}>
          <Card className="mb-4 text-white bg-primary">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">Vendas</h5>
                  <h2 className="mb-0">{stats.totalVendas}</h2>
                </div>
                <FontAwesomeIcon icon={faShoppingCart} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-white bg-success">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">Clientes</h5>
                  <h2 className="mb-0">{stats.totalClientes}</h2>
                </div>
                <FontAwesomeIcon icon={faUsers} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-white bg-warning">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">Produtos</h5>
                  <h2 className="mb-0">{stats.totalProdutos}</h2>
                </div>
                <FontAwesomeIcon icon={faBox} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="mb-4 text-white bg-info">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="card-title">Faturamento</h5>
                  <h2 className="mb-0">R$ {stats.valorTotalVendas.toFixed(2)}</h2>
                </div>
                <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Vendas Recentes</h5>
            </Card.Header>
            <Card.Body>
              {stats.vendasRecentes && stats.vendasRecentes.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Cliente</th>
                      <th>Data</th>
                      <th className="text-end">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.vendasRecentes.map((venda) => (
                      <tr key={venda.id}>
                        <td>
                          <Link to={`/vendas/${venda.id}`}>{venda.id}</Link>
                        </td>
                        <td>{venda.cliente__nome}</td>
                        <td>{new Date(venda.data_venda).toLocaleDateString()}</td>
                        <td className="text-end">R$ {parseFloat(venda.valor_total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">Nenhuma venda recente encontrada.</p>
              )}
              <div className="text-end mt-2">
                <Link to="/vendas" className="btn btn-sm btn-outline-primary">Ver todas as vendas</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          <Card>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Produtos com Baixo Estoque</h5>
            </Card.Header>
            <Card.Body>
              {stats.produtosBaixoEstoque && stats.produtosBaixoEstoque.length > 0 ? (
                <Table striped hover responsive>
                  <thead>
                    <tr>
                      <th>Produto</th>
                      <th className="text-center">Estoque</th>
                      <th className="text-end">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.produtosBaixoEstoque.map((produto) => (
                      <tr key={produto.id}>
                        <td>
                          <Link to={`/produtos/${produto.id}/editar`}>
                            {produto.nome} {produto.quantidade_estoque === 0 && (
                              <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger ms-1" />
                            )}
                          </Link>
                        </td>
                        <td className="text-center">{produto.quantidade_estoque}</td>
                        <td className="text-end">R$ {parseFloat(produto.preco_venda).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <p className="text-muted">Não há produtos com estoque baixo.</p>
              )}
              <div className="text-end mt-2">
                <Link to="/estoque/movimentacao" className="btn btn-sm btn-outline-warning">Registrar entrada</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;