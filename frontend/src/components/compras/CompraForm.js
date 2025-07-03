import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CompraForm.css';

export default function CompraForm({ onSuccess }) {
  const [fornecedores, setFornecedores] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itens, setItens] = useState([]);
  const [compra, setCompra] = useState({
    fornecedor: '',
    valor_total: '',
    valor_entrada: '',
    forma_pagamento: 'aprazo',
    parcelas: 1,
    nota_fiscal: '',
    status: 'pendente',
    observacao: '',
    itens: []
  });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('');
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fornecedoresRes, produtosRes] = await Promise.all([
          axios.get('/api/clientes/?tipo=fornecedor'),
          axios.get('/api/produtos/comprados/')
        ]);
        setFornecedores(fornecedoresRes.data);
        setProdutos(produtosRes.data);
        
        if (produtosRes.data.length === 0) {
          setMsg('Nenhum produto foi encontrado. Certifique-se de que há produtos com compras registradas.');
          setMsgType('warning');
        }
      } catch (err) {
        setMsg('Erro ao carregar dados iniciais.');
        setMsgType('error');
      }
    };
    
    fetchData();
  }, []);
  const handleAddItem = () => {
    if (produtos.length === 0) {
      setMsg('Não é possível adicionar itens. Nenhum produto comprado foi encontrado.');
      setMsgType('error');
      return;
    }
    setItens([...itens, { produto: '', quantidade: 1, preco_unitario: 0 }]);
  };

  const handleItemChange = (idx, field, value) => {
    const newItens = [...itens];
    newItens[idx][field] = value;
    
    // Se o produto foi alterado, busca informações do produto para pré-preencher preço
    if (field === 'produto' && value) {
      const produto = produtos.find(p => p.id === parseInt(value));
      if (produto && produto.preco_compra) {
        newItens[idx]['preco_unitario'] = produto.preco_compra;
      }
    }
    
    setItens(newItens);
    recalcularValorTotal(newItens);
  };

  const recalcularValorTotal = (itensArray) => {
    const total = itensArray.reduce((sum, item) => {
      return sum + (parseFloat(item.quantidade || 0) * parseFloat(item.preco_unitario || 0));
    }, 0);
    setCompra(prev => ({ ...prev, valor_total: total.toFixed(2) }));
  };
  const handleRemoveItem = idx => {
    const newItens = itens.filter((_, i) => i !== idx);
    setItens(newItens);
    recalcularValorTotal(newItens);
  };

  const handleChange = e => {
    setCompra({ ...compra, [e.target.name]: e.target.value });
  };
  const handleSubmit = async e => {
    e.preventDefault();
    
    if (itens.length === 0) {
      setMsg('Adicione pelo menos um item à compra.');
      setMsgType('error');
      return;
    }
    
    // Validar itens
    for (let i = 0; i < itens.length; i++) {
      const item = itens[i];
      if (!item.produto || !item.quantidade || !item.preco_unitario) {
        setMsg(`Item ${i + 1}: todos os campos são obrigatórios.`);
        setMsgType('error');
        return;
      }
    }
    
    setLoading(true);
    setMsg('');
    try {
      const payload = { ...compra, itens };
      await axios.post('/api/compras/compras/', payload);
      setMsg('Compra cadastrada com sucesso!');
      setMsgType('success');
      
      // Reset form
      setItens([]);
      setCompra({ 
        fornecedor: '', 
        valor_total: '', 
        valor_entrada: '', 
        forma_pagamento: 'aprazo',
        parcelas: 1,
        nota_fiscal: '', 
        status: 'pendente',
        observacao: '', 
        itens: [] 
      });
      
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Erro ao cadastrar compra:', err);
      setMsg(err.response?.data?.message || 'Erro ao cadastrar compra.');
      setMsgType('error');
    }
    setLoading(false);
  };
  return (
    <div className="compra-form-container">
      <form onSubmit={handleSubmit} className="compra-form">
        <h3>Nova Compra de Mercadoria</h3>
        
        {msg && (
          <div className={`message ${msgType}`}>
            {msg}
          </div>
        )}
        
        <div className="form-grid">
          <div className="form-group">
            <label>Fornecedor: <span className="required">*</span></label>
            <select 
              name="fornecedor" 
              value={compra.fornecedor} 
              onChange={handleChange} 
              required
              className="form-control"
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map(f => (
                <option key={f.id} value={f.id}>
                  {f.nome} - {f.cnpj || f.cpf}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Forma de Pagamento: <span className="required">*</span></label>
            <select 
              name="forma_pagamento" 
              value={compra.forma_pagamento} 
              onChange={handleChange} 
              required
              className="form-control"
            >
              <option value="aprazo">A Prazo</option>
              <option value="parcelado">Parcelado</option>
              <option value="avista">À Vista</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Valor de Entrada:</label>
            <input 
              name="valor_entrada" 
              type="number" 
              step="0.01"
              min="0"
              value={compra.valor_entrada} 
              onChange={handleChange}
              className="form-control"
              placeholder="0,00"
            />
          </div>
          
          <div className="form-group">
            <label>Número de Parcelas:</label>
            <input 
              name="parcelas" 
              type="number" 
              value={compra.parcelas} 
              onChange={handleChange} 
              min={1}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <label>Nota Fiscal:</label>
            <input 
              name="nota_fiscal" 
              value={compra.nota_fiscal} 
              onChange={handleChange}
              className="form-control"
              placeholder="Número da nota fiscal"
            />
          </div>
          
          <div className="form-group">
            <label>Valor Total:</label>
            <input 
              name="valor_total" 
              type="number" 
              step="0.01"
              min="0"
              value={compra.valor_total} 
              onChange={handleChange} 
              required
              className="form-control"
              placeholder="0,00"
              readOnly
            />
            <small>Calculado automaticamente com base nos itens</small>
          </div>
        </div>
        
        <div className="form-group full-width">
          <label>Observação:</label>
          <textarea 
            name="observacao" 
            value={compra.observacao} 
            onChange={handleChange}
            className="form-control"
            rows="3"
            placeholder="Observações sobre a compra..."
          />
        </div>
        
        <div className="items-section">
          <div className="items-header">
            <h4>Itens da Compra</h4>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="btn btn-secondary"
              disabled={produtos.length === 0}
            >
              + Adicionar Item
            </button>
          </div>
          
          {produtos.length === 0 && (
            <div className="no-products-warning">
              <p>⚠️ Nenhum produto com compras registradas foi encontrado.</p>
              <p>Para adicionar itens, primeiro é necessário ter produtos que já foram comprados anteriormente.</p>
            </div>
          )}
          
          {itens.length === 0 && produtos.length > 0 && (
            <div className="no-items-msg">
              Clique em "Adicionar Item" para começar a adicionar produtos à compra.
            </div>
          )}
          
          {itens.map((item, idx) => {
            const produto = produtos.find(p => p.id === parseInt(item.produto));
            return (
              <div key={idx} className="item-row">
                <div className="item-fields">
                  <div className="form-group">
                    <label>Produto: <span className="required">*</span></label>
                    <select 
                      value={item.produto} 
                      onChange={e => handleItemChange(idx, 'produto', e.target.value)} 
                      required
                      className="form-control"
                    >
                      <option value="">Selecione um produto</option>
                      {produtos.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.codigo} - {p.nome}
                        </option>
                      ))}
                    </select>
                    {produto && (
                      <small className="product-info">
                        Categoria: {produto.categoria} | Preço atual: R$ {produto.preco_compra}
                      </small>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Quantidade: <span className="required">*</span></label>
                    <input 
                      type="number" 
                      value={item.quantidade} 
                      min={1} 
                      onChange={e => handleItemChange(idx, 'quantidade', e.target.value)} 
                      required
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Preço Unitário: <span className="required">*</span></label>
                    <input 
                      type="number" 
                      value={item.preco_unitario} 
                      min={0} 
                      step={0.01} 
                      onChange={e => handleItemChange(idx, 'preco_unitario', e.target.value)} 
                      required
                      className="form-control"
                      placeholder="0,00"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Subtotal:</label>
                    <div className="subtotal">
                      R$ {((parseFloat(item.quantidade) || 0) * (parseFloat(item.preco_unitario) || 0)).toFixed(2)}
                    </div>
                  </div>
                </div>
                
                <button 
                  type="button" 
                  onClick={() => handleRemoveItem(idx)}
                  className="btn btn-danger remove-item"
                  title="Remover item"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={loading || itens.length === 0}
            className="btn btn-primary"
          >
            {loading ? 'Salvando...' : 'Salvar Compra'}
          </button>
        </div>
      </form>
    </div>
  );
}
