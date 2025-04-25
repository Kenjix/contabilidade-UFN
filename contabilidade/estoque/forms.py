from django import forms
from .models import MovimentacaoEstoque, InventarioEstoque, ItemInventario
from produtos.models import Produto

class MovimentacaoEstoqueForm(forms.ModelForm):
    class Meta:
        model = MovimentacaoEstoque
        fields = ['produto', 'tipo', 'quantidade', 'observacao', 'documento_ref']
        widgets = {
            'produto': forms.Select(attrs={'class': 'form-select'}),
            'tipo': forms.Select(attrs={'class': 'form-select'}),
            'quantidade': forms.NumberInput(attrs={'class': 'form-control', 'min': '1'}),
            'observacao': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
            'documento_ref': forms.TextInput(attrs={'class': 'form-control'}),
        }

class InventarioEstoqueForm(forms.ModelForm):
    class Meta:
        model = InventarioEstoque
        fields = ['data_inventario', 'responsavel', 'observacoes']
        widgets = {
            'data_inventario': forms.DateInput(attrs={'class': 'form-control', 'type': 'date'}),
            'responsavel': forms.TextInput(attrs={'class': 'form-control'}),
            'observacoes': forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
        }

class ItemInventarioForm(forms.ModelForm):
    class Meta:
        model = ItemInventario
        fields = ['produto', 'quantidade_fisica']
        widgets = {
            'produto': forms.Select(attrs={'class': 'form-select', 'readonly': 'readonly'}),
            'quantidade_fisica': forms.NumberInput(attrs={'class': 'form-control', 'min': '0'}),
        }

ItemInventarioFormSet = forms.inlineformset_factory(
    InventarioEstoque, 
    ItemInventario,
    form=ItemInventarioForm,
    extra=0,
    can_delete=False
)

class AjusteEstoqueForm(forms.Form):
    """Formulário para ajuste manual de estoque"""
    produto = forms.ModelChoiceField(
        queryset=Produto.objects.all(),
        widget=forms.Select(attrs={'class': 'form-select'})
    )
    quantidade_atual = forms.IntegerField(
        widget=forms.NumberInput(attrs={'class': 'form-control', 'readonly': 'readonly'})
    )
    nova_quantidade = forms.IntegerField(
        widget=forms.NumberInput(attrs={'class': 'form-control', 'min': '0'})
    )
    motivo = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': '3'}),
        required=True
    )
    
    def clean(self):
        cleaned_data = super().clean()
        nova_quantidade = cleaned_data.get('nova_quantidade')
        
        if nova_quantidade is not None and nova_quantidade < 0:
            self.add_error('nova_quantidade', 'A quantidade não pode ser negativa')
            
        return cleaned_data