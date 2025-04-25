from django.db import models
from django.contrib import admin
from django.core.exceptions import ValidationError

class ClienteFornecedor(models.Model):
    TIPO_CLI_FORNECEDOR = [
        ('cliente', 'Cliente'),
        ('fornecedor', 'Fornecedor'),        
    ]
    
    TIPO_PESSOA = [
        ('fisica', 'Pessoa Física'),
        ('juridica', 'Pessoa Jurídica'),
    ]

    tipo = models.CharField(max_length=20, choices=TIPO_CLI_FORNECEDOR, default='cliente')
    tipo_pessoa = models.CharField(max_length=10, choices=TIPO_PESSOA, default='fisica')
    nome = models.CharField(max_length=100)
    cpf = models.CharField(max_length=14, blank=True, null=True)
    cnpj = models.CharField(max_length=18, blank=True, null=True)
    cidade = models.CharField(max_length=50)
    estado = models.CharField(max_length=2)
    criado_em = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.nome} ({self.get_tipo_display()})"
    
    @property
    def cpf_cnpj(self):
        return self.cpf if self.tipo_pessoa == 'fisica' else self.cnpj
    
    def clean(self):        
        if not self.cpf and not self.cnpj:
            raise ValidationError('É necessário informar um CPF ou CNPJ')       
        
        if self.tipo_pessoa == 'fisica' and self.cnpj:
            raise ValidationError('Pessoas físicas devem ter apenas CPF')
        if self.tipo_pessoa == 'juridica' and self.cpf:
            raise ValidationError('Pessoas jurídicas devem ter apenas CNPJ')        

admin.site.register(ClienteFornecedor)