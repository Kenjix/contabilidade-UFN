from django.shortcuts import render, get_object_or_404, redirect
from .models import ClienteFornecedor
from .forms import ClienteFornecedorForm  # vamos criar esse formulário logo abaixo

# Listar todos os clientes/fornecedores
def lista_clientes(request):
    clientes = ClienteFornecedor.objects.all()
    return render(request, 'cliente/lista_clientes.html', {'clientes': clientes})

# Cadastrar novo cliente/fornecedor
def cadastrar_cliente(request):
    if request.method == 'POST':
        form = ClienteFornecedorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lista_clientes')
    else:
        form = ClienteFornecedorForm()
    return render(request, 'cliente/cadastrar_cliente.html', {'form': form})

# Detalhes de um cliente
def detalhe_cliente(request, pk):
    cliente = get_object_or_404(ClienteFornecedor, pk=pk)
    return render(request, 'cliente/detalhe_cliente.html', {'cliente': cliente})

# Editar cliente
def editar_cliente(request, pk):
    cliente = get_object_or_404(ClienteFornecedor, pk=pk)
    if request.method == 'POST':
        form = ClienteFornecedorForm(request.POST, instance=cliente)
        if form.is_valid():
            form.save()
            return redirect('lista_clientes')
    else:
        form = ClienteFornecedorForm(instance=cliente)
    return render(request, 'cliente/cadastrar_cliente.html', {'form': form})

# Excluir cliente
def excluir_cliente(request, pk):
    cliente = get_object_or_404(ClienteFornecedor, pk=pk)
    cliente.delete()
    return redirect('lista_clientes')
