from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'patrimonio'

# Configuração do router para as ViewSets
router = DefaultRouter()
router.register(r'capital-social', views.CapitalSocialViewSet)
router.register(r'categorias-bens', views.CategoriaBemViewSet)
router.register(r'bens-patrimoniais', views.BemPatrimonialViewSet)
router.register(r'aquisicoes-bens', views.AquisicaoBemViewSet)

urlpatterns = [
    # APIs de ViewSet para CRUD
    path('api/', include(router.urls)),
    
    # API específica para o Balanço Patrimonial
    path('api/balanco-patrimonial/', views.BalancoPatrimonialAPI.as_view(), name='api_balanco_patrimonial'),
]
