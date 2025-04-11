from django.urls import path
from . import views

urlpatterns = [
    path('', views.lista_clientes, name='lista_clientes'),
    path('cadastrar/', views.cadastrar_cliente, name='cadastrar_cliente'),
]