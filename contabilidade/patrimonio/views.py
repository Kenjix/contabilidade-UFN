from django.db.models import Sum, F, Value, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import CapitalSocial, CategoriaBem, BemPatrimonial, AquisicaoBem
from .serializers import (
    CapitalSocialSerializer, CategoriaBemSerializer,
    BemPatrimonialSerializer, AquisicaoBemSerializer
)
from produtos.models import Produto
from vendas.models import Venda

class CapitalSocialViewSet(viewsets.ModelViewSet):
    queryset = CapitalSocial.objects.all()
    serializer_class = CapitalSocialSerializer

class CategoriaBemViewSet(viewsets.ModelViewSet):
    queryset = CategoriaBem.objects.all()
    serializer_class = CategoriaBemSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class BemPatrimonialViewSet(viewsets.ModelViewSet):
    queryset = BemPatrimonial.objects.all()
    serializer_class = BemPatrimonialSerializer
    
    def get_queryset(self):
        queryset = BemPatrimonial.objects.all()
        categoria = self.request.query_params.get('categoria', None)
        tipo = self.request.query_params.get('tipo', None)
        ativo = self.request.query_params.get('ativo', None)
        
        if categoria:
            queryset = queryset.filter(categoria__id=categoria)
        if tipo:
            queryset = queryset.filter(tipo=tipo)
        if ativo is not None:
            queryset = queryset.filter(ativo=(ativo.lower() == 'true'))
            
        return queryset
    
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        data = serializer.data
        
        # Add calculated valor_atual field to each item
        for i, item in enumerate(data):
            bem = queryset[i]
            data[i]['valor_atual'] = bem.calcular_valor_atual()
        
        return Response(data)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['valor_atual'] = instance.calcular_valor_atual()
        return Response(data)

class AquisicaoBemViewSet(viewsets.ModelViewSet):
    queryset = AquisicaoBem.objects.all()
    serializer_class = AquisicaoBemSerializer

# API para o Balanço Patrimonial
class BalancoPatrimonialAPI(APIView):
    """
    API para gerar o Balanço Patrimonial da empresa
    """
    def get(self, request, *args, **kwargs):
        # Bens e direitos (Ativo)
        # 1. Bens patrimoniais
        bens = BemPatrimonial.objects.filter(ativo=True, baixado=False)
        bens_serializer = BemPatrimonialSerializer(bens, many=True)
        valor_bens = sum(bem.calcular_valor_atual() for bem in bens)
        
        # 2. Estoque de mercadorias
        mercadorias = Produto.objects.all()
        valor_estoque = sum(produto.preco_compra * produto.quantidade_estoque for produto in mercadorias)
        
        # Dados detalhados para o estoque de mercadorias
        estoque_mercadorias_itens = []
        for produto in mercadorias:
            if produto.quantidade_estoque > 0:
                estoque_mercadorias_itens.append({
                    'id': produto.id,
                    'codigo': produto.codigo,
                    'nome': produto.nome,
                    'quantidade': produto.quantidade_estoque,
                    'preco_compra': str(produto.preco_compra),
                    'valor_total': str(produto.preco_compra * produto.quantidade_estoque)
                })
        try:
            vendas_prazo = Venda.objects.filter(tipo_pagamento__in=['aprazo', 'a_prazo'], status='finalizada')
            contas_receber = sum(venda.get_valor_total() for venda in vendas_prazo)
        except Exception as e:
            contas_receber = Decimal('0.00')
        
        # 4. Caixa e Equivalentes (capital social + vendas à vista finalizadas)
        try:
            # Capital social total
            capital_social = CapitalSocial.objects.aggregate(
                total=Sum('valor')
            )['total'] or Decimal('0.00')
            
            # Vendas à vista finalizadas (dinheiro que entrou no caixa)
            vendas_avista = Venda.objects.filter(tipo_pagamento__in=['avista', 'a_vista'], status='finalizada')
            receita_vendas_avista = sum(venda.get_valor_total() for venda in vendas_avista)
            
            # Total em caixa = capital social + vendas à vista
            caixa_equivalentes = capital_social + receita_vendas_avista
            
        except Exception as e:
            capital_social = Decimal('0.00')
            caixa_equivalentes = Decimal('0.00')
          # Calculando o total de bens e direitos (ativo)
        total_ativo = valor_bens + valor_estoque + contas_receber + caixa_equivalentes
        
        # Obrigações (Passivo)
        # 1. Contas a pagar de bens patrimoniais adquiridos a prazo
        try:
            # Busca bens que foram adquiridos a prazo (não à vista)
            aquisicoes_prazo = AquisicaoBem.objects.filter(
                forma_pagamento__in=['parcelado', 'financiado'],
                bem__ativo=True,
                bem__baixado=False
            )
            
            contas_pagar_bens = Decimal('0.00')
            detalhes_bens_prazo = []
            
            for aquisicao in aquisicoes_prazo:
                # Valor ainda não pago = Valor total - Valor de entrada
                valor_pendente = aquisicao.valor_total - aquisicao.valor_entrada
                
                # Para simplificação, ainda há valor a pagar
                if valor_pendente > 0:
                    contas_pagar_bens += valor_pendente
                    
                    # Calcular percentual pago
                    percentual_pago = ((aquisicao.valor_total - valor_pendente) / aquisicao.valor_total * 100) if aquisicao.valor_total > 0 else 0
                    
                    detalhes_bens_prazo.append({
                        'aquisicao_id': aquisicao.id,
                        'bem': {
                            'nome': aquisicao.bem.nome,
                            'id': aquisicao.bem.id,
                            'categoria': aquisicao.bem.categoria.nome if aquisicao.bem.categoria else 'N/A'
                        },
                        'fornecedor': {
                            'nome': aquisicao.fornecedor.nome if aquisicao.fornecedor else 'N/A',
                            'id': aquisicao.fornecedor.id if aquisicao.fornecedor else None
                        },
                        'data_aquisicao': str(aquisicao.data_aquisicao),
                        'valores': {
                            'total': str(aquisicao.valor_total),
                            'entrada': str(aquisicao.valor_entrada),
                            'pendente': str(valor_pendente),
                            'percentual_pago': f"{percentual_pago:.1f}%"
                        },
                        'pagamento': {
                            'forma': aquisicao.forma_pagamento,
                            'parcelas': aquisicao.parcelas
                        }
                    })
            
        except Exception as e:
            contas_pagar_bens = Decimal('0.00')
            detalhes_bens_prazo = []
          # 2. Contas a pagar de mercadorias (fornecedores)
        try:
            # Importacao o modelo de compras de mercadorias
            from compras.models import CompraMercadoria
            
            # Busca compras de mercadorias a prazo que ainda têm valor pendente
            compras_prazo = CompraMercadoria.objects.filter(
                forma_pagamento__in=['aprazo', 'parcelado'],
                status__in=['pendente', 'finalizada']
            )
            
            contas_pagar_mercadorias = Decimal('0.00')
            detalhes_mercadorias_prazo = []
            
            for compra in compras_prazo:
                valor_pendente = compra.get_valor_pendente()
                
                if valor_pendente > 0:
                    contas_pagar_mercadorias += valor_pendente
                    
                    # Calcula percentual pago
                    percentual_pago = ((compra.valor_total - valor_pendente) / compra.valor_total * 100) if compra.valor_total > 0 else 0
                    
                    detalhes_mercadorias_prazo.append({
                        'compra_id': compra.id,
                        'fornecedor': {
                            'nome': compra.fornecedor.nome,
                            'id': compra.fornecedor.id
                        },
                        'data_compra': str(compra.data_compra),
                        'valores': {
                            'total': str(compra.valor_total),
                            'entrada': str(compra.valor_entrada),
                            'pendente': str(valor_pendente),
                            'percentual_pago': f"{percentual_pago:.1f}%"
                        },
                        'pagamento': {
                            'forma': compra.forma_pagamento,
                            'parcelas': compra.parcelas,
                            'status': compra.status
                        },
                        'documento': {
                            'nota_fiscal': compra.nota_fiscal or 'N/A'
                        },
                        'observacoes': getattr(compra, 'observacoes', '') or 'Sem observações'
                    })
            
        except ImportError:
            contas_pagar_mercadorias = Decimal('0.00')
            detalhes_mercadorias_prazo = []
        except Exception as e:
            contas_pagar_mercadorias = Decimal('0.00')
            detalhes_mercadorias_prazo = []
          # Total das obrigações
        total_obrigacoes = contas_pagar_bens + contas_pagar_mercadorias
        
        # Patrimônio líquido = Capital social + Lucros/Prejuízos acumulados
        # Caculo: Ativo - Obrigações
        patrimonio_liquido = total_ativo - total_obrigacoes
        
        # Lucros retidos = Patrimônio líquido - Capital social
        lucros_retidos = patrimonio_liquido - capital_social
        
        # Total do passivo + patrimônio líquido
        total_passivo = total_obrigacoes + patrimonio_liquido
        
        return Response({
            'ativo': {
                'circulante': {
                    'estoque_mercadorias': str(valor_estoque),
                    'estoque_mercadorias_itens': estoque_mercadorias_itens,
                    'contas_receber': str(contas_receber),
                    'caixa': str(caixa_equivalentes),
                    'valor': str(valor_estoque + contas_receber + caixa_equivalentes)
                },
                'nao_circulante': {
                    'bens_patrimoniais': {
                        'valor': str(valor_bens),
                        'itens': bens_serializer.data
                    },
                    'valor': str(valor_bens)
                },
                'total': str(total_ativo)
            },
            'passivo': {
                'exigivel': {
                    'circulante': {
                        'contas_pagar': {
                            'fornecedores_bens': {
                                'valor': str(contas_pagar_bens),
                                'descricao': 'Fornecedores - Bens Patrimoniais',
                                'detalhes': detalhes_bens_prazo,
                                'quantidade_aquisicoes': len(detalhes_bens_prazo)
                            },
                            'fornecedores_mercadorias': {
                                'valor': str(contas_pagar_mercadorias),
                                'descricao': 'Fornecedores - Mercadorias',
                                'detalhes': detalhes_mercadorias_prazo,
                                'quantidade_compras': len(detalhes_mercadorias_prazo)
                            },
                            'total_fornecedores': str(contas_pagar_bens + contas_pagar_mercadorias)
                        },
                        'obrigacoes_trabalhistas': {
                            'salarios_pagar': '0.00',
                            'encargos_sociais': '0.00',
                            'total': '0.00'
                        },
                        'obrigacoes_fiscais': {
                            'impostos_pagar': '0.00',
                            'contribuicoes_pagar': '0.00',
                            'total': '0.00'
                        },
                        'emprestimos_financiamentos': {
                            'curto_prazo': '0.00',
                            'total': '0.00'
                        },
                        'total_circulante': str(total_obrigacoes)
                    },
                    'nao_circulante': {
                        'emprestimos_financiamentos': {
                            'longo_prazo': '0.00',
                            'total': '0.00'
                        },
                        'total_nao_circulante': '0.00'
                    },
                    'total_exigivel': str(total_obrigacoes)
                },
                'patrimonio_liquido': {
                    'capital_social': {
                        'valor': str(capital_social),
                        'descricao': 'Capital Social Subscrito e Integralizado (CS)'
                    },
                    'lucros_prejuizos_acumulados': {
                        'valor': str(lucros_retidos),
                        'descricao': 'Lucros/Prejuízos Acumulados (LPA = PL - CS)'
                    },
                    'total_patrimonio_liquido': str(patrimonio_liquido)
                },
                'total_passivo': str(total_passivo)
            },
            'resumo': {
                'total_ativo': str(total_ativo),
                'total_passivo': str(total_passivo),
                'total_obrigacoes': str(total_obrigacoes),
                'patrimonio_liquido': str(patrimonio_liquido),
                'balanco_fechado': total_ativo == total_passivo
            },
            'data_balanco': str(kwargs.get('data', None))
        })
