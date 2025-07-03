from rest_framework import serializers
from .models import Produto
from compras.models import ItemCompraMercadoria

class ProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Produto
        fields = '__all__'
