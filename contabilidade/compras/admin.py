from django.contrib import admin
from .models import CompraMercadoria, ItemCompraMercadoria


class ItemCompraMercadoriaInline(admin.TabularInline):
    model = ItemCompraMercadoria
    extra = 1


@admin.register(CompraMercadoria)
class CompraMercadoriaAdmin(admin.ModelAdmin):
    list_display = ['id', 'fornecedor', 'data_compra', 'valor_total', 'forma_pagamento', 'status']
    list_filter = ['forma_pagamento', 'status', 'data_compra']
    search_fields = ['fornecedor__nome', 'nota_fiscal']
    inlines = [ItemCompraMercadoriaInline]
    date_hierarchy = 'data_compra'


@admin.register(ItemCompraMercadoria)
class ItemCompraMercadoriaAdmin(admin.ModelAdmin):
    list_display = ['compra', 'produto', 'quantidade', 'preco_unitario', 'get_subtotal']
    list_filter = ['compra__status', 'produto__categoria']
    search_fields = ['produto__nome', 'compra__fornecedor__nome']
