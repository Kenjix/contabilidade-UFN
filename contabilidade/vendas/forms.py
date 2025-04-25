from django import forms
from .models import Venda, ItemVenda
from produtos.models import Produto
from clientes.models import ClienteFornecedor

class VendaForm(forms.ModelForm):
    class Meta:
        model = Venda
        fields = ['cliente', 'tipo_pagamento', 'observacao']
        widgets = {
            'cliente': forms.Select(attrs={'class': 'form-control'}),
            'tipo_pagamento': forms.Select(attrs={'class': 'form-control'}),
            'observacao': forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        }

class ItemVendaForm(forms.ModelForm):
    class Meta:
        model = ItemVenda
        fields = ['produto', 'quantidade', 'preco_unitario']
        widgets = {
            'produto': forms.Select(attrs={'class': 'form-control produto-select'}),
            'quantidade': forms.NumberInput(attrs={'class': 'form-control quantidade-input', 'min': 1}),
            'preco_unitario': forms.NumberInput(attrs={'class': 'form-control preco-input', 'readonly': 'readonly'}),
        }

ItemVendaFormSet = forms.inlineformset_factory(
    Venda, ItemVenda, 
    form=ItemVendaForm, 
    extra=1, 
    can_delete=True,
    min_num=1,
    validate_min=True
)