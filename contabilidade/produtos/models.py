from django.db import models
from django.contrib import admin
from .utils import get_icms_por_estado

class Produto(models.Model):
    codigo = models.CharField(max_length=30, blank=True, null=True, verbose_name='Código')
    nome = models.CharField(max_length=100)
    preco_compra = models.DecimalField(max_digits=10, decimal_places=2)
    preco_venda = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_estoque = models.PositiveIntegerField(default=0)
    categoria = models.CharField(max_length=50, blank=True, null=True)
    descricao = models.TextField(blank=True, null=True, verbose_name='Descrição')
    fornecedor = models.CharField(max_length=100, blank=True, null=True, verbose_name='Fornecedor')
    icms = models.DecimalField(max_digits=5, decimal_places=2, default=17.0, verbose_name='ICMS (%)')

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

    def calcular_icms_credito(self, estado=None):
        """
        Calcula o ICMS de crédito com base no estado ou usando o ICMS específico do produto.
        """
        if estado:
            icms_taxa = get_icms_por_estado(estado)
        else:
            icms_taxa = self.icms
        return self.preco_compra * (icms_taxa / 100)

    def calcular_icms_debito(self, estado=None):
        """
        Calcula o ICMS de débito com base no estado ou usando o ICMS específico do produto.
        Utiliza a tabela ICMS_ESTADUAL definida em utils.py para todos os estados.
        """
        if estado:
            estado_upper = estado.strip().upper() if estado else None
            icms_taxa = get_icms_por_estado(estado_upper)
            print(f"[ICMS DEBUG] Produto #{self.id} - Usando alíquota {icms_taxa}% para {estado_upper} conforme tabela")
        else:
            icms_taxa = self.icms
            
        return self.preco_venda * (icms_taxa / 100)

    def calcular_custo(self, estado=None):
        """
        Custo real com base no preço de compra e ICMS crédito.
        """
        credito_icms = self.calcular_icms_credito(estado)
        return self.preco_compra - credito_icms

    def calcular_lucro(self, estado=None):
        """
        Lucro bruto baseado no custo real e ICMS débito.
        """
        custo_real = self.calcular_custo(estado)
        lucro_bruto = self.preco_venda - custo_real
        debito_icms = self.calcular_icms_debito(estado)
        return lucro_bruto - debito_icms    
    
admin.site.register(Produto)
