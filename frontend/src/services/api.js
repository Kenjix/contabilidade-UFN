import axios from 'axios';

// Configuração do cliente Axios para usar o proxy
const api = axios.create();

// Função para calcular ICMS e valor líquido quando necessário
const processarDadosVendas = (response) => {
  const data = response.data;
  
  // Se for array (lista de vendas)
  if (Array.isArray(data)) {
    return {
      ...response,
      data: data.map(venda => {
        // Se ICMS ou valor líquido não estiver definido ou for zero, calcular
        if (!venda.icms_total || venda.icms_total === 0) {
          // Aplicar 17% de ICMS (taxa padrão)
          const icmsTotal = parseFloat((venda.valor_total * 0.17).toFixed(2));
          const valorLiquido = parseFloat((venda.valor_total - icmsTotal).toFixed(2));
          
          return {
            ...venda,
            icms_total: icmsTotal,
            valor_liquido: valorLiquido
          };
        }
        return venda;
      })
    };
  }
  
  // Se for objeto único (detalhes de venda)
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (!data.icms_total || data.icms_total === 0) {
      // Aplicar 17% de ICMS (taxa padrão)
      const icmsTotal = parseFloat((data.valor_total * 0.17).toFixed(2));
      const valorLiquido = parseFloat((data.valor_total - icmsTotal).toFixed(2));
      
      return {
        ...response,
        data: {
          ...data,
          icms_total: icmsTotal,
          valor_liquido: valorLiquido
        }
      };
    }
  }
  
  return response;
};

// Serviços de API para o dashboard
export const getDashboardData = () => api.get('/api/dashboard/');

// Serviços de API para vendas
export const getVendas = () => api.get('/api/vendas/').then(processarDadosVendas);
export const getVendaById = (id) => api.get(`/api/vendas/${id}/`).then(processarDadosVendas);
export const createVenda = (data) => api.post('/api/vendas/criar/', data);
export const updateVenda = (id, data) => api.post(`/api/vendas/${id}/editar/`, data);
export const finalizarVenda = (id) => api.post(`/api/vendas/${id}/finalizar/`, {});

// Serviços de API para clientes
export const getClientes = () => api.get('/api/clientes/');
export const getClienteById = (id) => api.get(`/api/clientes/${id}/`);
export const createCliente = (data) => api.post('/api/clientes/criar/', data);
export const updateCliente = (id, data) => api.post(`/api/clientes/${id}/editar/`, data);
export const deleteCliente = (id) => api.delete(`/api/clientes/${id}/deletar/`);

// Serviços de API para produtos
export const getProdutos = () => api.get('/api/produtos/');
export const getProdutoById = (id) => api.get(`/api/produtos/${id}/`);
export const createProduto = (data) => api.post('/api/produtos/criar/', data);
export const updateProduto = (id, data) => api.post(`/api/produtos/${id}/editar/`, data);
export const deleteProduto = (id) => api.delete(`/api/produtos/${id}/deletar/`);
export const getProdutoInfo = (produtoId, estadoCliente) => {
  // URL correta para a API de informações do produto para vendas
  let url = `/api/vendas/api/produto/${produtoId}/info/`;
  
  // Adicionar o estado do cliente como query parameter, se fornecido
  if (estadoCliente) {
    url += `?estado=${encodeURIComponent(estadoCliente.trim())}`;
  }
  
  console.log(`Chamando API em: ${url}`);
  return api.get(url);
};

// Serviços de API para estoque
export const getMovimentacoesEstoque = () => api.get('/api/estoque/movimentacoes/');
export const createMovimentacaoEstoque = (data) => api.post('/api/estoque/movimentacao/criar/', data);

export default api;