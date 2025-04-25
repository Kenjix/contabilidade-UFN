from django.urls import path
from . import views

app_name = 'produtos'

urlpatterns = [
    # APIs para produtos
    path('', views.lista_produtos, name='api_lista_produtos'),
    path('cadastrar/', views.cadastrar_produto, name='api_cadastrar_produto'),
    path('<int:id>/', views.detalhe_produto, name='api_detalhe_produto'),
    path('<int:id>/editar/', views.editar_produto, name='api_editar_produto'),
    path('<int:id>/deletar/', views.deletar_produto, name='api_deletar_produto'),
    path('<int:produto_id>/info/', views.get_produto_info, name='api_produto_info'),
]