import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Table, Button, Card, Badge, Form, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import { getClientes, deleteCliente } from '../../services/api';

const ClientesList = () => {
  const [clientes, setClientes] = useState([]);
  const [filteredClientes, setFilteredClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await getClientes();
        setClientes(response.data);
        setFilteredClientes(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar clientes:', err);
        setError('Não foi possível carregar a lista de clientes.');
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClientes(clientes);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = clientes.filter(cliente => 
        (cliente.nome?.toLowerCase() || '').includes(searchTermLower) ||
        (cliente.cpf?.toLowerCase() || '').includes(searchTermLower) ||
        (cliente.cnpj?.toLowerCase() || '').includes(searchTermLower) ||
        (cliente.cidade?.toLowerCase() || '').includes(searchTermLower)
      );
      setFilteredClientes(filtered);
    }
  }, [searchTerm, clientes]);

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este cliente?')) {
      return;
    }

    try {
      await deleteCliente(id);
      setClientes(clientes.filter(cliente => cliente.id !== id));
      setFilteredClientes(filteredClientes.filter(cliente => cliente.id !== id));
    } catch (err) {
      console.error('Erro ao excluir cliente:', err);
      alert('Erro ao excluir cliente. Pode haver vendas associadas a este cliente.');
    }
  };

  const getTipoCadastroBadge = (tipo) => {
    switch (tipo) {
      case 'cliente':
        return <Badge bg="success">Cliente</Badge>;
      case 'fornecedor':
        return <Badge bg="secondary">Fornecedor</Badge>;
      default:
        return <Badge bg="info">{tipo}</Badge>;
    }
  };

  const getTipoPessoaBadge = (tipoPessoa) => {
    switch (tipoPessoa) {
      case 'fisica':
        return <Badge bg="info">Pessoa Física</Badge>;
      case 'juridica':
        return <Badge bg="primary">Pessoa Jurídica</Badge>;
      default:
        return <Badge bg="light" text="dark">{tipoPessoa}</Badge>;
    }
  };

  if (loading) return <div className="text-center p-5">Carregando clientes...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Clientes/Fornecedores</h1>
        <Link to="/clientes/novo" className="btn btn-primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Novo Cadastro
        </Link>
      </div>

      <Card className="mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Lista de Clientes e Fornecedores</h5>
            <InputGroup className="w-50">
              <Form.Control
                placeholder="Buscar por nome, CPF, CNPJ ou cidade..."
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
          {filteredClientes.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-muted">
                {searchTerm ? 'Nenhum registro encontrado com os critérios de busca.' : 'Nenhum cliente ou fornecedor cadastrado.'}
              </p>
              {!searchTerm && (
                <Link to="/clientes/novo" className="btn btn-primary">Cadastrar Novo</Link>
              )}
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Pessoa</th>
                  <th>CPF/CNPJ</th>
                  <th>Cidade/UF</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td>{cliente.id}</td>
                    <td>{cliente.nome}</td>
                    <td>{getTipoCadastroBadge(cliente.tipo)}</td>
                    <td>{getTipoPessoaBadge(cliente.tipo_pessoa)}</td>
                    <td>
                      {cliente.tipo_pessoa === 'fisica' 
                        ? cliente.cpf || '—'
                        : cliente.cnpj || '—'
                      }
                    </td>
                    <td>{cliente.cidade || '—'}/{cliente.estado || '—'}</td>
                    <td className="text-center">
                      <Link to={`/clientes/${cliente.id}/editar`} className="btn btn-sm btn-warning me-2">
                        <FontAwesomeIcon icon={faEdit} />
                      </Link>
                      <Button 
                        variant="danger" 
                        size="sm" 
                        onClick={() => handleDelete(cliente.id)}
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

export default ClientesList;