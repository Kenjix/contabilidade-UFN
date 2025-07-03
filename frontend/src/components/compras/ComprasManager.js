import React, { useState } from 'react';
import CompraForm from './CompraForm';
import ComprasList from './ComprasList';
import './ComprasManager.css';

export default function ComprasManager() {
  const [activeTab, setActiveTab] = useState('list');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCompraSuccess = () => {
    // Força a atualização da lista quando uma nova compra é criada
    setRefreshKey(prev => prev + 1);
    setActiveTab('list');
  };

  return (
    <div className="compras-manager">
      <div className="manager-header">
        <h2>Gestão de Compras</h2>
        <p>Gerencie as compras de mercadorias da empresa</p>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
          >
            📋 Lista de Compras
          </button>
          <button
            className={`tab ${activeTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveTab('new')}
          >
            ➕ Nova Compra
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'list' && (
            <div key={refreshKey}>
              <ComprasList />
            </div>
          )}
          {activeTab === 'new' && (
            <CompraForm onSuccess={handleCompraSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
