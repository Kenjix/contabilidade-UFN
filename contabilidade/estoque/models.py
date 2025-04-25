from django.db import models
from django.contrib import admin
from django.utils import timezone
from produtos.models import Produto

class MovimentacaoEstoque(models.Model):
    TIPO_CHOICES = (
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    )
    
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE, related_name='movimentacoes')
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    quantidade = models.PositiveIntegerField()
    data = models.DateTimeField(default=timezone.now)
    observacao = models.TextField(blank=True, null=True)
    
    documento_ref = models.CharField(max_length=100, blank=True, null=True, 
                                     help_text="Número da NF, pedido ou outro documento de referência")
    
    class Meta:
        ordering = ['-data']
        verbose_name = 'Movimentação de Estoque'
        verbose_name_plural = 'Movimentações de Estoque'
    
    def __str__(self):
        return f"{self.get_tipo_display()} de {self.quantidade} unidades de {self.produto.nome}"
    
    def save(self, *args, **kwargs):
        criar_nova = self.pk is None
        
        if criar_nova:
            if self.tipo == 'entrada':
                self.produto.quantidade_estoque += self.quantidade
            else:
                if self.produto.quantidade_estoque < self.quantidade:
                    raise ValueError("Quantidade insuficiente em estoque")
                self.produto.quantidade_estoque -= self.quantidade
            
            self.produto.save()
            
        super().save(*args, **kwargs)

class InventarioEstoque(models.Model):
    data_inventario = models.DateField(default=timezone.now)
    responsavel = models.CharField(max_length=100)
    observacoes = models.TextField(blank=True, null=True)
    concluido = models.BooleanField(default=False)
    
    def __str__(self):
        status = "Concluído" if self.concluido else "Em andamento"
        return f"Inventário de {self.data_inventario.strftime('%d/%m/%Y')} - {status}"
    
    class Meta:
        verbose_name = "Inventário de Estoque"
        verbose_name_plural = "Inventários de Estoque"

class ItemInventario(models.Model):
    inventario = models.ForeignKey(InventarioEstoque, on_delete=models.CASCADE, related_name='itens')
    produto = models.ForeignKey(Produto, on_delete=models.CASCADE)
    quantidade_sistema = models.PositiveIntegerField()
    quantidade_fisica = models.PositiveIntegerField()
    
    @property
    def diferenca(self):
        return self.quantidade_fisica - self.quantidade_sistema
    
    def __str__(self):
        return f"{self.produto.nome} - Diferença: {self.diferenca}"

admin.site.register(MovimentacaoEstoque)
admin.site.register(InventarioEstoque)
admin.site.register(ItemInventario)
