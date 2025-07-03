import axios from 'axios';

// Serviços para Capital Social
export const getCapitalSocial = () => {
  return axios.get(`/api/patrimonio/api/capital-social/`);
};

export const createCapitalSocial = (data) => {
  return axios.post(`/api/patrimonio/api/capital-social/`, data);
};

// Serviços para Categorias de Bens
export const getCategoriasBens = () => {
  return axios.get(`/api/patrimonio/api/categorias-bens/`);
};

export const getCategoriaBem = (id) => {
  return axios.get(`/api/patrimonio/api/categorias-bens/${id}/`);
};

export const createCategoriaBem = (data) => {
  return axios.post(`/api/patrimonio/api/categorias-bens/`, data);
};

export const updateCategoriaBem = (id, data) => {
  return axios.put(`/api/patrimonio/api/categorias-bens/${id}/`, data);
};

export const deleteCategoriaBem = (id) => {
  return axios.delete(`/api/patrimonio/api/categorias-bens/${id}/`);
};

// Serviços para Bens Patrimoniais
export const getBensPatrimoniais = (filters = {}) => {
  let url = `/api/patrimonio/api/bens-patrimoniais/`;
  
  // Adiciona filtros se existirem
  const params = new URLSearchParams();
  
  if (filters.categoria) params.append('categoria', filters.categoria);
  if (filters.tipo) params.append('tipo', filters.tipo);
  if (filters.ativo !== undefined) params.append('ativo', filters.ativo);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  return axios.get(url);
};

export const getBemPatrimonial = (id) => {
  return axios.get(`/api/patrimonio/api/bens-patrimoniais/${id}/`);
};

export const createBemPatrimonial = (data) => {
  return axios.post(`/api/patrimonio/api/bens-patrimoniais/`, data);
};

export const updateBemPatrimonial = (id, data) => {
  return axios.put(`/api/patrimonio/api/bens-patrimoniais/${id}/`, data);
};

export const deleteBemPatrimonial = (id) => {
  return axios.delete(`/api/patrimonio/api/bens-patrimoniais/${id}/`);
};

// Serviços para Aquisição de Bens
export const getAquisicoesBens = () => {
  return axios.get(`/api/patrimonio/api/aquisicoes-bens/`);
};

export const createAquisicaoBem = (data) => {
  return axios.post(`/api/patrimonio/api/aquisicoes-bens/`, data);
};

// Serviço para Balanço Patrimonial
export const getBalancoPatrimonial = () => {
  return axios.get(`/api/patrimonio/api/balanco-patrimonial/`);
};
