from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
import json
from decimal import Decimal
from .models import MovimentacaoEstoque, InventarioEstoque, ItemInventario
from produtos.models import Produto
from django.db import transaction
from django.utils import timezone
from django.db.models import F

def lista_movimentacoes(request):
    """API para listar todas as movimentações de estoque"""
    movimentacoes = MovimentacaoEstoque.objects.all().order_by('-data')
    
    movimentacoes_data = []
    for movimentacao in movimentacoes:
        movimentacoes_data.append({
            'id': movimentacao.id,
            'produto': {
                'id': movimentacao.produto.id,
                'nome': movimentacao.produto.nome,
                'codigo': movimentacao.produto.codigo,
            },
            'tipo': movimentacao.tipo,
            'quantidade': movimentacao.quantidade,
            'data': movimentacao.data.isoformat(),
            'observacao': movimentacao.observacao,
            'documento_ref': movimentacao.documento_ref
        })
    
    return JsonResponse(movimentacoes_data, safe=False)

@csrf_exempt
def criar_movimentacao(request):
    """API para criar uma nova movimentação de estoque"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            produto_id = data.get('produto')
            tipo = data.get('tipo')
            quantidade = int(data.get('quantidade', 0))
            observacao = data.get('observacao', '')
            documento_ref = data.get('documento_ref', '')

            if not produto_id:
                return JsonResponse({'error': 'Produto não informado'}, status=400)
            
            if not tipo:
                return JsonResponse({'error': 'Tipo de movimentação não informado'}, status=400)
                
            if tipo not in ['entrada', 'saida']:
                return JsonResponse({'error': 'Tipo de movimentação inválido'}, status=400)
                
            if quantidade <= 0:
                return JsonResponse({'error': 'Quantidade deve ser maior que zero'}, status=400)
            
            try:
                produto = Produto.objects.get(id=produto_id)
            except Produto.DoesNotExist:
                return JsonResponse({'error': 'Produto não encontrado'}, status=404)

            if tipo == 'saida' and produto.quantidade_estoque < quantidade:
                return JsonResponse({
                    'error': f'Estoque insuficiente para o produto {produto.nome}. Disponível: {produto.quantidade_estoque}'
                }, status=400)
            
            with transaction.atomic():
                movimentacao = MovimentacaoEstoque.objects.create(
                    produto=produto,
                    tipo=tipo,
                    quantidade=quantidade,
                    observacao=observacao,
                    documento_ref=documento_ref
                )
                
                return JsonResponse({
                    'success': True,
                    'id': movimentacao.id,
                    'message': 'Movimentação de estoque registrada com sucesso!'
                })
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método não permitido'}, status=405)

def detalhe_movimentacao(request, id):
    """API para obter detalhes de uma movimentação de estoque"""
    movimentacao = get_object_or_404(MovimentacaoEstoque, id=id)
    
    movimentacao_data = {
        'id': movimentacao.id,
        'produto': {
            'id': movimentacao.produto.id,
            'nome': movimentacao.produto.nome,
            'codigo': movimentacao.produto.codigo,
        },
        'tipo': movimentacao.tipo,
        'quantidade': movimentacao.quantidade,
        'data': movimentacao.data.isoformat(),
        'observacao': movimentacao.observacao,
        'documento_ref': movimentacao.documento_ref
    }
    
    return JsonResponse(movimentacao_data)

def listar_estoque(request):
    """API para listar todos os produtos com suas quantidades em estoque"""
    produtos = Produto.objects.all().order_by('nome')
    
    produtos_data = []
    for produto in produtos:
        if produto.preco_compra is not None:
            preco_compra = float(produto.preco_compra)
        else:
            preco_compra = 0.0
            
        produtos_data.append({
            'id': produto.id,
            'codigo': produto.codigo,
            'nome': produto.nome,
            'quantidade_estoque': produto.quantidade_estoque,
            'preco_compra': preco_compra,
            'preco_venda': float(produto.preco_venda)
        })
    
    return JsonResponse(produtos_data, safe=False)

def get_produto_estoque(request, produto_id):
    """API para obter informações sobre o estoque de um produto"""
    try:
        produto = Produto.objects.get(pk=produto_id)
        return JsonResponse({
            'quantidade_estoque': produto.quantidade_estoque,
            'nome': produto.nome
        })
    except Produto.DoesNotExist:
        return JsonResponse({'error': 'Produto não encontrado'}, status=404)

@csrf_exempt
def ajuste_estoque(request):
    """API para ajuste manual de estoque"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            produto_id = data.get('produto')
            nova_quantidade = int(data.get('nova_quantidade', 0))
            motivo = data.get('motivo', 'Ajuste manual sem motivo especificado')
            
            if not produto_id:
                return JsonResponse({'error': 'Produto não informado'}, status=400)
                
            if nova_quantidade < 0:
                return JsonResponse({'error': 'Quantidade não pode ser negativa'}, status=400)
            
            try:
                produto = Produto.objects.get(id=produto_id)
            except Produto.DoesNotExist:
                return JsonResponse({'error': 'Produto não encontrado'}, status=404)

            diferenca = nova_quantidade - produto.quantidade_estoque
            
            if diferenca == 0:
                return JsonResponse({'message': 'Não há alteração no estoque'})

            with transaction.atomic():
                tipo = 'entrada' if diferenca > 0 else 'saida'
                
                MovimentacaoEstoque.objects.create(
                    produto=produto,
                    tipo=tipo,
                    quantidade=abs(diferenca),
                    observacao=f"Ajuste manual: {motivo}",
                    documento_ref="Ajuste manual"
                )
                
                return JsonResponse({
                    'success': True,
                    'message': f'Estoque de {produto.nome} ajustado para {nova_quantidade} unidades.',
                    'nova_quantidade': nova_quantidade
                })
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def iniciar_inventario(request):
    """API para iniciar um novo inventário de estoque"""
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            
            responsavel = data.get('responsavel')
            observacoes = data.get('observacoes', '')
            
            if not responsavel:
                return JsonResponse({'error': 'Responsável não informado'}, status=400)
            
            with transaction.atomic():
                inventario = InventarioEstoque.objects.create(
                    responsavel=responsavel,
                    observacoes=observacoes,
                    data_inventario=timezone.now().date()
                )
                
                produtos = Produto.objects.all()
                for produto in produtos:
                    ItemInventario.objects.create(
                        inventario=inventario,
                        produto=produto,
                        quantidade_sistema=produto.quantidade_estoque,
                        quantidade_fisica=produto.quantidade_estoque
                    )
                
                return JsonResponse({
                    'success': True,
                    'id': inventario.id,
                    'message': 'Inventário iniciado com sucesso'
                })
                
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
            
    return JsonResponse({'error': 'Método não permitido'}, status=405)

@csrf_exempt
def atualizar_item_inventario(request, inventario_id, item_id):
    """API para atualizar um item de inventário"""
    if request.method != 'POST' and request.method != 'PUT':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    
    try:
        inventario = get_object_or_404(InventarioEstoque, id=inventario_id)
        item = get_object_or_404(ItemInventario, id=item_id, inventario=inventario)
        
        if inventario.concluido:
            return JsonResponse({'error': 'Este inventário já foi finalizado'}, status=400)
        
        data = json.loads(request.body)
        quantidade_fisica = data.get('quantidade_fisica')
        
        if quantidade_fisica is None:
            return JsonResponse({'error': 'Quantidade física não informada'}, status=400)
            
        if quantidade_fisica < 0:
            return JsonResponse({'error': 'Quantidade física não pode ser negativa'}, status=400)
        
        item.quantidade_fisica = quantidade_fisica
        item.save()
        
        return JsonResponse({
            'success': True,
            'id': item.id,
            'diferenca': item.diferenca
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@csrf_exempt
def finalizar_inventario(request, inventario_id):
    """API para finalizar um inventário e aplicar os ajustes"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Método não permitido'}, status=405)
    
    try:
        inventario = get_object_or_404(InventarioEstoque, id=inventario_id)
        
        if inventario.concluido:
            return JsonResponse({'error': 'Este inventário já foi finalizado'}, status=400)
        
        with transaction.atomic():
            for item in inventario.itens.all():
                produto = item.produto
                diferenca = item.quantidade_fisica - item.quantidade_sistema
                
                if diferenca != 0:
                    tipo = 'entrada' if diferenca > 0 else 'saida'
                    MovimentacaoEstoque.objects.create(
                        produto=produto,
                        tipo=tipo,
                        quantidade=abs(diferenca),
                        observacao=f"Ajuste do inventário #{inventario.pk} de {inventario.data_inventario}",
                        documento_ref=f"Inventário #{inventario.pk}"
                    )
            inventario.concluido = True
            inventario.save()
            
            return JsonResponse({
                'success': True,
                'id': inventario.id,
                'message': 'Inventário finalizado e ajustes aplicados com sucesso'
            })
            
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

def lista_inventarios(request):
    """API para listar todos os inventários"""
    inventarios = InventarioEstoque.objects.all().order_by('-data_inventario')
    
    inventarios_data = []
    for inventario in inventarios:
        total_sistema = sum(item.quantidade_sistema for item in inventario.itens.all())
        total_fisico = sum(item.quantidade_fisica for item in inventario.itens.all())
        itens_com_diferenca = inventario.itens.exclude(quantidade_sistema=F('quantidade_fisica')).count()
        
        inventarios_data.append({
            'id': inventario.id,
            'data_inventario': inventario.data_inventario.isoformat(),
            'responsavel': inventario.responsavel,
            'concluido': inventario.concluido,
            'total_sistema': total_sistema,
            'total_fisico': total_fisico,
            'diferenca_total': total_fisico - total_sistema,
            'itens_com_diferenca': itens_com_diferenca
        })
    
    return JsonResponse(inventarios_data, safe=False)

def detalhe_inventario(request, inventario_id):
    """API para obter detalhes de um inventário"""
    inventario = get_object_or_404(InventarioEstoque, id=inventario_id)
    total_sistema = sum(item.quantidade_sistema for item in inventario.itens.all())
    total_fisico = sum(item.quantidade_fisica for item in inventario.itens.all())
    
    itens_data = []
    for item in inventario.itens.all():
        itens_data.append({
            'id': item.id,
            'produto': {
                'id': item.produto.id,
                'nome': item.produto.nome,
                'codigo': item.produto.codigo
            },
            'quantidade_sistema': item.quantidade_sistema,
            'quantidade_fisica': item.quantidade_fisica,
            'diferenca': item.quantidade_fisica - item.quantidade_sistema
        })
    
    inventario_data = {
        'id': inventario.id,
        'data_inventario': inventario.data_inventario.isoformat(),
        'responsavel': inventario.responsavel,
        'observacoes': inventario.observacoes,
        'concluido': inventario.concluido,
        'total_sistema': total_sistema,
        'total_fisico': total_fisico,
        'diferenca_total': total_fisico - total_sistema,
        'itens': itens_data
    }
    
    return JsonResponse(inventario_data)
