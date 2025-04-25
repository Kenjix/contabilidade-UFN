import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
import { getClienteById, createCliente, updateCliente } from '../../services/api';

const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [cliente, setCliente] = useState({
    nome: '',
    tipo: 'cliente',
    tipo_pessoa: 'fisica',
    cpf: '',
    cnpj: '',
    cidade: '',
    estado: ''
  });
  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchCliente = async () => {
      if (isEditMode) {
        try {
          const response = await getClienteById(id);
          setCliente(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Erro ao carregar dados do cliente:', err);
          setError('Não foi possível carregar os dados do cliente.');
          setLoading(false);
        }
      }
    };

    fetchCliente();
  }, [id, isEditMode]);

  useEffect(() => {
    if (cliente.tipo === 'fornecedor') {
      setCliente(prev => ({
        ...prev,
        tipo_pessoa: 'juridica',
        cpf: ''
      }));
    }
  }, [cliente.tipo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const clienteToSubmit = { ...cliente };
      
      if (isEditMode) {
        await updateCliente(id, clienteToSubmit);
      } else {
        await createCliente(clienteToSubmit);
      }
      
      navigate('/clientes');
    } catch (err) {
      console.error('Erro ao salvar cliente:', err);
      setMessage({ 
        type: 'danger', 
        text: err.response?.data?.error || 'Erro ao salvar o cliente. Verifique os dados informados.' 
      });
    }
  };

  if (loading) return <div className="text-center p-5">Carregando dados do cliente...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>{isEditMode ? `Editar ${cliente.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}: ${cliente.nome}` : 
          'Novo Cliente/Fornecedor'}</h1>
      </div>

      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
          {message.text}
        </Alert>
      )}

      <Card>
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Dados do {cliente.tipo === 'cliente' ? 'Cliente' : 'Fornecedor'}</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="required-field">Nome</Form.Label>
                  <Form.Control
                    type="text"
                    name="nome"
                    value={cliente.nome}
                    onChange={handleChange}
                    required
                    placeholder="Nome completo ou razão social"
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="required-field">Tipo de Cadastro</Form.Label>
                  <Form.Select 
                    name="tipo" 
                    value={cliente.tipo} 
                    onChange={handleChange}
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="fornecedor">Fornecedor</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="required-field">Tipo de Pessoa</Form.Label>
                  <Form.Select 
                    name="tipo_pessoa" 
                    value={cliente.tipo_pessoa} 
                    onChange={handleChange}
                    required
                    disabled={cliente.tipo === 'fornecedor'}
                  >
                    <option value="fisica">Pessoa Física</option>
                    <option value="juridica">Pessoa Jurídica</option>
                  </Form.Select>
                  {cliente.tipo === 'fornecedor' && (
                    <Form.Text className="text-info">
                      Fornecedores são sempre registrados como Pessoa Jurídica
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>

              {cliente.tipo_pessoa === 'fisica' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CPF</Form.Label>
                    <Form.Control
                      type="text"
                      name="cpf"
                      value={cliente.cpf || ''}
                      onChange={handleChange}
                      placeholder="CPF (apenas números)"
                      required={cliente.tipo_pessoa === 'fisica'}
                    />
                  </Form.Group>
                </Col>
              )}

              {cliente.tipo_pessoa === 'juridica' && (
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>CNPJ</Form.Label>
                    <Form.Control
                      type="text"
                      name="cnpj"
                      value={cliente.cnpj || ''}
                      onChange={handleChange}
                      placeholder="CNPJ (apenas números)"
                      required={cliente.tipo_pessoa === 'juridica'}
                    />
                  </Form.Group>
                </Col>
              )}
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cidade</Form.Label>
                  <Form.Control
                    type="text"
                    name="cidade"
                    value={cliente.cidade || ''}
                    onChange={handleChange}
                    placeholder="Nome da cidade"
                    required
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    name="estado"
                    value={cliente.estado || ''}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Selecione um estado</option>
                    <option value="AC">AC (Acre)</option>
                    <option value="AL">AL (Alagoas)</option>
                    <option value="AP">AP (Amapá)</option>
                    <option value="AM">AM (Amazonas)</option>
                    <option value="BA">BA (Bahia)</option>
                    <option value="CE">CE (Ceará)</option>
                    <option value="DF">DF (Distrito Federal)</option>
                    <option value="ES">ES (Espírito Santo)</option>
                    <option value="GO">GO (Goiás)</option>
                    <option value="MA">MA (Maranhão)</option>
                    <option value="MT">MT (Mato Grosso)</option>
                    <option value="MS">MS (Mato Grosso do Sul)</option>
                    <option value="MG">MG (Minas Gerais)</option>
                    <option value="PA">PA (Pará)</option>
                    <option value="PB">PB (Paraíba)</option>
                    <option value="PR">PR (Paraná)</option>
                    <option value="PE">PE (Pernambuco)</option>
                    <option value="PI">PI (Piauí)</option>
                    <option value="RJ">RJ (Rio de Janeiro)</option>
                    <option value="RN">RN (Rio Grande do Norte)</option>
                    <option value="RS">RS (Rio Grande do Sul)</option>
                    <option value="RO">RO (Rondônia)</option>
                    <option value="RR">RR (Roraima)</option>
                    <option value="SC">SC (Santa Catarina)</option>
                    <option value="SP">SP (São Paulo)</option>
                    <option value="SE">SE (Sergipe)</option>
                    <option value="TO">TO (Tocantins)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-3">
              <Button 
                variant="secondary" 
                className="me-2"
                onClick={() => navigate('/clientes')}
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

export default ClienteForm;