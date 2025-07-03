from django.db import models
from django.utils import timezone
from decimal import Decimal
from clientes.models import ClienteFornecedor

class CapitalSocial(models.Model):
    """
    Modelo para registrar o capital social da empresa, o valor de abertura da empresa.
    """
    valor = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor do Capital Social")
    data_registro = models.DateField(default=timezone.now, verbose_name="Data de Registro")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    
    class Meta:
        verbose_name = "Capital Social"
        verbose_name_plural = "Capital Social"
    
    def __str__(self):
        return f"Capital Social: R$ {self.valor} (Registrado em {self.data_registro})"


class CategoriaBem(models.Model):
    """
    Categorias de bens patrimoniais como imóveis, veículos, móveis, etc.
    """
    nome = models.CharField(max_length=100, verbose_name="Nome da Categoria")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    
    class Meta:
        verbose_name = "Categoria de Bem"
        verbose_name_plural = "Categorias de Bens"
    
    def __str__(self):
        return self.nome


class BemPatrimonial(models.Model):
    """
    Modelo para bens patrimoniais da empresa (imóveis, veículos, equipamentos)
    """
    TIPO_CHOICES = (
        ('imovel', 'Imóvel'),
        ('veiculo', 'Veículo'),
        ('maquina', 'Máquina'),
        ('equipamento', 'Equipamento'),
        ('movel', 'Móvel'),
        ('utensilio', 'Utensílio'),
        ('outro', 'Outro'),
    )
    
    nome = models.CharField(max_length=100, verbose_name="Nome do Bem")
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, verbose_name="Tipo de Bem")
    categoria = models.ForeignKey(CategoriaBem, on_delete=models.SET_NULL, null=True, 
                                verbose_name="Categoria")
    descricao = models.TextField(blank=True, null=True, verbose_name="Descrição")
    valor_aquisicao = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor de Aquisição")
    data_aquisicao = models.DateField(default=timezone.now, verbose_name="Data de Aquisição")
    fornecedor = models.ForeignKey(ClienteFornecedor, on_delete=models.SET_NULL, null=True, blank=True,
                                verbose_name="Fornecedor")
    
    # Campos para depreciação
    vida_util_anos = models.PositiveIntegerField(default=5, verbose_name="Vida Útil (anos)")
    taxa_depreciacao_anual = models.DecimalField(max_digits=5, decimal_places=2, default=20.0, 
                                            verbose_name="Taxa de Depreciação Anual (%)")
    
    # Documento e localização
    numero_serie = models.CharField(max_length=100, blank=True, null=True, verbose_name="Número de Série/Identificação")
    localizacao = models.CharField(max_length=100, blank=True, null=True, verbose_name="Localização")
    
    # Status do bem
    ativo = models.BooleanField(default=True, verbose_name="Ativo")
    baixado = models.BooleanField(default=False, verbose_name="Baixado")
    data_baixa = models.DateField(blank=True, null=True, verbose_name="Data da Baixa")
    motivo_baixa = models.TextField(blank=True, null=True, verbose_name="Motivo da Baixa")
    
    # Informações de compra
    nota_fiscal = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nota Fiscal")
    forma_pagamento = models.CharField(max_length=50, blank=True, null=True, verbose_name="Forma de Pagamento")
    parcelas = models.PositiveIntegerField(default=1, verbose_name="Número de Parcelas")
    
    class Meta:
        verbose_name = "Bem Patrimonial"
        verbose_name_plural = "Bens Patrimoniais"
    
    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()}) - R$ {self.valor_aquisicao}"
    
    def calcular_valor_atual(self):
        """
        Calcula o valor atual do bem considerando a depreciação.
        """
        if self.baixado:
            return Decimal('0.00')
          # Calcula quanto tempo se passou desde a aquisição
        dias_passados = (timezone.now().date() - self.data_aquisicao).days
        anos_passados = dias_passados / 365.0
        
        # Limita a depreciação à vida útil do bem
        anos_para_calculo = min(anos_passados, self.vida_util_anos)
        
        # Calcula o valor depreciado
        taxa_decimal = Decimal(str(self.taxa_depreciacao_anual))
        valor_depreciacao = self.valor_aquisicao * (taxa_decimal / Decimal('100')) * Decimal(str(anos_para_calculo))
        
        # Valor atual é o valor de aquisição menos a depreciação
        valor_atual = self.valor_aquisicao - valor_depreciacao
        
        # O valor não pode ser negativo
        return max(valor_atual, Decimal('0.00'))


class AquisicaoBem(models.Model):
    """
    Registro de aquisições de bens patrimoniais
    """
    bem = models.ForeignKey(BemPatrimonial, on_delete=models.CASCADE, related_name='aquisicoes',
                         verbose_name="Bem Adquirido")
    data_aquisicao = models.DateField(default=timezone.now, verbose_name="Data de Aquisição")
    valor_total = models.DecimalField(max_digits=15, decimal_places=2, verbose_name="Valor Total")
    valor_entrada = models.DecimalField(max_digits=15, decimal_places=2, default=0, 
                                    verbose_name="Valor de Entrada")
    forma_pagamento = models.CharField(max_length=50, verbose_name="Forma de Pagamento")
    parcelas = models.PositiveIntegerField(default=1, verbose_name="Número de Parcelas")
    fornecedor = models.ForeignKey(ClienteFornecedor, on_delete=models.SET_NULL, null=True,
                              verbose_name="Fornecedor")
    nota_fiscal = models.CharField(max_length=50, blank=True, null=True, verbose_name="Nota Fiscal")
    observacao = models.TextField(blank=True, null=True, verbose_name="Observação")
    
    class Meta:
        verbose_name = "Aquisição de Bem"
        verbose_name_plural = "Aquisições de Bens"
    
    def __str__(self):
        return f"Aquisição de {self.bem.nome} em {self.data_aquisicao}"
