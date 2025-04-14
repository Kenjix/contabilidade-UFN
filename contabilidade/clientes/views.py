from django.shortcuts import render, redirect, get_object_or_404
from .forms import ClienteFornecedorForm
from .models import ClienteFornecedor

def lista_clientes(request):
    clientes = ClienteFornecedor.objects.all()
    return render(request, 'clientes/lista_clientes.html', {'clientes': clientes})

def cadastrar_cliente(request):
    if request.method == 'POST':        
        form = ClienteFornecedorForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('lista_clientes')
        else:
            print(form.errors)
    else:
        form = ClienteFornecedorForm()
    return render(request, 'clientes/cadastrar_cliente.html', {'form': form})

def editar_cliente(request, id):
    cliente = get_object_or_404(ClienteFornecedor, id=id)
    if request.method == 'POST':
        form = ClienteFornecedorForm(request.POST, instance=cliente)
        if form.is_valid():
            form.save()
            return redirect('lista_clientes')
    else:
        form = ClienteFornecedorForm(instance=cliente)
    return render(request, 'clientes/editar_cliente.html', {'form': form})

def detalhe_cliente(request, id):
    cliente = get_object_or_404(ClienteFornecedor, id=id)
    return render(request, 'clientes/detalhe_cliente.html', {'cliente': cliente})

def deletar_cliente(request, id):
    cliente = get_object_or_404(ClienteFornecedor, id=id)

    if request.method == 'POST':
        cliente.delete()
        return redirect('lista_clientes')

    return render(request, 'clientes/excluir_cliente.html', {'cliente': cliente})