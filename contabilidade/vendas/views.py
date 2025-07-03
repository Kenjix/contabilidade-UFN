from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from decimal import Decimal
from .forms import VendaForm, ItemVendaFormSet
from .models import Venda, ItemVenda
from produtos.models import Produto
from estoque.models import MovimentacaoEstoque
from django.db import transaction
from django.conf import settings
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils import ICMS_ESTADUAL

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

@csrf_exempt
def criar_venda(request):
    """API para criar uma nova venda"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            venda_data = {
                'cliente': data.get('cliente'),
                'tipo_pagamento': data.get('tipo_pagamento'),
                'observacao': data.get('observacao', '')
            }
            itens_data = data.get('itens', [])
            
            with transaction.atomic():
                form = VendaForm(venda_data)
                if form.is_valid():
                    venda = form.save()
                    
                    for item_data in itens_data:
                        produto_id = item_data.get('produto')
                        quantidade = item_data.get('quantidade')
                        preco_unitario = Decimal(str(item_data.get('preco_unitario')))
                        
                        produto = Produto.objects.get(id=produto_id)
                        
                        if produto.quantidade_estoque < quantidade:
                            raise ValueError(f'Estoque insuficiente para o produto {produto.nome}. Disponível: {produto.quantidade_estoque}')
                        
                        item = ItemVenda(
                            venda=venda,
                            produto=produto,
                            quantidade=quantidade,
                            preco_unitario=preco_unitario
                        )
                        item.save()
                        
                        MovimentacaoEstoque.objects.create(
                            produto=produto,
                            tipo='saida',
                            quantidade=quantidade,
                            observacao=f"Saída por venda #{venda.id}",
                            documento_ref=f"Venda #{venda.id}"
                        )
                    
                    return JsonResponse({
                        'success': True,
                        'id': venda.id,
                        'message': 'Venda registrada com sucesso!'
                    })
                else:
                    return JsonResponse({'error': dict(form.errors)}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def lista_vendas(request):
    """API para listar todas as vendas"""
    try:
        vendas = Venda.objects.all().order_by('-data_venda')
        
        vendas_data = []
        for venda in vendas:
            try:
                estado = venda.cliente.estado if venda.cliente.estado else ""
                
                itens = venda.itemvenda_set.all()
                valor_total = sum(item.quantidade * item.preco_unitario for item in itens)
                
                # Calcula ICMS total baseado no estado do cliente
                icms_total = 0
                for item in itens:
                    if hasattr(item, 'calcular_icms'):
                        icms_total += item.calcular_icms(estado)
                    else:
                        produto_icms = item.produto.icms if hasattr(item.produto, 'icms') else 0
                        icms_total += item.quantidade * item.preco_unitario * (produto_icms / 100)
                
                valor_liquido = valor_total - icms_total
                
                vendas_data.append({
                    'id': venda.id,
                    'cliente': {
                        'id': venda.cliente.id,
                        'nome': venda.cliente.nome,
                        'estado': estado
                    },
                    'data_venda': venda.data_venda.isoformat(),
                    'valor_total': float(valor_total),
                    'icms_total': float(max(0, round(icms_total, 2))),
                    'valor_liquido': float(max(0, round(valor_liquido, 2))),
                    'status': venda.status,
                    'tipo_pagamento': venda.tipo_pagamento
                })
            except Exception:
                continue
        
        return JsonResponse(vendas_data, safe=False)
        
    except Exception as e:
        return JsonResponse({'error': f'Erro ao listar vendas: {str(e)}'}, status=500)

@csrf_exempt
def detalhes_venda(request, pk):
    """API para obter detalhes de uma venda"""
    venda = get_object_or_404(Venda, pk=pk)
    itens = venda.itemvenda_set.all()
    
    estado = venda.cliente.estado if venda.cliente.estado else ""
    
    itens_data = []
    for item in itens:
        icms = item.calcular_icms(estado)
        subtotal = item.quantidade * item.preco_unitario
        
        icms_percentual = 0
        if subtotal > 0:
            icms_percentual = (icms / subtotal) * 100
        
        itens_data.append({
            'id': item.id,
            'produto': {
                'id': item.produto.id,
                'nome': item.produto.nome,
                'icms': float(item.produto.icms)
            },
            'quantidade': item.quantidade,
            'preco_unitario': float(item.preco_unitario),
            'subtotal': float(subtotal),
            'icms': float(icms),
            'icms_percentual': float(icms_percentual)
        })
    
    valor_total = float(venda.get_valor_total())
    icms_total = float(venda.get_icms_total())
    valor_liquido = float(venda.get_valor_liquido())
    
    icms_percentual_total = 0
    if valor_total > 0:
        icms_percentual_total = (icms_total / valor_total) * 100
    
    venda_data = {
        'id': venda.id,
        'cliente': {
            'id': venda.cliente.id,
            'nome': venda.cliente.nome,
            'estado': estado
        },
        'data_venda': venda.data_venda.isoformat(),
        'valor_total': valor_total,
        'icms_total': icms_total,
        'icms_percentual': float(icms_percentual_total),
        'valor_liquido': valor_liquido,
        'status': venda.status,
        'tipo_pagamento': venda.tipo_pagamento,
        'observacao': venda.observacao,
        'itens': itens_data
    }
    
    return JsonResponse(venda_data)

@csrf_exempt
def get_produto_info(request, produto_id):
    """API para obter informações de um produto para uso em vendas"""
    try:
        produto = Produto.objects.get(pk=produto_id)
        
        preco_venda = float(produto.preco_venda)
        icms_aliquota = float(produto.icms)
        
        estado_cliente = request.GET.get('estado', '')
        
        # Calcula ICMS baseado no estado do cliente
        if estado_cliente:
            estado = estado_cliente.strip().upper()
            if estado in ICMS_ESTADUAL:
                icms_aliquota = ICMS_ESTADUAL[estado]
        
        icms_valor = preco_venda * (icms_aliquota / 100)
        
        resposta = {
            'preco_venda': preco_venda,
            'quantidade_estoque': produto.quantidade_estoque,
            'icms': icms_aliquota,
            'icms_valor': icms_valor
        }
        
        return JsonResponse(resposta)
        
    except Exception as e:
        return JsonResponse({'error': f'Erro ao processar informações do produto: {str(e)}'}, status=500)

@csrf_exempt
def finalizar_venda(request, pk):
    """API para finalizar uma venda"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    
    try:
        venda = Venda.objects.get(pk=pk)
    except Venda.DoesNotExist:
        return JsonResponse({'error': f'Venda #{pk} não encontrada'}, status=404)

    try:
        if venda.status == 'finalizada':
            return JsonResponse({
                'success': True,
                'id': venda.id,
                'status': 'finalizada',
                'message': f'Venda #{venda.id} já estava finalizada'
            })

        venda.status = 'finalizada'
        venda.save()

        return JsonResponse({
            'success': True,
            'id': venda.id,
            'status': 'finalizada',
            'message': f'Venda #{venda.id} finalizada com sucesso!'
        })
    except Exception as e:
        return JsonResponse({'error': f'Erro ao finalizar venda: {str(e)}'}, status=400)
