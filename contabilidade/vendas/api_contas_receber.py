from django.http import JsonResponse
from decimal import Decimal
from .models import Venda

def get_contas_receber():
    """
    Função utilitária para calcular contas a receber de forma consistente
    em todo o sistema.
    """
    try:
        vendas_prazo = Venda.objects.filter(tipo_pagamento='aprazo', status='finalizada')
        
        # Lista detalhada de todas as vendas a prazo
        vendas_prazo_detalhes = []
        total = Decimal('0.00')
        
        for venda in vendas_prazo:
            valor = venda.get_valor_total()
            total += valor
            vendas_prazo_detalhes.append({
                'id': venda.id,
                'cliente': venda.cliente.nome,
                'valor': float(valor),
                'data_venda': venda.data_venda.isoformat() if hasattr(venda, 'data_venda') else None
            })
        
        return {
            'total': total,
            'detalhes': vendas_prazo_detalhes,
            'sucesso': True
        }
    
    except Exception as e:
        return {
            'total': Decimal('0.00'),
            'detalhes': [],
            'sucesso': False,
            'erro': str(e)
        }

def api_contas_receber(request):
    """
    API para obter o total de contas a receber e detalhes
    """
    resultado = get_contas_receber()
    
    if resultado['sucesso']:
        return JsonResponse({
            'total': float(resultado['total']),
            'detalhes': resultado['detalhes']
        })
    else:
        return JsonResponse({
            'erro': resultado['erro']
        }, status=500)
