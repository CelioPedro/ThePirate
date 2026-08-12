# Arquitetura

Este documento resume a arquitetura atual do The Pirate Max para leitura de portfolio e manutencao tecnica.

## Visao geral

```mermaid
flowchart TD
    %% ATORES
    subgraph Users ["🧑‍💻 Atores (Classes de Usuários)"]
        direction LR
        Buyer(("🛒 Cliente\n(Comprador)"))
        Admin(("🛡️ Admin\n(Operação Master)"))
        Seller(("🏪 Vendedor\n(Futuro)"))
    end

    %% FRONTEND
    subgraph Vercel ["⚡ Vercel (Frontend Hosting)"]
        direction LR
        UI_Buyer["⚛️ App Cliente\n(Loja e Pedidos)"]
        UI_Admin["⚛️ Painel Admin\n(Gestão Geral)"]
        UI_Seller["⚛️ Painel Vendedor\n(Futuro)"]
    end

    %% BACKEND & INFRA
    subgraph OracleVM ["☁️ Oracle Cloud VM (Infraestrutura)"]
        Nginx["🌐 Nginx\n(Proxy / HTTPS)"]
        
        subgraph Docker ["🐳 Container Docker (Monolito)"]
            API["☕ API REST (Spring Boot)\nPedidos, Auth, Catálogo"]
            Scanner["⚙️ Scheduled Scanner\n(MVP: Entrega Interna)"]
            Worker["⚙️ Background Worker\n(Futuro: Desacoplado)"]
        end
        
        Redis[("🟥 Redis\n(Fila Futura)")]
    end

    %% DADOS
    subgraph Data ["🐘 Neon Serverless"]
        DB[("PostgreSQL\n(Dados & Flyway)")]
    end

    %% INTEGRAÇÕES
    subgraph Integrations ["🔌 Integrações Externas"]
        direction LR
        MercadoPago["💳 Mercado Pago\n(MVP: PIX Direto)"]
        MPSplit["💳 MP Marketplace\n(Futuro: Split)"]
        Email["📧 Serviço SMTP\n(Futuro)"]
    end

    %% FLUXOS E RELACIONAMENTOS
    Buyer --> UI_Buyer
    Admin --> UI_Admin
    Seller -.-> UI_Seller
    
    UI_Buyer --> Nginx
    UI_Admin --> Nginx
    UI_Seller -.-> Nginx
    
    Nginx --> API
    
    API -->|Persiste| DB
    Scanner -->|Varre Pendentes| DB
    
    API -.->|Envia p/ Fila| Redis
    Redis -.->|Consome| Worker
    Worker -.->|Conclui| DB
    Worker -.->|Notifica| Email
    
    API <-->|Cobrança e Webhooks| MercadoPago
    API -.->|Repasse| MPSplit

    %% ESTILOS (Fundo transparente)
    style Users fill:transparent,stroke:#555,stroke-width:2px,stroke-dasharray: 5 5
    style Vercel fill:transparent,stroke:#555,stroke-width:2px,stroke-dasharray: 5 5
    style OracleVM fill:transparent,stroke:#555,stroke-width:2px,stroke-dasharray: 5 5
    style Docker fill:transparent,stroke:#555,stroke-width:2px,stroke-dasharray: 5 5
    style Data fill:transparent,stroke:#555,stroke-width:2px,stroke-dasharray: 5 5
    style Integrations fill:transparent,stroke:#555,stroke-width:2px,stroke-dasharray: 5 5
```

## Frontend

O frontend principal fica em `frontend-app/`.

Responsabilidades:

- renderizar catalogo, categorias e detalhes de produto;
- gerenciar sessao de usuario;
- manter carrinho;
- criar pedidos;
- exibir pedidos do cliente;
- fornecer painel administrativo para operacao interna.

Stack:

- React;
- Vite;
- TypeScript;
- React Router;
- assets otimizados em WebP.

## Backend

O backend fica em `backend/` e usa Spring Boot.

Responsabilidades:

- autenticacao e autorizacao;
- catalogo de produtos;
- criacao e consulta de pedidos;
- controle de estoque de credenciais;
- operacoes administrativas;
- integracao de pagamento;
- webhook de pagamento;
- migracoes de schema com Flyway.

Camadas principais:

- `api`: controllers e contratos HTTP;
- `domain`: entidades e enums de negocio;
- `repository`: persistencia via Spring Data JPA;
- `service`: regras de negocio;
- `config` e `security`: configuracao, CORS, JWT e filtros.

## Banco de dados

O projeto usa PostgreSQL, com migracoes versionadas em `backend/src/main/resources/db/migration`.

Entidades centrais:

- usuarios;
- produtos;
- categorias;
- pedidos;
- itens de pedido;
- pagamentos;
- credenciais;
- registros de auditoria.

## Infraestrutura

O modelo de deploy atual usa:

- Vercel para o frontend;
- Oracle Cloud VM para o backend;
- Docker para empacotar a API;
- Nginx como reverse proxy;
- Certbot/Let's Encrypt para HTTPS;
- Neon PostgreSQL como banco remoto.

## Fluxo de compra

```text
Cliente acessa o catalogo
  -> adiciona produtos ao carrinho
  -> cria conta ou faz login
  -> cria pedido
  -> pedido reserva ou referencia estoque
  -> pagamento e iniciado
  -> webhook confirma pagamento
  -> backend entrega credenciais
  -> cliente consulta pedido e credenciais
```

## Pontos de atencao

- O webhook de pagamento precisa ser validado em ambiente definitivo antes de venda real.
- Credenciais e segredos nao devem aparecer em logs, commits ou mensagens de erro.
- Operacoes administrativas devem manter auditoria.
- Backup e observabilidade ainda devem ser fortalecidos para operacao real.

