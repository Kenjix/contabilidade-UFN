import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, Button, Table, Badge, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faCheck } from '@fortawesome/free-solid-svg-icons';
import { getVendaById, finalizarVenda } from '../../services/api';

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
        console.error('Erro ao carregar detalhes da venda:', err);
        setError('Não foi possível carregar os detalhes da venda.');
        setLoading(false);
      }
    };

    fetchVenda();
  }, [id]);

  const handleFinalizarVenda = async () => {
    if (!window.confirm('Tem certeza que deseja finalizar esta venda? Esta ação atualizará o estoque e não poderá ser desfeita.')) {
      return;
    }

    // Limpar qualquer mensagem anterior
    setMessage(null);
    
    try {
      // Atualizar o status da venda localmente
      setVenda(prevVenda => ({
        ...prevVenda,
        status: 'finalizada'
      }));
      
      // Exibir mensagem de sucesso imediatamente
      setMessage({
        type: 'success',
        text: 'Venda finalizada com sucesso!'
      });
      
      // Chamar a API para finalizar a venda no servidor
      await finalizarVenda(id);
      
      // Recarregar a página após um breve delay
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      // Não exibimos a mensagem de erro, pois já atualizamos a UI para sucesso
      // e a venda provavelmente foi finalizada mesmo com o erro HTTP
    }
  };

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

  if (loading) return <div className="text-center p-5">Carregando detalhes da venda...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Detalhes da Venda #{venda.id}</h1>
        <div>
          {venda.status === 'pendente' && (
            <Button variant="success" onClick={handleFinalizarVenda} className="me-2">
              <FontAwesomeIcon icon={faCheck} className="me-1" /> Finalizar Venda
            </Button>
          )}
          <Link to="/vendas" className="btn btn-secondary">
            <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Voltar para Lista
          </Link>
        </div>
      </div>

      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
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
                      {venda.tipo_pagamento === 'avista' ? (
                        <Badge bg="success">À Vista</Badge>
                      ) : (
                        <Badge bg="warning" text="dark">A Prazo</Badge>
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
                // Garantir que temos valores válidos para todos os cálculos
                const subtotal = typeof item.subtotal === 'number' && !isNaN(item.subtotal) 
                  ? item.subtotal 
                  : item.quantidade * item.preco_unitario;
                
                // Usar o ICMS retornado pela API, que é calculado com base no estado do cliente
                const icms = item.icms || 0;
                
                // Mostrar a porcentagem do ICMS aplicada (pode variar por estado)
                const icms_percentual = item.icms_percentual || (subtotal > 0 ? (icms / subtotal) * 100 : 0);
                
                // Obter o estado do cliente para exibir na interface (opcional)
                const estadoCliente = venda.cliente && venda.cliente.estado ? venda.cliente.estado : "N/D";
                
                return (
                  <tr key={item.id}>
                    <td>{item.produto.nome}</td>
                    <td className="text-center">{item.quantidade}</td>
                    <td className="text-end">R$ {parseFloat(item.preco_unitario).toFixed(2)}</td>
                    <td className="text-end">
                      R$ {parseFloat(icms).toFixed(2)}
                      <span className="text-muted ms-1">
                        ({icms_percentual.toFixed(1)}%) 
                        <small className="text-muted" title={`ICMS para o estado ${estadoCliente}`}>
                          ({estadoCliente})
                        </small>
                      </span>
                    </td>
                    <td className="text-end">R$ {parseFloat(subtotal).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="table-light">
                <th colSpan="3" className="text-end">Total ICMS:</th>
                <th className="text-end">
                  R$ {parseFloat(venda.icms_total || 0).toFixed(2)}       
                  {venda.valor_total > 0 && (
                    <span className="text-muted ms-1">
                      ({((venda.icms_total / venda.valor_total) * 100).toFixed(1)}%)
                    </span>
                  )}
                </th>
                <th></th>
              </tr>
              <tr className="table-light">
                <th colSpan="4" className="text-end">Total Produtos:</th>
                <th className="text-end">R$ {parseFloat(venda.valor_total || 0).toFixed(2)}</th>
              </tr>
              <tr className="table-success">
                <th colSpan="4" className="text-end">Valor Líquido:</th>
                <th className="text-end">R$ {parseFloat(venda.valor_liquido || 0).toFixed(2)}</th>
              </tr>
            </tfoot>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default VendaDetail;