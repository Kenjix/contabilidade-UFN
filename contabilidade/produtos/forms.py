from django import forms
from .models import Produto  # Certifique-se de que o modelo Produto existe em models.py

class ProdutoForm(forms.ModelForm):
    class Meta:
        model = Produto
        fields = ['nome', 'preco_compra', 'preco_venda']  # ajuste os campos conforme seu model