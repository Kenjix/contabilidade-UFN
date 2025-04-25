from django.urls import path
from . import views

app_name = 'estoque'

urlpatterns = [
    #APIs para movimentações de estoque
    path('api/movimentacoes/', views.lista_movimentacoes, name='api_lista_movimentacoes'),
    path('api/movimentacoes/<int:id>/', views.detalhe_movimentacao, name='api_detalhe_movimentacao'),
    path('api/movimentacoes/criar/', views.criar_movimentacao, name='api_criar_movimentacao'),
    
    #APIs para estoque
    path('api/produtos/', views.listar_estoque, name='api_listar_estoque'),
    path('api/produtos/<int:produto_id>/', views.get_produto_estoque, name='api_get_produto_estoque'),
    path('api/ajuste/', views.ajuste_estoque, name='api_ajuste_estoque'),
    
    #APIs para inventário
    path('api/inventarios/', views.lista_inventarios, name='api_lista_inventarios'),
    path('api/inventarios/iniciar/', views.iniciar_inventario, name='api_iniciar_inventario'),
    path('api/inventarios/<int:inventario_id>/', views.detalhe_inventario, name='api_detalhe_inventario'),
    path('api/inventarios/<int:inventario_id>/finalizar/', views.finalizar_inventario, name='api_finalizar_inventario'),
    path('api/inventarios/<int:inventario_id>/itens/<int:item_id>/', views.atualizar_item_inventario, name='api_atualizar_item_inventario'),
]