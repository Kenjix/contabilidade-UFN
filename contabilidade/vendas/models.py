# vendas/models.py
from django.db import models
from clientes.models import ClienteFornecedor
from produtos.models import Produto
from django.contrib import admin

class Venda(models.Model):
    TIPO_PAGAMENTO = [
        ('avista', 'À vista'),
        ('aprazo', 'A prazo'),
    ]

    cliente = models.ForeignKey(ClienteFornecedor, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade = models.PositiveIntegerField(default=1)
    tipo_pagamento = models.CharField(max_length=10, choices=TIPO_PAGAMENTO, default='avista')
    data_venda = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Venda de {self.quantidade}x {self.produto.nome} para {self.cliente.nome}"

    def valor_total(self):
        return self.produto.preco_venda * self.quantidade

    def lucro_total(self):
        lucro_unitario = self.produto.calcular_lucro()
        return lucro_unitario * self.quantidade
admin.site.register(Venda)

