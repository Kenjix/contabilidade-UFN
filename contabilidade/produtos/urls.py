from django.urls import path
from . import views

urlpatterns = [
    path('', views.lista_produtos, name='lista_produtos'),
    path('cadastrar/', views.cadastrar_produto, name='cadastrar_produto'),
    path('editar/<int:id>/', views.editar_produto, name='editar_produto'),
    path('excluir/<int:id>/', views.deletar_produto, name='excluir_produto'),
    path('<int:id>/', views.detalhe_produto, name='detalhe_produto'),  # Adicione essa
]