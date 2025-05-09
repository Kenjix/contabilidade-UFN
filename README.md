# Software de Contabilidade

> **Projeto Acadêmico desenvolvido para a disciplina de Contabilidade Aplicada à Informática da Universidade Franciscana (UFN)** - Sistema de gestão contábil para controle de vendas, estoque, clientes e produtos, com cálculo automático de ICMS baseado no estado do cliente.

## Sobre o Projeto

Este software foi criado como projeto prático da disciplina de **Contabilidade Aplicada à Informática** do curso de Sistemas de Informações da UFN (Universidade Franciscana). Ele implementa conceitos contábeis como cálculo de ICMS interestadual, controle de estoque e gestão financeira básica.

## Recursos Principais

- Cadastro de clientes (pessoas físicas e jurídicas)
- Cadastro de fornecedores
- Gerenciamento de produtos com controle de estoque
- Sistema de vendas com cálculo automático de ICMS por estado
- Controle de movimentações de estoque
- Inventário de estoque com ajustes automáticos
- Dashboard com indicadores de desempenho

## Requisitos

- Python 3.8+
- Django 4.2+
- Node.js 16+ (para o frontend)
- npm 8+ ou yarn 1.22+

## Instalação

### Backend (Django)

1. Clone o repositório:
```bash
git clone https://github.com/Kenjix/contabilidade-UFN.git
cd softwareContabilidade
```

2. Crie e ative um ambiente virtual:
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/MacOS
python3 -m venv venv
source venv/bin/activate
```

3. Instale as dependências:
```bash
pip install -r requirements.txt
```

4. Configure o banco de dados:
```bash
cd contabilidade
python manage.py migrate
```

5. Crie um superusuário para acessar o admin:
```bash
python manage.py createsuperuser
```

### Frontend (React)

1. Navegue até o diretório do frontend:
```bash
cd ../frontend
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

## Como Executar

### Backend

1. Ative o ambiente virtual (caso não esteja ativado):
```bash
# Windows
venv\Scripts\activate

# Linux/MacOS
source venv/bin/activate
```

2. Inicie o servidor Django:
```bash
cd contabilidade
python manage.py runserver
```

O backend estará disponível em `http://localhost:8000/`.

### Frontend

1. Em outro terminal, navegue até o diretório do frontend:
```bash
cd frontend
```

2. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
yarn start
```

O frontend estará disponível em `http://localhost:3000/`.

## Dados de Teste

Para popular o banco de dados com dados de teste, execute o script `reset_db.py`:

```bash
# Na pasta raiz do projeto
python reset_db.py
```

Este script vai:
1. Limpar todos os dados existentes no banco
2. Criar clientes e fornecedores com estados definidos
3. Criar produtos com diferentes categorias
4. Gerar vendas com itens relacionados
5. Criar movimentações de estoque
6. Gerar um inventário com itens

## Estrutura do Projeto

```
softwareContabilidade/
├── contabilidade/          # Aplicação Django (Backend)
│   ├── clientes/           # App de clientes e fornecedores
│   ├── produtos/           # App de produtos
│   ├── vendas/             # App de vendas
│   ├── estoque/            # App de controle de estoque
│   ├── core/               # Funcionalidades centrais
│   └── ...
├── frontend/               # Aplicação React (Frontend)
│   ├── public/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── services/       # Serviços de API
│   │   └── ...
│   └── ...
├── requirements.txt        # Dependências Python
├── reset_db.py             # Script para popular o banco com dados de teste
└── README.md               # Este arquivo
```

## Funcionalidades Principais

### Cadastro de Clientes
- Cadastro de pessoas físicas e jurídicas
- Gestão por estado para cálculo correto de ICMS

### Produtos
- Cadastro de produtos com categoria
- Controle de preço de compra e venda
- Configuração de ICMS por produto

### Vendas
- Registro de vendas com múltiplos itens
- Cálculo automático de ICMS baseado no estado do cliente
- Diferentes formas de pagamento (à vista, a prazo)

### Estoque
- Controle de entrada e saída de produtos
- Inventário físico com ajuste automático
- Relatório de movimentação de estoque