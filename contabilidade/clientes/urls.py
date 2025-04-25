from django.urls import path
from . import views

app_name = 'clientes'

urlpatterns = [
    # APIs para clientes e fornecedores
    path('api/', views.lista_clientes, name='api_lista_clientes'),
    path('api/cadastrar/', views.cadastrar_cliente, name='api_cadastrar_cliente'),
    path('api/<int:id>/', views.detalhe_cliente, name='api_detalhe_cliente'),
    path('api/<int:id>/editar/', views.editar_cliente, name='api_editar_cliente'),
    path('api/<int:id>/deletar/', views.deletar_cliente, name='api_deletar_cliente'),
]