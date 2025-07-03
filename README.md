# Software de Contabilidade

> **Projeto Acadêmico desenvolvido para a disciplina de Contabilidade Aplicada à Informática da Universidade Franciscana (UFN)** - Sistema de gestão contábil para controle de vendas, estoque, clientes e produtos, com cálculo automático de ICMS baseado no estado do cliente.

## Sobre o Projeto
Este sistema foi desenvolvido como trabalho prático da disciplina **Contabilidade Aplicada à Informática** do curso de Sistemas de Informação da **UFN (Universidade Franciscana)**. 

O projeto implementa conceitos contábeis fundamentais como:
- Cálculo de ICMS interestadual
- Controle de patrimônio e depreciação
- Balanço patrimonial
- Gestão de estoques e movimentações

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

1. Inicie o servidor Django (com o ambiente virtual ativado):
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
├── contabilidade/               # Backend Django (API)
│   ├── .env                    # Variáveis de ambiente (não versionado)
│   ├── .env.example            # Template das variáveis de ambiente
│   ├── manage.py               # Script de gerenciamento Django
│   ├── db.sqlite3              # Banco de dados SQLite
│   ├── utils.py                # Utilitários compartilhados
│   ├── contabilidade/          # Configurações principais do Django
│   │   ├── settings.py         # Configurações do projeto
│   │   ├── urls.py             # URLs principais
│   │   └── wsgi.py             # Configuração WSGI
│   ├── clientes/               # App de clientes e fornecedores
│   │   ├── models.py           # Modelos de dados
│   │   ├── views.py            # Views/APIs
│   │   ├── urls.py             # URLs específicas
│   │   └── migrations/         # Migrações do banco
│   ├── produtos/               # App de produtos
│   │   ├── models.py
│   │   ├── views.py
│   │   └── ...
│   ├── vendas/                 # App de vendas
│   │   ├── models.py
│   │   ├── views.py
│   │   └── ...
│   ├── estoque/                # App de controle de estoque
│   │   ├── models.py
│   │   ├── views.py
│   │   └── ...
│   ├── patrimonio/             # App de patrimônio
│   │   ├── models.py
│   │   ├── views.py
│   │   └── ...
│   ├── compras/                # App de compras
│   │   ├── models.py
│   │   ├── views.py
│   │   └── ...
│   └── core/                   # Funcionalidades centrais
│       ├── api.py              # APIs centrais
│       ├── middleware.py       # Middlewares personalizados
│       └── ...
├── frontend/                   # Frontend React
│   ├── public/
│   │   ├── index.html
│   │   └── manifest.json
│   ├── src/
│   │   ├── App.js              # Componente principal
│   │   ├── App.css             # Estilos principais
│   │   ├── index.js            # Ponto de entrada
│   │   ├── components/         # Componentes React
│   │   │   ├── vendas/         # Componentes de vendas
│   │   │   ├── clientes/       # Componentes de clientes
│   │   │   ├── produtos/       # Componentes de produtos
│   │   │   ├── estoque/        # Componentes de estoque
│   │   │   ├── patrimonio/     # Componentes de patrimônio
│   │   │   ├── compras/        # Componentes de compras
│   │   │   └── relatorios/     # Componentes de relatórios
│   │   └── services/           # Serviços de API
│   │       ├── api.js          # Configuração principal da API
│   │       └── patrimonioService.js # Serviços específicos
│   └── package.json            # Dependências Node.js
├── requirements.txt            # Dependências Python
├── reset_db.py                 # Script para popular banco com dados de teste
├── .gitignore                  # Arquivos ignorados pelo Git
└── README.md                   # Este arquivo
```

## 🎯 Funcionalidades Principais

### 👥 Gestão de Clientes e Fornecedores
- ✅ Cadastro de pessoas físicas e jurídicas
- ✅ Controle por estado para cálculo correto de ICMS interestadual
- ✅ Validação de CPF/CNPJ
- ✅ Endereçamento completo com cidade e estado

### 📦 Controle de Produtos
- ✅ Cadastro com código, nome, categoria e descrição
- ✅ Controle de preços de compra e venda
- ✅ Configuração de alíquota ICMS por produto
- ✅ Cálculo automático de margem de lucro

### 🛒 Sistema de Vendas
- ✅ Vendas com múltiplos itens
- ✅ Cálculo automático de ICMS por estado do cliente
- ✅ Suporte a vendas à vista e a prazo
- ✅ Finalização e cancelamento de vendas
- ✅ Histórico completo de vendas

### 📊 Controle de Estoque
- ✅ Movimentações de entrada e saída automáticas
- ✅ Inventário físico com ajustes
- ✅ Relatórios de movimentação detalhados
- ✅ Alertas de estoque baixo

### 🏢 Gestão Patrimonial
- ✅ Cadastro de bens patrimoniais por categoria
- ✅ Controle de depreciação automática
- ✅ Registro de aquisições e baixas
- ✅ Cálculo de valor atual dos bens

### 💰 Controle Financeiro
- ✅ Registro de capital social
- ✅ Balanço patrimonial automatizado
- ✅ Contas a pagar (fornecedores)
- ✅ Controle de compras de mercadorias

### 📈 Relatórios e Dashboard
- ✅ Dashboard com indicadores de performance
- ✅ Balanço patrimonial completo
- ✅ Relatórios de vendas por período
- ✅ Análise de lucratividade

## 🛠️ Tecnologias Utilizadas

### Backend
- **Django 4.2** - Framework web Python
- **Django REST Framework 3.14** - Para criação de APIs REST
- **Python Decouple 3.8** - Gerenciamento de variáveis de ambiente
- **SQLite** - Banco de dados (desenvolvimento)
- **Python 3.12** - Linguagem de programação

### Frontend
- **React 18** - Biblioteca JavaScript para UI
- **React Router DOM 6** - Roteamento no frontend
- **Bootstrap 5** - Framework CSS responsivo
- **Axios** - Cliente HTTP para consumir APIs
- **FontAwesome** - Ícones e símbolos
- **Node.js 16+** - Ambiente de execução JavaScript

## 🔧 Configuração de Ambiente

### Variáveis de Ambiente

O projeto utiliza `python-decouple` para gerenciar variáveis de ambiente de forma segura:

1. **Copie o arquivo de exemplo:**
   ```bash
   cd contabilidade
   cp .env.example .env
   ```

2. **Configure suas variáveis no arquivo `.env`:**
   ```env
   SECRET_KEY=sua-chave-secreta-aqui
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   CSRF_TRUSTED_ORIGINS=http://localhost:8000,http://localhost:3000
   ```

3. **Gere uma nova SECRET_KEY (recomendado):**
   ```python
   from django.core.management.utils import get_random_secret_key
   print(get_random_secret_key())
   ```

### Segurança
- ✅ Use o arquivo `.env.example` como template
- ✅ Gere uma SECRET_KEY única para produção
- ✅ Configure DEBUG=False em produção

## 🔗 Principais Endpoints da API

### Vendas
- `GET /api/vendas/` - Listar todas as vendas
- `POST /api/vendas/criar/` - Criar nova venda
- `GET /api/vendas/{id}/` - Detalhes de uma venda
- `POST /api/vendas/{id}/finalizar/` - Finalizar venda

### Clientes
- `GET /api/clientes/` - Listar clientes
- `POST /api/clientes/criar/` - Criar novo cliente
- `GET /api/clientes/{id}/` - Detalhes do cliente

### Produtos
- `GET /api/produtos/` - Listar produtos
- `POST /api/produtos/criar/` - Criar novo produto
- `GET /api/produtos/{id}/` - Detalhes do produto

### Estoque
- `GET /api/estoque/movimentacoes/` - Movimentações de estoque
- `POST /api/estoque/movimentacao/criar/` - Nova movimentação

### Patrimônio
- `GET /api/patrimonio/api/capital-social/` - Capital social
- `GET /api/patrimonio/api/bens-patrimoniais/` - Bens patrimoniais
- `GET /api/patrimonio/api/balanco-patrimonial/` - Balanço patrimonial

### Dashboard
- `GET /api/dashboard/` - Dados do dashboard

## 📄 Licença

Este projeto é desenvolvido para fins acadêmicos e educacionais.

---