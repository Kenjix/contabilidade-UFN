from django.contrib import admin
from .models import CapitalSocial, CategoriaBem, BemPatrimonial, AquisicaoBem

@admin.register(CapitalSocial)
class CapitalSocialAdmin(admin.ModelAdmin):
    list_display = ('valor', 'data_registro')
    search_fields = ('descricao',)

@admin.register(CategoriaBem)
class CategoriaBemAdmin(admin.ModelAdmin):
    list_display = ('nome', 'descricao')
    search_fields = ('nome', 'descricao')

@admin.register(BemPatrimonial)
class BemPatrimonialAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tipo', 'categoria', 'valor_aquisicao', 'data_aquisicao', 'ativo', 'baixado')
    list_filter = ('tipo', 'categoria', 'ativo', 'baixado')
    search_fields = ('nome', 'descricao', 'numero_serie', 'nota_fiscal')
    date_hierarchy = 'data_aquisicao'
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('nome', 'tipo', 'categoria', 'descricao')
        }),
        ('Valores', {
            'fields': ('valor_aquisicao', 'data_aquisicao', 'fornecedor')
        }),
        ('Depreciação', {
            'fields': ('vida_util_anos', 'taxa_depreciacao_anual')
        }),
        ('Identificação', {
            'fields': ('numero_serie', 'localizacao')
        }),
        ('Status', {
            'fields': ('ativo', 'baixado', 'data_baixa', 'motivo_baixa')
        }),
        ('Compra', {
            'fields': ('nota_fiscal', 'forma_pagamento', 'parcelas')
        }),
    )

@admin.register(AquisicaoBem)
class AquisicaoBemAdmin(admin.ModelAdmin):
    list_display = ('bem', 'data_aquisicao', 'valor_total', 'forma_pagamento', 'parcelas', 'fornecedor')
    list_filter = ('data_aquisicao', 'forma_pagamento')
    search_fields = ('bem__nome', 'observacao', 'nota_fiscal')
    date_hierarchy = 'data_aquisicao'
