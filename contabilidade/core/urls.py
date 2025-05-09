from django.urls import path
from . import api

app_name = 'core'

urlpatterns = [    
    #APIs para Dashboard
    path('dashboard/', api.dashboard_api, name='dashboard_api'),
    
    #APIs de Vendas
    path('vendas/', api.vendas_api, name='vendas_api'),
    path('vendas/<int:venda_id>/', api.venda_detalhe_api, name='venda_detalhe_api'),
    path('vendas/<int:venda_id>/finalizar/', api.finalizar_venda_api, name='finalizar_venda_api'),
    path('vendas/criar/', api.venda_criar_editar_api, name='venda_criar_api'),
    path('vendas/<int:venda_id>/editar/', api.venda_criar_editar_api, name='venda_editar_api'),
    
    #APIs de Clientes
    path('clientes/', api.clientes_api, name='clientes_api'),
    path('clientes/<int:cliente_id>/', api.cliente_detalhe_api, name='cliente_detalhe_api'),
    path('clientes/criar/', api.cliente_criar_editar_api, name='cliente_criar_api'),
    path('clientes/<int:cliente_id>/editar/', api.cliente_criar_editar_api, name='cliente_editar_api'),
    path('clientes/<int:cliente_id>/deletar/', api.cliente_criar_editar_api, name='cliente_deletar_api'),
    
    #APIs de Produtos
    path('produtos/', api.produtos_api, name='produtos_api'),
    path('produtos/<int:produto_id>/', api.produto_detalhe_api, name='produto_detalhe_api'),
    path('produtos/criar/', api.produto_criar_editar_api, name='produto_criar_api'),
    path('produtos/<int:produto_id>/editar/', api.produto_criar_editar_api, name='produto_editar_api'),
    path('produtos/<int:produto_id>/deletar/', api.produto_criar_editar_api, name='produto_deletar_api'),
    
    #APIs de Estoque
    path('estoque/movimentacoes/', api.estoque_movimentacoes_api, name='estoque_movimentacoes_api'),
    path('estoque/movimentacao/criar/', api.estoque_movimentacao_criar_api, name='estoque_movimentacao_criar_api'),
]