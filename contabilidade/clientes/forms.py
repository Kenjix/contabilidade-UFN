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
        
        #Validacao para fornecedores
        if tipo == 'fornecedor':
            if tipo_pessoa != 'juridica':
                cleaned_data['tipo_pessoa'] = 'juridica'
            
            if not cnpj:
                self.add_error('cnpj', 'Fornecedores devem ter CNPJ informado')
        
        #Validacoes gerais para tipo de pessoa
        if tipo_pessoa == 'fisica' and not cpf:
            self.add_error('cpf', 'CPF é obrigatório para pessoa física')
        
        if tipo_pessoa == 'juridica' and not cnpj:
            self.add_error('cnpj', 'CNPJ é obrigatório para pessoa jurídica')
            
        return cleaned_data