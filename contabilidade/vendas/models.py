from django.db import models
from clientes.models import ClienteFornecedor
from produtos.models import Produto
from django.contrib import admin
from utils import get_icms_por_estado
from decimal import Decimal

class Venda(models.Model):
    TIPO_PAGAMENTO = [
        ('avista', 'À vista'),
        ('aprazo', 'A prazo'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada'),
    ]

    cliente = models.ForeignKey(ClienteFornecedor, on_delete=models.CASCADE)
    tipo_pagamento = models.CharField(max_length=10, choices=TIPO_PAGAMENTO, default='avista')
    data_venda = models.DateTimeField(auto_now_add=True)
    observacao = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='pendente')

    def __str__(self):
        return f"Venda para {self.cliente.nome} em {self.data_venda.strftime('%d/%m/%Y')}"
    
    def get_icms_percentual(self):
        """
        Retorna a alíquota de ICMS aplicada com base no estado do cliente.
        """
        if self.cliente and self.cliente.estado:
            estado = self.cliente.estado.strip().upper()
            return get_icms_por_estado(estado)
        return 17.0
        

    def get_valor_total(self):
        """
        Calcula o valor total da venda dinamicamente
        """
        itens = self.itemvenda_set.all()
        return sum(item.get_subtotal() for item in itens)

    def get_icms_total(self):
        """
        Calcula o ICMS total da venda dinamicamente
        """
        itens = self.itemvenda_set.all()
        estado = self.cliente.estado if hasattr(self.cliente, 'estado') and self.cliente.estado else None
        return sum(item.calcular_icms(estado) for item in itens)

    def get_valor_liquido(self):
        """
        Calcula o valor líquido da venda dinamicamente (total - icms)
        """
        valor_total = self.get_valor_total()
        icms_total = self.get_icms_total()
        return valor_total - icms_total

    def atualizar_valores_calculados(self):
        """
        Método auxiliar para recalcular e atualizar os valores da venda.
        Este método é chamado quando a venda é criada ou finalizada.
        """
        pass
        
class ItemVenda(models.Model):
    venda = models.ForeignKey(Venda, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1)
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"
    
    def get_subtotal(self):
        return self.quantidade * self.preco_unitario
    
    def get_lucro(self):
        lucro_unitario = self.produto.calcular_lucro()
        return lucro_unitario * self.quantidade
        
    def calcular_icms(self, estado=None):
        """
        Calcula o ICMS do item de venda com base no estado do cliente ou usando o ICMS específico do produto.
        Utiliza o método calcular_icms_debito do produto, que já consulta a tabela ICMS_ESTADUAL.
        """
        icms_unitario = self.produto.calcular_icms_debito(estado)
        quantidade_decimal = Decimal(str(self.quantidade))
        return icms_unitario * quantidade_decimal

admin.site.register(Venda)
admin.site.register(ItemVenda)

