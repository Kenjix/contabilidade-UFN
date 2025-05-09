import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Badge, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const ProdutosList = () => {
  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('/api/produtos/');
        setProdutos(response.data);
        setFilteredProdutos(response.data);
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
    if (searchTerm.trim() === '') {
      setFilteredProdutos(produtos);
    } else {
      const filtered = produtos.filter(produto => 
        produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.categoria?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProdutos(filtered);
    }
  }, [searchTerm, produtos]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      await axios.delete(`/api/produtos/${id}/`);
      setProdutos(produtos.filter(produto => produto.id !== id));
      setFilteredProdutos(filteredProdutos.filter(produto => produto.id !== id));
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir produto. Pode haver movimentações de estoque associadas a este produto.');
    }
  };

  const getEstoqueBadge = (quantidade) => {
    if (quantidade <= 0) {
      return <Badge bg="danger">Esgotado</Badge>;
    } else if (quantidade <= 5) {
      return <Badge bg="warning" text="dark">Baixo</Badge>;
    } else {
      return <Badge bg="success">Normal</Badge>;
    }
  };

  if (loading) return <div className="text-center p-5">Carregando produtos...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  const produtosBaixoEstoque = produtos.filter(produto => produto.quantidade_estoque <= 5).length;

  return (
    <div>
      <div className="page-header">
        <h1>Produtos</h1>
        <Link to="/produtos/novo" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Novo Produto
        </Link>
      </div>

      {produtosBaixoEstoque > 0 && (
        <div className="alert alert-warning">
          <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />
          <strong>{produtosBaixoEstoque} produto(s)</strong> com estoque baixo ou esgotado.
        </div>
      )}

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Lista de Produtos</h5>
            <InputGroup className="w-50">
              <Form.Control
                placeholder="Buscar produtos..."
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
          {filteredProdutos.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">
                {searchTerm ? 'Nenhum produto encontrado com os critérios de busca.' : 'Nenhum produto cadastrado.'}
              </p>
              {!searchTerm && (
                <Link to="/produtos/novo" className="btn btn-primary">Cadastrar Novo Produto</Link>
              )}
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th className="text-end">Preço de Compra</th>
                  <th className="text-end">Preço de Venda</th>
                  <th className="text-center">ICMS (%)</th>
                  <th className="text-center">Estoque</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredProdutos.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.codigo}</td>
                    <td>{produto.nome}</td>
                    <td>{produto.categoria || '—'}</td>
                    <td className="text-end">R$ {parseFloat(produto.preco_compra).toFixed(2)}</td>
                    <td className="text-end">R$ {parseFloat(produto.preco_venda).toFixed(2)}</td>
                    <td className="text-center">{parseFloat(produto.icms).toFixed(1)}%</td>
                    <td className="text-center">{produto.quantidade_estoque}</td>
                    <td className="text-center">{getEstoqueBadge(produto.quantidade_estoque)}</td>
                    <td className="text-center">
                      <Link to={`/produtos/${produto.id}/editar`} className="btn btn-sm btn-warning me-2">
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(produto.id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
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

export default ProdutosList;