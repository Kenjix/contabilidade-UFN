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
                tipo_pessoa = 'juridica'
            
            if not cnpj:
                self.add_error('cnpj', 'Fornecedores devem ter CNPJ informado')
        
        #Validacoes gerais para tipo de pessoa
        if tipo_pessoa == 'fisica':
            # Se mudou de jurídica para física, o CPF é obrigatório
            if not cpf:
                self.add_error('cpf', 'CPF é obrigatório para pessoa física')
            # Ao mudar de jurídica para física, limpar o CNPJ
            cleaned_data['cnpj'] = None
        
        if tipo_pessoa == 'juridica':
            # Se mudou de física para jurídica, o CNPJ é obrigatório
            if not cnpj:
                self.add_error('cnpj', 'CNPJ é obrigatório para pessoa jurídica')
            # Ao mudar de física para jurídica, limpar o CPF
            cleaned_data['cpf'] = None
            
        return cleaned_data