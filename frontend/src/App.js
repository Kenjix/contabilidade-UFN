import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';

import VendasList from './components/vendas/VendasList';
import VendaDetail from './components/vendas/VendaDetail';
import VendaForm from './components/vendas/VendaForm';

import ClientesList from './components/clientes/ClientesList';
import ClienteForm from './components/clientes/ClienteForm';

import ProdutosList from './components/produtos/ProdutosList';
import ProdutoForm from './components/produtos/ProdutoForm';

import ComprasManager from './components/compras/ComprasManager';

import EstoqueList from './components/estoque/EstoqueList';
import MovimentacaoForm from './components/estoque/MovimentacaoForm';

import RelatoriosList from './components/relatorios/RelatoriosList';
import BalancoPatrimonial from './components/relatorios/BalancoPatrimonial';

import PatrimonioIndex from './components/patrimonio/PatrimonioIndex';
import BensPatrimoniais from './components/patrimonio/BensPatrimoniais';
import CategoriasBens from './components/patrimonio/CategoriasBens';
import CapitalSocial from './components/patrimonio/CapitalSocial';

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <Container fluid className="main-container py-4">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            <Route path="/vendas" element={<VendasList />} />
            <Route path="/vendas/nova" element={<VendaForm />} />
            <Route path="/vendas/:id" element={<VendaDetail />} />
            <Route path="/vendas/:id/editar" element={<VendaForm />} />
            
            <Route path="/clientes" element={<ClientesList />} />
            <Route path="/clientes/novo" element={<ClienteForm />} />
            <Route path="/clientes/:id/editar" element={<ClienteForm />} />
            <Route path="/produtos" element={<ProdutosList />} />
            <Route path="/produtos/novo" element={<ProdutoForm />} />
            <Route path="/produtos/:id/editar" element={<ProdutoForm />} />
            
            <Route path="/compras" element={<ComprasManager />} />
            
            <Route path="/estoque" element={<EstoqueList />} />
            <Route path="/estoque/movimentacao" element={<MovimentacaoForm />} />
            
            <Route path="/relatorios" element={<RelatoriosList />} />
            <Route path="/relatorios/balanco-patrimonial" element={<BalancoPatrimonial />} />
            
            <Route path="/patrimonio" element={<PatrimonioIndex />} />
            <Route path="/patrimonio/bens" element={<BensPatrimoniais />} />
            <Route path="/patrimonio/categorias" element={<CategoriasBens />} />
            <Route path="/patrimonio/capital-social" element={<CapitalSocial />} />

            <Route path="*" element={<h1 className="text-center mt-5">Página não encontrada</h1>} />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;