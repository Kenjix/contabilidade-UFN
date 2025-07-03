from rest_framework import routers
from .views import CompraMercadoriaViewSet, ItemCompraMercadoriaViewSet

router = routers.DefaultRouter()
router.register(r'compras', CompraMercadoriaViewSet)
router.register(r'itens-compra', ItemCompraMercadoriaViewSet)

urlpatterns = router.urls
