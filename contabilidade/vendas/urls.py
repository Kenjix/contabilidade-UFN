from django.urls import path
from . import views

app_name = 'vendas'

urlpatterns = [
    #APIs para vendas
    path('api/', views.lista_vendas, name='api_lista_vendas'),
    path('api/criar/', views.criar_venda, name='api_criar_venda'),
    path('api/<int:pk>/', views.detalhes_venda, name='api_detalhes_venda'),
    path('api/<int:pk>/finalizar/', views.finalizar_venda, name='api_finalizar_venda'),
    path('api/produto/<int:produto_id>/info/', views.get_produto_info, name='api_produto_info'),
]