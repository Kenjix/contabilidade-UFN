from django import forms
from clientes.models import ClienteFornecedor

class ClienteFornecedorForm(forms.ModelForm):
    class Meta:
        model = ClienteFornecedor
        fields = ['nome', 'tipo', 'tipo_pessoa', 'cpf', 'cnpj', 'cidade', 'estado']
    
    def clean(self):
        cleaned_data = super().clean()
        tipo_pessoa = cleaned_data.get('tipo_pessoa')
        cpf = cleaned_data.get('cpf')
        cnpj = cleaned_data.get('cnpj')
        tipo = cleaned_data.get('tipo')

        if tipo == 'fornecedor':
            if tipo_pessoa != 'juridica':
                cleaned_data['tipo_pessoa'] = 'juridica'
                tipo_pessoa = 'juridica'
            
            if not cnpj:
                self.add_error('cnpj', 'Fornecedores devem ter CNPJ informado')

        if tipo_pessoa == 'fisica':
            if not cpf:
                self.add_error('cpf', 'CPF é obrigatório para pessoa física')
            cleaned_data['cnpj'] = None
        
        if tipo_pessoa == 'juridica':
            if not cnpj:
                self.add_error('cnpj', 'CNPJ é obrigatório para pessoa jurídica')
            cleaned_data['cpf'] = None
            
        return cleaned_data