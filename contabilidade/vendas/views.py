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
                    
                    venda.atualizar_valores_calculados()
                    
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

def lista_vendas(request):
    """API para listar todas as vendas"""
    try:
        vendas = Venda.objects.all().order_by('-data_venda')
        
        vendas_data = []
        for venda in vendas:
            try:
                estado = venda.cliente.estado
                if estado:
                    print(f"Estado do cliente: {estado}")
                else:
                    print("Cliente sem estado definido, usando alíquota padrão do produto")
                    estado = ""
                
                try:
                    itens = venda.itemvenda_set.all()
                    valor_total = sum(item.quantidade * item.preco_unitario for item in itens)
                    
                    icms_total = 0
                    for item in itens:
                        if hasattr(item, 'calcular_icms'):
                            icms_total += item.calcular_icms(estado)
                        else:
                            produto_icms = item.produto.icms if hasattr(item.produto, 'icms') else 0
                            icms_total += item.quantidade * item.preco_unitario * (produto_icms / 100)
                    
                    valor_liquido = valor_total - icms_total
                    
                    valor_total = float(valor_total)
                    icms_total = float(icms_total)
                    valor_liquido = float(valor_liquido)
                    
                except Exception as calc_error:
                    print(f"Erro ao calcular valores para venda #{venda.id}: {str(calc_error)}")
                    valor_total = 0.0
                    icms_total = 0.0
                    valor_liquido = 0.0
                
                icms_total = max(0, round(icms_total, 2))
                valor_liquido = max(0, round(valor_liquido, 2))
                
                print(f"RESULTADO FINAL: Venda #{venda.id} - Valor Total: R${valor_total:.2f}, " +
                    f"ICMS Total: R${icms_total:.2f} ({"baseado no estado " + estado if estado else "alíquota produto"}), " +
                    f"Valor Líquido: R${valor_liquido:.2f}")
                
                vendas_data.append({
                    'id': venda.id,
                    'cliente': {
                        'id': venda.cliente.id,
                        'nome': venda.cliente.nome,
                        'estado': estado
                    },
                    'data_venda': venda.data_venda.isoformat(),
                    'valor_total': valor_total,
                    'icms_total': icms_total,
                    'valor_liquido': valor_liquido,
                    'status': venda.status,
                    'tipo_pagamento': venda.tipo_pagamento
                })
            except Exception as venda_error:
                print(f"Erro ao processar venda #{venda.id}: {str(venda_error)}")
                continue
        
        if vendas_data:
            print("\n--- PRIMEIRO OBJETO JSON A SER RETORNADO ---")
            import json
            print(json.dumps(vendas_data[0], indent=2))
        
        return JsonResponse(vendas_data, safe=False)
        
    except Exception as e:
        import traceback
        print(f"Erro global ao listar vendas: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({'error': f'Erro ao listar vendas: {str(e)}'}, status=500)

def detalhes_venda(request, pk):
    """API para obter detalhes de uma venda"""
    venda = get_object_or_404(Venda, pk=pk)
    itens = venda.itemvenda_set.all()
    
    estado = venda.cliente.estado
    if not estado:
        estado = ""
    
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

def get_produto_info(request, produto_id):
    """API para obter informações de um produto para uso em vendas"""
    try:
        produto = Produto.objects.get(pk=produto_id)
        
        preco_venda = float(produto.preco_venda)
        icms_aliquota = float(produto.icms)
        
        estado_cliente = request.GET.get('estado', '')
        print(f"[ICMS] Estado recebido na requisição: '{estado_cliente}'")
        
        if estado_cliente:
            estado = estado_cliente.strip().upper()
            print(f"[ICMS] Estado normalizado: '{estado}'")
            
            from produtos.utils import ICMS_ESTADUAL
            
            if estado in ICMS_ESTADUAL:
                icms_aliquota = ICMS_ESTADUAL[estado]
                print(f"[ICMS] Alíquota encontrada na tabela para {estado}: {icms_aliquota}%")
            else:
                print(f"[ICMS] Estado não encontrado na tabela, usando alíquota padrão do produto: {icms_aliquota}%")
        
        icms_valor = preco_venda * (icms_aliquota / 100)
        
        resposta = {
            'preco_venda': preco_venda,
            'quantidade_estoque': produto.quantidade_estoque,
            'icms': icms_aliquota,
            'icms_valor': icms_valor
        }
        
        print(f"[ICMS] Resposta final: {resposta}")
        
        return JsonResponse(resposta)
        
    except Exception as e:
        import traceback
        print(f"[ICMS ERROR] Erro ao processar info do produto: {str(e)}")
        print(traceback.format_exc())
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
