from rest_framework import viewsets
from .models import CompraMercadoria, ItemCompraMercadoria
from .serializers import CompraMercadoriaSerializer, ItemCompraMercadoriaSerializer

class CompraMercadoriaViewSet(viewsets.ModelViewSet):
    queryset = CompraMercadoria.objects.select_related('fornecedor').prefetch_related('itens__produto').all()
    serializer_class = CompraMercadoriaSerializer

class ItemCompraMercadoriaViewSet(viewsets.ModelViewSet):
    queryset = ItemCompraMercadoria.objects.select_related('produto').all()
    serializer_class = ItemCompraMercadoriaSerializer
