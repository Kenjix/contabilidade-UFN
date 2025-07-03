from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from decimal import Decimal
from .forms import ProdutoForm
from .models import Produto
from compras.models import ItemCompraMercadoria

@csrf_exempt
def lista_produtos(request):
    """API para listar todos os produtos"""
    if request.method == 'GET':
        produtos = Produto.objects.all()
        produtos_data = []
        for produto in produtos:
            produtos_data.append({
                'id': produto.id,
                'codigo': produto.codigo,
                'nome': produto.nome,
                'preco_compra': float(produto.preco_compra),
                'preco_venda': float(produto.preco_venda),
                'quantidade_estoque': produto.quantidade_estoque,
                'categoria': produto.categoria,
                'descricao': produto.descricao,
                'fornecedor': produto.fornecedor,
                'icms': float(produto.icms) if hasattr(produto, 'icms') else 17.0,
                'criado_em': produto.criado_em.isoformat() if produto.criado_em else None
            })
        return JsonResponse(produtos_data, safe=False)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def cadastrar_produto(request):
    """API para cadastrar um novo produto"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            if 'preco_compra' in data:
                data['preco_compra'] = Decimal(str(data['preco_compra']))
            if 'preco_venda' in data:
                data['preco_venda'] = Decimal(str(data['preco_venda']))
            if 'icms' in data:
                data['icms'] = Decimal(str(data['icms']))
            
            form = ProdutoForm(data)
            if form.is_valid():
                produto = form.save()
                return JsonResponse({
                    'success': True,
                    'id': produto.id,
                    'nome': produto.nome
                })
            else:
                return JsonResponse({'error': dict(form.errors)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def editar_produto(request, id):
    """API para editar um produto existente"""
    produto = get_object_or_404(Produto, id=id)
    
    if request.method == 'GET':
        produto_data = {
            'id': produto.id,
            'codigo': produto.codigo,
            'nome': produto.nome,
            'preco_compra': float(produto.preco_compra),
            'preco_venda': float(produto.preco_venda),
            'quantidade_estoque': produto.quantidade_estoque,
            'categoria': produto.categoria,
            'descricao': produto.descricao,
            'fornecedor': produto.fornecedor,
            'icms': float(produto.icms) if hasattr(produto, 'icms') else 17.0,
            'criado_em': produto.criado_em.isoformat() if produto.criado_em else None
        }
        return JsonResponse(produto_data)
    
    elif request.method == 'POST' or request.method == 'PUT':
        try:
            data = json.loads(request.body)
            if 'preco_compra' in data:
                data['preco_compra'] = Decimal(str(data['preco_compra']))
            if 'preco_venda' in data:
                data['preco_venda'] = Decimal(str(data['preco_venda']))
            if 'icms' in data:
                data['icms'] = Decimal(str(data['icms']))
            
            form = ProdutoForm(data, instance=produto)
            if form.is_valid():
                produto = form.save()
                return JsonResponse({
                    'success': True,
                    'id': produto.id,
                    'nome': produto.nome
                })
            else:
                return JsonResponse({'error': dict(form.errors)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def detalhe_produto(request, id):
    """API para obter detalhes de um produto"""
    produto = get_object_or_404(Produto, id=id)
    produto_data = {
        'id': produto.id,
        'codigo': produto.codigo,
        'nome': produto.nome,
        'preco_compra': float(produto.preco_compra),
        'preco_venda': float(produto.preco_venda),
        'quantidade_estoque': produto.quantidade_estoque,
        'categoria': produto.categoria,
        'descricao': produto.descricao,
        'fornecedor': produto.fornecedor,
        'icms': float(produto.icms) if hasattr(produto, 'icms') else 17.0,
        'criado_em': produto.criado_em.isoformat() if produto.criado_em else None
    }
    return JsonResponse(produto_data)

@csrf_exempt
def deletar_produto(request, id):
    """API para excluir um produto"""
    if request.method == 'DELETE':
        produto = get_object_or_404(Produto, id=id)
        produto.delete()
        return JsonResponse({'success': True})
    elif request.method == 'POST':
        produto = get_object_or_404(Produto, id=id)
        produto.delete()
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Método não permitido'}, status=405)

def get_produto_info(request, produto_id):
    """API para obter informações de um produto incluindo cálculos de ICMS"""
    try:
        produto = Produto.objects.get(pk=produto_id)
        return JsonResponse({
            'preco_venda': float(produto.preco_venda),
            'quantidade_estoque': produto.quantidade_estoque,
            'icms': float(produto.icms),
            'icms_valor': float(produto.calcular_icms_debito())
        })
    except Produto.DoesNotExist:
        return JsonResponse({'error': 'Produto não encontrado'}, status=404)

@csrf_exempt
def produtos_comprados(request):
    """API para listar apenas produtos que já foram comprados em compras de mercadorias"""
    if request.method == 'GET':
        produtos_ids = ItemCompraMercadoria.objects.values_list('produto_id', flat=True).distinct()
        produtos = Produto.objects.filter(id__in=produtos_ids)
        produtos_data = []
        for produto in produtos:
            produtos_data.append({
                'id': produto.id,
                'codigo': produto.codigo,
                'nome': produto.nome,
                'preco_compra': float(produto.preco_compra),
                'preco_venda': float(produto.preco_venda),
                'quantidade_estoque': produto.quantidade_estoque,
                'categoria': produto.categoria,
                'descricao': produto.descricao,
                'fornecedor': produto.fornecedor,
                'icms': float(produto.icms) if hasattr(produto, 'icms') else 17.0,
                'criado_em': produto.criado_em.isoformat() if produto.criado_em else None
            })
        return JsonResponse(produtos_data, safe=False)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

from rest_framework import viewsets
from .serializers import ProdutoSerializer

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer

    def get_queryset(self):
        # Exibe apenas produtos que já foram comprados
        produtos_ids = ItemCompraMercadoria.objects.values_list('produto_id', flat=True).distinct()
        return Produto.objects.filter(id__in=produtos_ids)

