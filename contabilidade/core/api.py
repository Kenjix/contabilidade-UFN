from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from vendas.models import Venda, ItemVenda
from clientes.models import ClienteFornecedor
from produtos.models import Produto
from estoque.models import MovimentacaoEstoque
import json
from decimal import Decimal

@csrf_exempt
def dashboard_api(request):
    """API para os dados do dashboard"""
    total_vendas = Venda.objects.count()
    
    total_clientes = ClienteFornecedor.objects.filter(tipo='cliente').count()
    
    total_produtos = Produto.objects.count()
    
    valor_total_vendas = sum(venda.get_valor_total() for venda in Venda.objects.all())
    
    vendas_recentes_query = Venda.objects.order_by('-data_venda')[:5]
    vendas_recentes = []
    for venda in vendas_recentes_query:
        vendas_recentes.append({
            'id': venda.id,
            'cliente__nome': venda.cliente.nome,
            'data_venda': venda.data_venda,
            'valor_total': venda.get_valor_total(),
            'status': venda.status
        })
    
    produtos_baixo_estoque = list(Produto.objects.filter(quantidade_estoque__lte=5).values(
        'id', 'nome', 'quantidade_estoque', 'preco_venda'
    ))
    
    data = {
        'totalVendas': total_vendas,
        'totalClientes': total_clientes,
        'totalProdutos': total_produtos,
        'valorTotalVendas': float(valor_total_vendas),
        'vendasRecentes': vendas_recentes,
        'produtosBaixoEstoque': produtos_baixo_estoque
    }
    
    return JsonResponse(data)

@csrf_exempt
def vendas_api(request):
    """API para listagem de vendas"""
    vendas = Venda.objects.all().order_by('-data_venda')
    
    vendas_data = []
    for venda in vendas:
        vendas_data.append({
            'id': venda.id,
            'cliente': {
                'id': venda.cliente.id,
                'nome': venda.cliente.nome,
                'estado': venda.cliente.estado,
            },
            'percentual_icms': venda.get_icms_percentual(),
            'data_venda': venda.data_venda.isoformat(),
            'valor_total': float(venda.get_valor_total()),
            'status': venda.status,
            'tipo_pagamento': venda.tipo_pagamento
        })
    
    return JsonResponse(vendas_data, safe=False)

@csrf_exempt
def venda_detalhe_api(request, venda_id):
    """API para detalhes de uma venda específica"""
    try:
        venda = Venda.objects.get(id=venda_id)
        itens = ItemVenda.objects.filter(venda=venda)        
        
        itens_data = []
        for item in itens:
            itens_data.append({
                'id': item.id,
                'produto': {
                    'id': item.produto.id,
                    'nome': item.produto.nome,
                },
                'quantidade': item.quantidade,
                'preco_unitario': float(item.preco_unitario),
                'percentual_icms': venda.get_icms_percentual(),
                'subtotal': float(item.quantidade * item.preco_unitario)
            })
        
        venda_data = {
            'id': venda.id,
            'cliente': {
                'id': venda.cliente.id,
                'nome': venda.cliente.nome,
                'estado': venda.cliente.estado,
            },
            'data_venda': venda.data_venda.isoformat(),
            'valor_total': float(venda.get_valor_total()),
            'status': venda.status,
            'tipo_pagamento': venda.tipo_pagamento,
            'observacao': venda.observacao,
            'itens': itens_data
        }
        
        return JsonResponse(venda_data)
        
    except Venda.DoesNotExist:
        return JsonResponse({'error': 'Venda não encontrada'}, status=404)

@csrf_exempt
def finalizar_venda_api(request, venda_id):
    """API para finalizar uma venda"""
    from vendas.views import finalizar_venda
    
    if request.method == 'POST':
        try:
            response = finalizar_venda(request, venda_id)
            
            if response.status_code == 302:
                venda = Venda.objects.get(id=venda_id)
                return JsonResponse({
                    'success': True,
                    'id': venda.id,
                    'status': venda.status
                })
            else:
                return JsonResponse({'error': 'Erro ao finalizar venda'}, status=400)
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def clientes_api(request):
    """API para listagem de clientes e fornecedores"""
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

@csrf_exempt
def cliente_detalhe_api(request, cliente_id):
    """API para detalhes de um cliente específico"""
    try:
        cliente = ClienteFornecedor.objects.get(id=cliente_id)
        
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
        
    except ClienteFornecedor.DoesNotExist:
        return JsonResponse({'error': 'Cliente não encontrado'}, status=404)

@csrf_exempt
def cliente_criar_editar_api(request, cliente_id=None):
    """API para criar ou editar um cliente"""
    if request.method == 'GET' and cliente_id:
        return cliente_detalhe_api(request, cliente_id)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            campos_validos = ['nome', 'tipo', 'tipo_pessoa', 'cpf', 'cnpj', 'cidade', 'estado']
            dados_filtrados = {k: v for k, v in data.items() if k in campos_validos}
            
            if 'tipo' not in dados_filtrados:
                dados_filtrados['tipo'] = 'cliente'
            
            if dados_filtrados.get('tipo') == 'fornecedor':
                dados_filtrados['tipo_pessoa'] = 'juridica'
                dados_filtrados.pop('cpf', None)
            
            if cliente_id:
                cliente = ClienteFornecedor.objects.get(id=cliente_id)
                for field, value in dados_filtrados.items():
                    setattr(cliente, field, value)
                cliente.save()
            else:
                cliente = ClienteFornecedor.objects.create(**dados_filtrados)
            
            return JsonResponse({
                'success': True,
                'id': cliente.id,
                'nome': cliente.nome
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE' and cliente_id:
        try:
            cliente = ClienteFornecedor.objects.get(id=cliente_id)
            cliente.delete()
            return JsonResponse({'success': True})
        except ClienteFornecedor.DoesNotExist:
            return JsonResponse({'error': 'Cliente não encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def produtos_api(request):
    """API para listagem de produtos"""
    produtos = Produto.objects.all()
    
    produtos_data = []
    for produto in produtos:
        produtos_data.append({
            'id': produto.id,
            'codigo': produto.codigo,
            'nome': produto.nome,
            'preco_compra': float(produto.preco_compra),
            'preco_custo': float(produto.preco_compra),
            'preco_venda': float(produto.preco_venda),
            'quantidade_estoque': produto.quantidade_estoque,
            'categoria': produto.categoria,
            'descricao': produto.descricao,
            'fornecedor': produto.fornecedor,
            'criado_em': produto.criado_em.isoformat() if produto.criado_em else None
        })
    
    return JsonResponse(produtos_data, safe=False)

@csrf_exempt
def produto_detalhe_api(request, produto_id):
    """API para detalhes de um produto específico"""
    try:
        produto = Produto.objects.get(id=produto_id)
        
        if request.method == 'PUT':
            data = json.loads(request.body)
            
            if 'preco_compra' in data:
                data['preco_compra'] = Decimal(str(data['preco_compra']))
            elif 'preco_custo' in data:
                data['preco_compra'] = Decimal(str(data['preco_custo']))
                del data['preco_custo']
                
            if 'preco_venda' in data:
                data['preco_venda'] = Decimal(str(data['preco_venda']))
            
            campos_validos = ['nome', 'codigo', 'preco_compra', 'preco_venda', 'quantidade_estoque', 
                              'categoria', 'descricao', 'fornecedor']
            dados_filtrados = {k: v for k, v in data.items() if k in campos_validos}
            
            for field, value in dados_filtrados.items():
                setattr(produto, field, value)
            produto.save()
            
            return JsonResponse({
                'success': True,
                'id': produto.id,
                'nome': produto.nome
            })
        
        produto_data = {
            'id': produto.id,
            'codigo': produto.codigo,
            'nome': produto.nome,
            'preco_compra': float(produto.preco_compra),
            'preco_custo': float(produto.preco_compra),
            'preco_venda': float(produto.preco_venda),
            'quantidade_estoque': produto.quantidade_estoque,
            'categoria': produto.categoria,
            'descricao': produto.descricao,
            'fornecedor': produto.fornecedor,
            'criado_em': produto.criado_em.isoformat() if produto.criado_em else None
        }
        
        return JsonResponse(produto_data)
        
    except Produto.DoesNotExist:
        return JsonResponse({'error': 'Produto não encontrado'}, status=404)

@csrf_exempt
def produto_criar_editar_api(request, produto_id=None):
    """API para criar ou editar um produto"""
    if request.method == 'GET' and produto_id:
        return produto_detalhe_api(request, produto_id)
    
    elif request.method in ['POST', 'PUT']:
        try:
            data = json.loads(request.body)
            
            if 'preco_compra' in data:
                data['preco_compra'] = Decimal(str(data['preco_compra']))
            elif 'preco_custo' in data:
                data['preco_compra'] = Decimal(str(data['preco_custo']))
                del data['preco_custo']
                
            if 'preco_venda' in data:
                data['preco_venda'] = Decimal(str(data['preco_venda']))
            
            campos_validos = ['nome', 'codigo', 'preco_compra', 'preco_venda', 'quantidade_estoque', 
                              'categoria', 'descricao', 'fornecedor']
            dados_filtrados = {k: v for k, v in data.items() if k in campos_validos}
            
            if produto_id:
                produto = Produto.objects.get(id=produto_id)
                for field, value in dados_filtrados.items():
                    setattr(produto, field, value)
                produto.save()
            else:
                produto = Produto.objects.create(**dados_filtrados)
            
            return JsonResponse({
                'success': True,
                'id': produto.id,
                'nome': produto.nome
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    elif request.method == 'DELETE' and produto_id:
        try:
            produto = Produto.objects.get(id=produto_id)
            produto.delete()
            return JsonResponse({'success': True})
        except Produto.DoesNotExist:
            return JsonResponse({'error': 'Produto não encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def estoque_movimentacoes_api(request):
    """API para listagem de movimentações de estoque"""
    movimentacoes = MovimentacaoEstoque.objects.all().order_by('-data')
    
    movimentacoes_data = []
    for movimentacao in movimentacoes:
        movimentacoes_data.append({
            'id': movimentacao.id,
            'produto': {
                'id': movimentacao.produto.id,
                'nome': movimentacao.produto.nome,
            },
            'tipo': movimentacao.tipo,
            'quantidade': movimentacao.quantidade,
            'data_movimentacao': movimentacao.data.isoformat(),
            'documento_ref': movimentacao.documento_ref,
            'observacao': movimentacao.observacao
        })
    
    return JsonResponse(movimentacoes_data, safe=False)

@csrf_exempt
def estoque_movimentacao_criar_api(request):
    """API para criar uma nova movimentação de estoque"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            produto_id = data.get('produto')
            tipo = data.get('tipo')
            quantidade = data.get('quantidade')
            
            if not produto_id or not tipo or not quantidade:
                return JsonResponse({'error': 'Dados incompletos'}, status=400)
            
            produto = Produto.objects.get(id=produto_id)
            
            if tipo == 'saida' and produto.quantidade_estoque < int(quantidade):
                return JsonResponse({
                    'error': f'Estoque insuficiente. Disponível: {produto.quantidade_estoque}'
                }, status=400)
            
            movimentacao = MovimentacaoEstoque.objects.create(
                produto=produto,
                tipo=tipo,
                quantidade=int(quantidade),
                documento_ref=data.get('documento_ref', ''),
                observacao=data.get('observacao', '')
            )
            
            return JsonResponse({
                'success': True,
                'id': movimentacao.id
            })
            
        except Produto.DoesNotExist:
            return JsonResponse({'error': 'Produto não encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def venda_criar_editar_api(request, venda_id=None):
    """API para criar ou editar uma venda"""
    if request.method == 'GET' and venda_id:
        return venda_detalhe_api(request, venda_id)
    
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            cliente_id = data.get('cliente')
            tipo_pagamento = data.get('tipo_pagamento')
            observacao = data.get('observacao', '')
            itens_data = data.get('itens', [])            

            if not cliente_id or not tipo_pagamento or not itens_data:
                return JsonResponse({'error': 'Dados incompletos'}, status=400)
            
            cliente = ClienteFornecedor.objects.get(id=cliente_id)
            
            from django.db import transaction
            with transaction.atomic():
                if venda_id:
                    venda = Venda.objects.get(id=venda_id)
                    venda.cliente = cliente
                    venda.tipo_pagamento = tipo_pagamento
                    venda.observacao = observacao
                    venda.save()
                    
                    ItemVenda.objects.filter(venda=venda).delete()
                else:
                    venda = Venda.objects.create(
                        cliente=cliente,
                        tipo_pagamento=tipo_pagamento,
                        observacao=observacao,
                        status='pendente'
                    )
                
                for item_data in itens_data:
                    produto_id = item_data.get('produto')
                    quantidade = item_data.get('quantidade')
                    preco_unitario = Decimal(str(item_data.get('preco_unitario')))
                    
                    produto = Produto.objects.get(id=produto_id)
                    
                    if produto.quantidade_estoque < quantidade:
                        raise Exception(f'Estoque insuficiente para o produto {produto.nome}. Disponível: {produto.quantidade_estoque}')
                    
                    ItemVenda.objects.create(
                        venda=venda,
                        produto=produto,
                        quantidade=quantidade,
                        preco_unitario=preco_unitario
                    )
                    
                    MovimentacaoEstoque.objects.create(
                        produto=produto,
                        tipo='saida',
                        quantidade=quantidade,
                        observacao=f"Saída por venda #{venda.id}",
                        documento_ref=f"Venda #{venda.id}"
                    )
            
            return JsonResponse({
                'success': True,
                'id': venda.id
            })
            
        except ClienteFornecedor.DoesNotExist:
            return JsonResponse({'error': 'Cliente não encontrado'}, status=404)
        except Produto.DoesNotExist:
            return JsonResponse({'error': 'Produto não encontrado'}, status=404)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método não permitido'}, status=405)