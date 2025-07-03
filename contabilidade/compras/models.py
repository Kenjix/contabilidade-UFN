from django.db import models
from django.utils import timezone
from decimal import Decimal
from clientes.models import ClienteFornecedor
from produtos.models import Produto


class CompraMercadoria(models.Model):
    """
    Modelo para registrar compras de mercadorias de fornecedores
    """
    FORMA_PAGAMENTO_CHOICES = [
        ('avista', 'À Vista'),
        ('aprazo', 'A Prazo'),
        ('parcelado', 'Parcelado'),
    ]
    
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('finalizada', 'Finalizada'),
        ('cancelada', 'Cancelada'),
    ]

    fornecedor = models.ForeignKey(
        ClienteFornecedor, 
        on_delete=models.CASCADE,
        limit_choices_to={'tipo': 'fornecedor'},
        verbose_name="Fornecedor"
    )
    data_compra = models.DateField(default=timezone.now, verbose_name="Data da Compra")
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor Total")
    valor_entrada = models.DecimalField(
        max_digits=15, 
        decimal_places=2, 
        default=0,
        verbose_name="Valor de Entrada"
    )
    forma_pagamento = models.CharField(
        max_length=20, 
        choices=FORMA_PAGAMENTO_CHOICES, 
        default='avista',
        verbose_name="Forma de Pagamento"
    )
    parcelas = models.PositiveIntegerField(default=1, verbose_name="Número de Parcelas")
    nota_fiscal = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nota Fiscal")
    status = models.CharField(
        max_length=15, 
        choices=STATUS_CHOICES, 
        default='pendente',
        verbose_name="Status"
    )
    observacao = models.TextField(blank=True, null=True, verbose_name="Observação")
    
    class Meta:
        verbose_name = "Compra de Mercadoria"
        verbose_name_plural = "Compras de Mercadorias"
        ordering = ['-data_compra']
    
    def __str__(self):
        return f"Compra #{self.id} - {self.fornecedor.nome} - R$ {self.valor_total}"
    
    def get_valor_pendente(self):
        """Calcula o valor ainda não pago (para compras a prazo)"""
        if self.forma_pagamento == 'avista':
            return Decimal('0.00')
        return self.valor_total - self.valor_entrada


class ItemCompraMercadoria(models.Model):
    """
    Itens de uma compra de mercadoria
    """
    compra = models.ForeignKey(
        CompraMercadoria, 
        on_delete=models.CASCADE, 
        related_name='itens',
        verbose_name="Compra"
    )
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, verbose_name="Produto")
    quantidade = models.PositiveIntegerField(verbose_name="Quantidade")
    preco_unitario = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="Preço Unitário")
    
    class Meta:
        verbose_name = "Item da Compra"
        verbose_name_plural = "Itens da Compra"
    
    def __str__(self):
        return f"{self.quantidade}x {self.produto.nome}"
    
    def get_subtotal(self):
        return self.quantidade * self.preco_unitario
