# clientes/models.py
from django.db import models
from django.contrib import admin

class ClienteFornecedor(models.Model):
    TIPO_CLI_FORNECEDOR = [
        ('cliente', 'Cliente'),
        ('fornecedor', 'Fornecedor'),
        ('ambos', 'Cliente e Fornecedor'),
    ]

    tipo = models.CharField(
        max_length=20,
        choices=TIPO_CLI_FORNECEDOR,
        default='cliente',
    )
    nome = models.CharField(max_length=100)
    cpf_cnpj = models.CharField(max_length=18, unique=True)
    cidade = models.CharField(max_length=50)
    estado = models.CharField(max_length=2)

    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
            return f"{self.nome} ({self.get_tipo_display()})"
    
# Register the model in the admin site
admin.site.register(ClienteFornecedor)