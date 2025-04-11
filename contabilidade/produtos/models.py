# produtos/models.py
from django.db import models
from django.contrib import admin
from .utils import get_icms_por_estado

class Produto(models.Model):
    nome = models.CharField(max_length=100)
    preco_compra = models.DecimalField(max_digits=10, decimal_places=2)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

    def calcular_icms_credito(self, estado):
        """
        Calcula o ICMS de crédito com base no estado.
        """
        icms = get_icms_por_estado(estado)
        return self.preco_compra * (icms / 100)

    def calcular_icms_debito(self, estado):
        """
        Calcula o ICMS de débito com base no estado.
        """
        icms = get_icms_por_estado(estado)
        return self.preco_venda * (icms / 100)

    def calcular_custo(self, estado):
        """
        Custo real com base no preço de compra e ICMS crédito.
        """
        credito_icms = self.calcular_icms_credito(estado)
        return self.preco_compra - credito_icms

    def calcular_lucro(self, estado):
        """
        Lucro bruto baseado no custo real e ICMS débito.
        """
        custo_real = self.calcular_custo(estado)
        lucro_bruto = self.preco_venda - custo_real
        debito_icms = self.calcular_icms_debito(estado)
        return lucro_bruto - debito_icms    
    
admin.site.register(Produto)
