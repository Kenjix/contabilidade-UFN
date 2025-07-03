from rest_framework import serializers
from .models import CapitalSocial, CategoriaBem, BemPatrimonial, AquisicaoBem

class CapitalSocialSerializer(serializers.ModelSerializer):
    class Meta:
        model = CapitalSocial
        fields = '__all__'

class CategoriaBemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaBem
        fields = '__all__'

class BemPatrimonialSerializer(serializers.ModelSerializer):
    valor_atual = serializers.SerializerMethodField()
    categoria_nome = serializers.SerializerMethodField()
    
    class Meta:
        model = BemPatrimonial
        fields = '__all__'
    
    def get_valor_atual(self, obj):
        return float(obj.calcular_valor_atual())
    
    def get_categoria_nome(self, obj):
        if obj.categoria:
            return obj.categoria.nome
        return None

class AquisicaoBemSerializer(serializers.ModelSerializer):
    class Meta:
        model = AquisicaoBem
        fields = '__all__'
