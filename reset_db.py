import os
import sys
import django
import random
from decimal import Decimal
from datetime import datetime, timedelta

sys.path.append('contabilidade')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'contabilidade.settings')
django.setup()

from django.db import transaction
from django.utils import timezone
from clientes.models import ClienteFornecedor
from produtos.models import Produto
from vendas.models import Venda, ItemVenda
from estoque.models import MovimentacaoEstoque, InventarioEstoque, ItemInventario

def reset_database():
    """Limpa todos os dados existentes no banco de dados"""
    print("Limpando o banco de dados...")

    ItemVenda.objects.all().delete()
    Venda.objects.all().delete()
    ItemInventario.objects.all().delete()
    InventarioEstoque.objects.all().delete()
    MovimentacaoEstoque.objects.all().delete()
    Produto.objects.all().delete()
    ClienteFornecedor.objects.all().delete()
    
    print("Banco de dados limpo com sucesso!")

def criar_clientes_fornecedores():
    """Cria clientes e fornecedores mockados"""
    print("Criando clientes e fornecedores...")

    estados = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
               'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
               'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']

    cidades_por_estado = {
        'SP': ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto'],
        'RJ': ['Rio de Janeiro', 'Niterói', 'Petrópolis', 'Cabo Frio'],
        'MG': ['Belo Horizonte', 'Uberlândia', 'Juiz de Fora', 'Ouro Preto'],
        'RS': ['Porto Alegre', 'Gramado', 'Caxias do Sul', 'Pelotas'],
        'PR': ['Curitiba', 'Londrina', 'Maringá', 'Foz do Iguaçu'],
        'BA': ['Salvador', 'Feira de Santana', 'Porto Seguro', 'Ilhéus'],
        'SC': ['Florianópolis', 'Joinville', 'Blumenau', 'Balneário Camboriú'],
    }

    cidades_genericas = ['Centro', 'Vila Nova', 'São João', 'Parque Industrial', 'Jardim Primavera']

    clientes_pf = [
        {
            'nome': 'João da Silva',
            'tipo_pessoa': 'fisica',
            'cpf': '123.456.789-00',
            'estado': 'SP',
        },
        {
            'nome': 'Maria Oliveira',
            'tipo_pessoa': 'fisica',
            'cpf': '987.654.321-00',
            'estado': 'RJ',
        },
        {
            'nome': 'Pedro Santos',
            'tipo_pessoa': 'fisica',
            'cpf': '111.222.333-44',
            'estado': 'MG',
        },
        {
            'nome': 'Ana Pereira',
            'tipo_pessoa': 'fisica',
            'cpf': '444.555.666-77',
            'estado': 'RS',
        },
        {
            'nome': 'Carlos Ferreira',
            'tipo_pessoa': 'fisica',
            'cpf': '555.666.777-88',
            'estado': 'SC',
        }
    ]

    clientes_pj = [
        {
            'nome': 'Comércio de Eletrônicos Ltda',
            'tipo_pessoa': 'juridica',
            'cnpj': '11.222.333/0001-44',
            'estado': 'SP',
        },
        {
            'nome': 'Mercado Bom Preço',
            'tipo_pessoa': 'juridica',
            'cnpj': '22.333.444/0001-55',
            'estado': 'RJ',
        },
        {
            'nome': 'Restaurante Sabor & Cia',
            'tipo_pessoa': 'juridica',
            'cnpj': '33.444.555/0001-66',
            'estado': 'PR',
        }
    ]

    fornecedores = [
        {
            'nome': 'Distribuidora Nacional',
            'tipo': 'fornecedor',
            'tipo_pessoa': 'juridica',
            'cnpj': '44.555.666/0001-77',
            'estado': 'SP',
        },
        {
            'nome': 'Indústria de Alimentos SA',
            'tipo': 'fornecedor',
            'tipo_pessoa': 'juridica',
            'cnpj': '55.666.777/0001-88',
            'estado': 'MG',
        },
        {
            'nome': 'Fábrica de Móveis Ltda',
            'tipo': 'fornecedor',
            'tipo_pessoa': 'juridica',
            'cnpj': '66.777.888/0001-99',
            'estado': 'PR',
        },
        {
            'nome': 'Atacado Tech',
            'tipo': 'fornecedor',
            'tipo_pessoa': 'juridica',
            'cnpj': '77.888.999/0001-00',
            'estado': 'SP',
        },
        {
            'nome': 'Papelaria Atacado',
            'tipo': 'fornecedor',
            'tipo_pessoa': 'juridica',
            'cnpj': '88.999.000/0001-11',
            'estado': 'RJ',
        }
    ]

    cliente_sem_estado = {
        'nome': 'Cliente Teste ICMS',
        'tipo_pessoa': 'juridica',
        'cnpj': '99.000.111/0001-22',
        'estado': '',
    }

    def get_cidade(estado):
        if estado in cidades_por_estado:
            return random.choice(cidades_por_estado[estado])
        else:
            return random.choice(cidades_genericas)
    
    clientes_criados = []

    for cliente in clientes_pf:
        cidade = get_cidade(cliente['estado'])
        cf = ClienteFornecedor.objects.create(
            tipo='cliente',
            tipo_pessoa=cliente['tipo_pessoa'],
            nome=cliente['nome'],
            cpf=cliente['cpf'],
            cidade=cidade,
            estado=cliente['estado']
        )
        clientes_criados.append(cf)
        print(f"Cliente PF criado: {cf.nome} ({cf.estado})")

    for cliente in clientes_pj:
        cidade = get_cidade(cliente['estado'])
        cf = ClienteFornecedor.objects.create(
            tipo='cliente',
            tipo_pessoa=cliente['tipo_pessoa'],
            nome=cliente['nome'],
            cnpj=cliente['cnpj'],
            cidade=cidade,
            estado=cliente['estado']
        )
        clientes_criados.append(cf)
        print(f"Cliente PJ criado: {cf.nome} ({cf.estado})")

    fornecedores_criados = []
    for fornecedor in fornecedores:
        cidade = get_cidade(fornecedor['estado'])
        cf = ClienteFornecedor.objects.create(
            tipo='fornecedor',
            tipo_pessoa=fornecedor['tipo_pessoa'],
            nome=fornecedor['nome'],
            cnpj=fornecedor['cnpj'],
            cidade=cidade,
            estado=fornecedor['estado']
        )
        fornecedores_criados.append(cf)
        print(f"Fornecedor criado: {cf.nome} ({cf.estado})")

    cf = ClienteFornecedor.objects.create(
        tipo='cliente',
        tipo_pessoa=cliente_sem_estado['tipo_pessoa'],
        nome=cliente_sem_estado['nome'],
        cnpj=cliente_sem_estado['cnpj'],
        cidade='Cidade Teste',
        estado=cliente_sem_estado['estado']
    )
    clientes_criados.append(cf)
    print(f"Cliente sem estado criado: {cf.nome}")
    
    return clientes_criados, fornecedores_criados

def criar_produtos():
    """Cria produtos mockados"""
    print("Criando produtos...")
    
    categorias = [
        'Eletrônicos',
        'Informática',
        'Papelaria',
        'Móveis',
        'Alimentos',
        'Bebidas',
        'Vestuário',
    ]
    
    produtos_dados = [
        {
            'codigo': 'ELET001',
            'nome': 'Smartphone XYZ',
            'preco_compra': Decimal('800.00'),
            'preco_venda': Decimal('1499.99'),
            'categoria': 'Eletrônicos',
            'descricao': 'Smartphone com 128GB de memória e câmera de 48MP',
        },
        {
            'codigo': 'ELET002',
            'nome': 'Smart TV 42"',
            'preco_compra': Decimal('1200.00'),
            'preco_venda': Decimal('1899.99'),
            'categoria': 'Eletrônicos',
            'descricao': 'Smart TV LED 42" com Wi-Fi integrado',
        },
        {
            'codigo': 'INF001',
            'nome': 'Notebook Slim',
            'preco_compra': Decimal('2200.00'),
            'preco_venda': Decimal('3499.99'),
            'categoria': 'Informática',
            'descricao': 'Notebook com processador i5, 8GB RAM e SSD 256GB',
        },
        {
            'codigo': 'INF002',
            'nome': 'Mouse Sem Fio',
            'preco_compra': Decimal('25.00'),
            'preco_venda': Decimal('59.90'),
            'categoria': 'Informática',
            'descricao': 'Mouse sem fio com bateria de longa duração',
        },
        {
            'codigo': 'PAP001',
            'nome': 'Papel A4 (Resma)',
            'preco_compra': Decimal('15.00'),
            'preco_venda': Decimal('29.90'),
            'categoria': 'Papelaria',
            'descricao': 'Resma de papel A4 com 500 folhas',
        },
        {
            'codigo': 'MOV001',
            'nome': 'Mesa de Escritório',
            'preco_compra': Decimal('180.00'),
            'preco_venda': Decimal('349.90'),
            'categoria': 'Móveis',
            'descricao': 'Mesa de escritório com 2 gavetas',
        },
        {
            'codigo': 'MOV002',
            'nome': 'Cadeira de Escritório',
            'preco_compra': Decimal('250.00'),
            'preco_venda': Decimal('499.90'),
            'categoria': 'Móveis',
            'descricao': 'Cadeira ergonômica com ajuste de altura',
        },
        {
            'codigo': 'ALM001',
            'nome': 'Café em Pó 500g',
            'preco_compra': Decimal('8.00'),
            'preco_venda': Decimal('15.90'),
            'categoria': 'Alimentos',
            'descricao': 'Café torrado e moído embalagem de 500g',
        },
        {
            'codigo': 'BEB001',
            'nome': 'Refrigerante 2L',
            'preco_compra': Decimal('3.50'),
            'preco_venda': Decimal('8.99'),
            'categoria': 'Bebidas',
            'descricao': 'Refrigerante sabor cola garrafa 2L',
        },
        {
            'codigo': 'VST001',
            'nome': 'Camiseta Básica',
            'preco_compra': Decimal('20.00'),
            'preco_venda': Decimal('49.90'),
            'categoria': 'Vestuário',
            'descricao': 'Camiseta 100% algodão diversos tamanhos',
        }
    ]
    
    produtos_criados = []
    for produto_data in produtos_dados:
        fornecedor = produto_data.get('fornecedor', 'Fornecedor Padrão')
        icms = produto_data.get('icms', 17.0)
        
        produto = Produto.objects.create(
            codigo=produto_data['codigo'],
            nome=produto_data['nome'],
            preco_compra=produto_data['preco_compra'],
            preco_venda=produto_data['preco_venda'],
            quantidade_estoque=0,
            categoria=produto_data['categoria'],
            descricao=produto_data['descricao'],
            fornecedor=fornecedor,
            icms=icms
        )
        produtos_criados.append(produto)
        print(f"Produto criado: {produto.nome} (Código: {produto.codigo})")
        
    return produtos_criados

def criar_movimentacoes_estoque(produtos):
    """Cria movimentações de estoque para os produtos"""
    print("Criando movimentações de estoque...")
    
    movimentacoes = []
    for produto in produtos:
        quantidade = random.randint(10, 100)
        
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo='entrada',
            quantidade=quantidade,
            observacao='Estoque inicial',
            documento_ref='EST-INICIAL'
        )
        
        movimentacoes.append(movimentacao)
        print(f"Movimentação de estoque criada: {movimentacao}")

    for _ in range(5):
        produto = random.choice(produtos)
        quantidade = random.randint(1, 15)
        if produto.quantidade_estoque >= quantidade:
            tipo = 'saida'
            obs = 'Saída manual de estoque'
            ref_doc = 'SAIDA-MANUAL'
        else:
            tipo = 'entrada'
            obs = 'Entrada adicional'
            ref_doc = 'ENTRADA-ADICIONAL'
            
        movimentacao = MovimentacaoEstoque.objects.create(
            produto=produto,
            tipo=tipo,
            quantidade=quantidade,
            observacao=obs,
            documento_ref=ref_doc
        )
        
        movimentacoes.append(movimentacao)
        print(f"Movimentação adicional: {tipo.upper()} de {quantidade} unidades de {produto.nome}")
    
    return movimentacoes

def criar_vendas(clientes, produtos):
    """Cria vendas mockadas com itens"""
    print("Criando vendas...")
    
    tipos_pagamento = ['avista', 'aprazo']
    status_choices = ['pendente', 'finalizada', 'cancelada']
    
    vendas_criadas = []
    for i in range(10):
        cliente = random.choice(clientes)
        dias_atras = random.randint(0, 30)
        data_venda = timezone.now() - timedelta(days=dias_atras)

        venda = Venda(
            cliente=cliente,
            tipo_pagamento=random.choice(tipos_pagamento),
            observacao=f'Venda teste #{i+1}',
            status=random.choice(status_choices),
            data_venda=data_venda
        )
        venda.save()

        num_itens = random.randint(1, 5)
        produtos_desta_venda = random.sample(produtos, num_itens)
        
        for produto in produtos_desta_venda:
            quantidade = random.randint(1, 3)

            if produto.quantidade_estoque >= quantidade and venda.status != 'cancelada':
                ItemVenda.objects.create(
                    venda=venda,
                    produto=produto,
                    quantidade=quantidade,
                    preco_unitario=produto.preco_venda
                )

                if venda.status == 'finalizada':
                    MovimentacaoEstoque.objects.create(
                        produto=produto,
                        tipo='saida',
                        quantidade=quantidade,
                        observacao=f'Saída por venda #{venda.id}',
                        documento_ref=f'Venda #{venda.id}'
                    )
                
                print(f"Item adicionado à venda #{venda.id}: {quantidade}x {produto.nome}")
        
        vendas_criadas.append(venda)
        print(f"Venda #{venda.id} criada para {cliente.nome} com {venda.itemvenda_set.count()} itens - Status: {venda.status}")
    
    return vendas_criadas

def criar_inventario(produtos):
    """Cria um inventário de estoque"""
    print("Criando inventário de estoque...")

    inventario = InventarioEstoque.objects.create(
        responsavel="Administrador",
        observacoes="Inventário inicial de teste",
        data_inventario=timezone.now().date()
    )

    for produto in produtos:
        if random.random() < 0.8:
            qtd_fisica = produto.quantidade_estoque
        else:
            diferenca = random.randint(-3, 3)
            qtd_fisica = max(0, produto.quantidade_estoque + diferenca)
        
        ItemInventario.objects.create(
            inventario=inventario,
            produto=produto,
            quantidade_sistema=produto.quantidade_estoque,
            quantidade_fisica=qtd_fisica
        )
    
    print(f"Inventário criado com {inventario.itens.count()} itens")
    return inventario

@transaction.atomic
def popular_banco():
    """Popula o banco de dados com dados mockados"""
    try:
        reset_database()
        clientes, fornecedores = criar_clientes_fornecedores()
        produtos = criar_produtos()
        movimentacoes = criar_movimentacoes_estoque(produtos)
        vendas = criar_vendas(clientes, produtos)
        inventario = criar_inventario(produtos)
        
        print("\nDados mockados criados com sucesso!")
        print(f"- {len(clientes)} clientes")
        print(f"- {len(fornecedores)} fornecedores")
        print(f"- {len(produtos)} produtos")
        print(f"- {len(movimentacoes)} movimentações de estoque")
        print(f"- {len(vendas)} vendas")
        print(f"- 1 inventário com {inventario.itens.count()} itens")
        
    except Exception as e:
        print(f"Erro ao popular o banco de dados: {str(e)}")
        raise

if __name__ == "__main__":
    print("Iniciando script de reset e populamento do banco de dados...")
    popular_banco()
    print("\nProcesso concluído!")