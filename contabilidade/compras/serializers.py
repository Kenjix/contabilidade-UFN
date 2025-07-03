from rest_framework import serializers
from .models import CompraMercadoria, ItemCompraMercadoria
from produtos.models import Produto

class ItemCompraMercadoriaSerializer(serializers.ModelSerializer):
    produto_nome = serializers.CharField(source='produto.nome', read_only=True)
    class Meta:
        model = ItemCompraMercadoria
        fields = ['id', 'produto', 'produto_nome', 'quantidade', 'preco_unitario', 'get_subtotal']
        read_only_fields = ['get_subtotal']

class CompraMercadoriaSerializer(serializers.ModelSerializer):
    itens = ItemCompraMercadoriaSerializer(many=True)
    fornecedor_nome = serializers.CharField(source='fornecedor.nome', read_only=True)
    class Meta:
        model = CompraMercadoria
        fields = ['id', 'fornecedor', 'fornecedor_nome', 'data_compra', 'valor_total', 'valor_entrada', 'forma_pagamento', 'parcelas', 'nota_fiscal', 'status', 'observacao', 'itens']

    def create(self, validated_data):
        itens_data = validated_data.pop('itens')
        compra = CompraMercadoria.objects.create(**validated_data)
        for item in itens_data:
            ItemCompraMercadoria.objects.create(compra=compra, **item)
        return compra

    def update(self, instance, validated_data):
        itens_data = validated_data.pop('itens', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if itens_data is not None:
            instance.itens.all().delete()
            for item in itens_data:
                ItemCompraMercadoria.objects.create(compra=instance, **item)
        return instance
