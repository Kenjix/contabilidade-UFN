from django import forms
from .models import ClienteFornecedor

class ClienteFornecedorForm(forms.ModelForm):
    class Meta:
        model = ClienteFornecedor
        fields = ['nome', 'cpf_cnpj', 'cidade', 'estado', 'tipo']  # ou os campos que você definiu
