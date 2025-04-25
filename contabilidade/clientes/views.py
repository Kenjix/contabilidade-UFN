from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from .forms import ClienteFornecedorForm
from .models import ClienteFornecedor

def lista_clientes(request):
    """API para listar todos os clientes"""
    if request.method == 'GET':
        clientes = ClienteFornecedor.objects.all()
        clientes_data = []
        for cliente in clientes:
            clientes_data.append({
                'id': cliente.id,
                'nome': cliente.nome,
                'tipo': cliente.tipo,
                'tipo_pessoa': cliente.tipo_pessoa,
                'cpf': cliente.cpf,
                'cnpj': cliente.cnpj,
                'cidade': cliente.cidade,
                'estado': cliente.estado,
                'criado_em': cliente.criado_em.isoformat() if cliente.criado_em else None
            })
        return JsonResponse(clientes_data, safe=False)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def cadastrar_cliente(request):
    """API para cadastrar um novo cliente"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            form = ClienteFornecedorForm(data)
            if form.is_valid():
                cliente = form.save()
                return JsonResponse({
                    'success': True,
                    'id': cliente.id,
                    'nome': cliente.nome
                })
            else:
                return JsonResponse({'error': dict(form.errors)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def editar_cliente(request, id):
    """API para editar um cliente existente"""
    cliente = get_object_or_404(ClienteFornecedor, id=id)
    
    if request.method == 'GET':
        cliente_data = {
            'id': cliente.id,
            'nome': cliente.nome,
            'tipo': cliente.tipo,
            'tipo_pessoa': cliente.tipo_pessoa,
            'cpf': cliente.cpf,
            'cnpj': cliente.cnpj,
            'cidade': cliente.cidade,
            'estado': cliente.estado,
            'criado_em': cliente.criado_em.isoformat() if cliente.criado_em else None
        }
        return JsonResponse(cliente_data)
    
    elif request.method == 'POST' or request.method == 'PUT':
        try:
            data = json.loads(request.body)            

            if data.get('tipo') == 'fornecedor':
                data['tipo_pessoa'] = 'juridica'
            
            form = ClienteFornecedorForm(data, instance=cliente)
            if form.is_valid():
                cliente = form.save()
                return JsonResponse({
                    'success': True,
                    'id': cliente.id,
                    'nome': cliente.nome
                })
            else:
                return JsonResponse({'error': dict(form.errors)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

def detalhe_cliente(request, id):
    """API para obter detalhes de um cliente"""
    cliente = get_object_or_404(ClienteFornecedor, id=id)
    cliente_data = {
        'id': cliente.id,
        'nome': cliente.nome,
        'tipo': cliente.tipo,
        'tipo_pessoa': cliente.tipo_pessoa,
        'cpf': cliente.cpf,
        'cnpj': cliente.cnpj,
        'cidade': cliente.cidade,
        'estado': cliente.estado,
        'criado_em': cliente.criado_em.isoformat() if cliente.criado_em else None
    }
    return JsonResponse(cliente_data)

@csrf_exempt
def deletar_cliente(request, id):
    """API para excluir um cliente"""
    if request.method == 'DELETE':
        cliente = get_object_or_404(ClienteFornecedor, id=id)
        cliente.delete()
        return JsonResponse({'success': True})
    elif request.method == 'POST':
        cliente = get_object_or_404(ClienteFornecedor, id=id)
        cliente.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Método não permitido'}, status=405)