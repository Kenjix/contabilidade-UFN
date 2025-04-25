import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faArrowRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const MovimentacaoForm = () => {
  const navigate = useNavigate();
  
  const [movimentacao, setMovimentacao] = useState({
    produto: '',
    tipo: 'entrada',
    quantidade: 1,
    documento_ref: '',
    observacao: ''
  });
  const [produtos, setProdutos] = useState([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('/api/produtos/');
        setProdutos(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar produtos:', err);
        setError('Não foi possível carregar a lista de produtos.');
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  useEffect(() => {
    if (movimentacao.produto) {
      const produto = produtos.find(p => p.id === parseInt(movimentacao.produto));
      setProdutoSelecionado(produto || null);
    } else {
      setProdutoSelecionado(null);
    }
  }, [movimentacao.produto, produtos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantidade') {
      setMovimentacao({ ...movimentacao, [name]: parseInt(value) || 0 });
    } else {
      setMovimentacao({ ...movimentacao, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!movimentacao.produto) {
      setMessage({ type: 'danger', text: 'Selecione um produto.' });
      return;
    }

    if (movimentacao.quantidade <= 0) {
      setMessage({ type: 'danger', text: 'A quantidade deve ser maior que zero.' });
      return;
    }

    if (movimentacao.tipo === 'saida' && produtoSelecionado && 
        produtoSelecionado.quantidade_estoque < movimentacao.quantidade) {
      setMessage({ 
        type: 'danger', 
        text: `Estoque insuficiente. Disponível: ${produtoSelecionado.quantidade_estoque}` 
      });
      return;
    }

    try {      
      await axios.post('/api/estoque/movimentacao/criar/', movimentacao);
      setMessage({ type: 'success', text: 'Movimentação registrada com sucesso!' });
      setTimeout(() => {
        navigate('/estoque');
      }, 1500);
    } catch (err) {
      console.error('Erro ao registrar movimentação de estoque:', err);
      setMessage({ 
        type: 'danger', 
        text: err.response?.data?.error || 'Erro ao registrar a movimentação de estoque.' 
      });
    }
  };

  if (loading) return <div className="text-center p-5">Carregando produtos...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Registrar Movimentação de Estoque</h1>
      </div>

      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Dados da Movimentação</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label className="required-field">Produto</Form.Label>
                  <Form.Select
                    name="produto"
                    value={movimentacao.produto}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um produto</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome} - Código: {produto.codigo} - Estoque: {produto.quantidade_estoque}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="required-field">Tipo de Movimentação</Form.Label>
                  <div className="d-flex">
                    <Form.Check
                      type="radio"
                      id="tipo-entrada"
                      name="tipo"
                      value="entrada"
                      label={<><FontAwesomeIcon icon={faArrowRight} className="text-success me-1" /> Entrada</>}
                      checked={movimentacao.tipo === 'entrada'}
                      onChange={handleChange}
                      className="me-4"
                    />
                    <Form.Check
                      type="radio"
                      id="tipo-saida"
                      name="tipo"
                      value="saida"
                      label={<><FontAwesomeIcon icon={faArrowLeft} className="text-danger me-1" /> Saída</>}
                      checked={movimentacao.tipo === 'saida'}
                      onChange={handleChange}
                    />
                  </div>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="required-field">Quantidade</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantidade"
                    value={movimentacao.quantidade}
                    onChange={handleChange}
                    required
                    min="1"
                    step="1"
                  />
                  {produtoSelecionado && movimentacao.tipo === 'saida' && (
                    <Form.Text className="text-muted">
                      Estoque atual: {produtoSelecionado.quantidade_estoque}
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Documento de Referência</Form.Label>
                  <Form.Control
                    type="text"
                    name="documento_ref"
                    value={movimentacao.documento_ref}
                    onChange={handleChange}
                    placeholder="Nota fiscal, ordem de serviço, etc."
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>Observação</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="observacao"
                    value={movimentacao.observacao}
                    onChange={handleChange}
                    placeholder="Detalhes sobre esta movimentação"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/estoque')}
              >
                <FontAwesomeIcon icon={faTimes} className="me-1" /> Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
              >
                <FontAwesomeIcon icon={faSave} className="me-1" /> Salvar
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MovimentacaoForm;