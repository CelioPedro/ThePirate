# The Pirate Max - Checklist de Producao

## Objetivo

Este documento organiza os passos para levar o MVP do The Pirate Max para producao com um unico vendedor.

O foco agora e publicar uma operacao simples, rastreavel e segura:

1. catalogo gerenciado pelo admin
2. estoque de credenciais controlado pelo admin
3. checkout Pix via Mercado Pago
4. webhook publico HTTPS
5. entrega automatica depois de pagamento aprovado
6. credenciais protegidas e auditadas

Multi-vendedor, split de pagamento, repasse e onboarding de vendedores ficam fora desta primeira subida.

## Decisao de escopo do MVP

### Dentro do MVP de producao

- Um unico operador/vendedor responsavel por catalogo, estoque e suporte.
- Uma unica conta Mercado Pago recebedora.
- Produtos digitais entregues por credencial.
- Admin interno para produto, estoque, pedidos e diagnostico.
- Autenticacao obrigatoria.
- PostgreSQL persistente.
- Redis para fila de entrega.
- Flyway para schema.

### Fora do MVP de producao

- Cadastro publico de vendedores.
- Split de pagamento.
- Carteira interna.
- Saque para vendedores.
- Reembolso automatico.
- KYC ou verificacao formal de vendedores.
- Painel financeiro completo.

## Ambientes

### Local fake

Uso: desenvolvimento rapido sem chamar Mercado Pago.

Perfil recomendado:

```powershell
mvn -f backend\pom.xml spring-boot:run "-Dspring-boot.run.profiles=local"
```

Caracteristicas:

- banco H2 em memoria
- pagamento fake
- dados descartaveis
- sem webhook publico

### Local com PostgreSQL

Uso: desenvolvimento realista com banco persistente local.

Perfil recomendado:

```powershell
mvn -f backend\pom.xml spring-boot:run "-Dspring-boot.run.profiles=postgres-local"
```

Caracteristicas:

- PostgreSQL local
- Flyway ativo
- seed de desenvolvimento ativo
- autenticacao ativa
- pode usar Mercado Pago fake ou real por variavel

### Sandbox Mercado Pago

Uso: validar Pix real de teste com webhook via ngrok/cloudflared.

Obrigatorio:

- `MERCADO_PAGO_GATEWAY=real`
- `MERCADO_PAGO_ACCESS_TOKEN` de teste
- webhook publico apontando para `/api/webhooks/mercadopago`
- conta compradora de teste diferente da conta vendedora de teste

### Producao

Uso: operacao real com dinheiro real.

Perfil recomendado:

```powershell
mvn -f backend\pom.xml spring-boot:run "-Dspring-boot.run.profiles=production"
```

Caracteristicas:

- PostgreSQL persistente
- Flyway ativo
- seed de desenvolvimento desligado
- usuarios dev nao sao criados
- autenticacao obrigatoria
- CORS restrito ao dominio real
- Mercado Pago real
- webhook HTTPS real

## Variaveis obrigatorias em producao

### Banco

```powershell
$env:DB_URL="jdbc:postgresql://HOST:5432/the_pirate_max"
$env:DB_USERNAME="..."
$env:DB_PASSWORD="..."
```

### Redis

```powershell
$env:REDIS_HOST="..."
$env:REDIS_PORT="6379"
$env:REDIS_PASSWORD="..."
```

### Autenticacao

```powershell
$env:AUTH_JWT_SECRET="uma-chave-longa-e-secreta"
$env:AUTH_JWT_EXPIRATION_HOURS="24"
```

Regra: `AUTH_JWT_SECRET` nao pode ser o valor local padrao do projeto.

### Primeiro admin real

O projeto nao deve depender dos usuarios dev em producao. Para criar o primeiro admin real, use o bootstrap temporario:

```powershell
$env:INITIAL_ADMIN_ENABLED="true"
$env:INITIAL_ADMIN_EMAIL="seu-email-admin@dominio.com"
$env:INITIAL_ADMIN_PASSWORD="uma-senha-forte-com-12-ou-mais-caracteres"
$env:INITIAL_ADMIN_NAME="Nome do Admin"
```

Regras:

- o bootstrap so roda se `INITIAL_ADMIN_ENABLED=true`
- ele so cria usuario se ainda nao existir nenhum `ADMIN`
- a senha precisa ter pelo menos 12 caracteres
- depois que o admin for criado, desligue `INITIAL_ADMIN_ENABLED`

Fluxo recomendado:

1. subir o backend em producao com `INITIAL_ADMIN_ENABLED=true`
2. confirmar no log `event=initial_admin_created`
3. testar login no frontend
4. trocar `INITIAL_ADMIN_ENABLED=false`
5. reiniciar o backend

### Criptografia de credenciais

```powershell
$env:CREDENTIAL_ENCRYPTION_SECRET="uma-chave-longa-e-secreta-para-credenciais"
$env:CREDENTIAL_ENCRYPTION_KEY_VERSION="prod-aesgcm-v1"
```

Regra: trocar essa chave depois que existirem credenciais reais exige plano de rotacao. Nao alterar casualmente em producao.

### Mercado Pago

```powershell
$env:MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
$env:MERCADO_PAGO_WEBHOOK_SECRET="..."
$env:MERCADO_PAGO_NOTIFICATION_URL="https://seu-dominio.com/api/webhooks/mercadopago"
$env:MERCADO_PAGO_PIX_EXPIRATION_MINUTES="30"
```

No perfil `production`, o gateway ja fica como `real`.

### CORS

```powershell
$env:CORS_ALLOWED_ORIGIN_PATTERNS="https://seu-dominio.com"
```

Em local o projeto aceita `*` por praticidade. Em producao, usar apenas o dominio real do frontend.

## Frontend

Build de producao:

```powershell
cd frontend-app
npm run build
```

O diretorio publicado e:

```text
frontend-app/dist
```

Antes de publicar:

- confirmar URL real da API no campo/configuracao usada pelo frontend
- testar login
- testar catalogo
- testar carrinho
- testar pedido
- testar pagina de pedido
- testar painel admin

## Backend

Build/teste:

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-24"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
mvn -f backend\pom.xml test
```

Subida de producao:

```powershell
$env:SPRING_PROFILES_ACTIVE="production"
mvn -f backend\pom.xml spring-boot:run
```

Em servidor real, o ideal e empacotar e rodar o `.jar` com variaveis de ambiente do provedor, nao depender do terminal aberto.

## Webhook Mercado Pago

URL esperada:

```text
https://seu-dominio.com/api/webhooks/mercadopago
```

Checklist:

- URL usa HTTPS.
- URL aponta para o backend, nao para o frontend.
- Evento de pagamentos/order esta habilitado no painel Mercado Pago.
- Assinatura secreta preenchida em `MERCADO_PAGO_WEBHOOK_SECRET`.
- Backend responde `200` para webhooks validos.
- Webhook duplicado nao duplica entrega.

## Validacao ponta a ponta antes de vender

1. Criar ou revisar produto ativo no admin.
2. Adicionar pelo menos uma credencial valida no estoque.
3. Criar usuario cliente comum.
4. Fazer pedido Pix.
5. Confirmar que o pedido fica `PENDING`.
6. Pagar Pix em ambiente correto.
7. Confirmar webhook recebido.
8. Confirmar pagamento `PAID`.
9. Confirmar entrega `DELIVERED`.
10. Confirmar que cliente ve credencial entregue.
11. Confirmar que admin ve o pedido no painel.
12. Confirmar que revelar/copiar credencial admin grava auditoria.

## Consultas SQL uteis

Pedidos recentes:

```sql
select id, external_reference, status, total_cents, created_at, paid_at, delivered_at, failure_reason
from orders
order by created_at desc
limit 20;
```

Pagamentos recentes:

```sql
select provider, provider_status, provider_payment_id, pix_expires_at, paid_at, created_at
from payments
order by created_at desc
limit 20;
```

Estoque por produto:

```sql
select p.sku, p.name, c.status, count(*) as total
from credentials c
join products p on p.id = c.product_id
group by p.sku, p.name, c.status
order by p.sku, c.status;
```

Auditoria de acesso a credenciais:

```sql
select a.accessed_at, u.email as admin_email, p.sku, a.action, a.ip_address
from admin_credential_access_logs a
join users u on u.id = a.admin_user_id
join credentials c on c.id = a.credential_id
join products p on p.id = c.product_id
order by a.accessed_at desc
limit 50;
```

## Bloqueadores antes de producao real

- Definir dominio real.
- Definir hospedagem do backend.
- Definir hospedagem do frontend.
- Definir banco PostgreSQL gerenciado ou servidor proprio.
- Definir Redis gerenciado ou servidor proprio.
- Configurar Mercado Pago em producao.
- Configurar webhook HTTPS real.
- Criar conta admin real com senha forte.
- Desligar `INITIAL_ADMIN_ENABLED` depois da criacao do admin real.
- Revisar textos legais minimos: termos, privacidade, politica de entrega e suporte.

## Ordem recomendada de execucao

1. Escolher dominio e hospedagem.
2. Provisionar PostgreSQL e Redis.
3. Subir backend com profile `production`.
4. Rodar Flyway e validar tabelas.
5. Criar admin real.
6. Configurar Mercado Pago producao.
7. Configurar webhook real.
8. Publicar frontend.
9. Rodar compra teste de baixo valor.
10. Conferir banco, painel admin e entrega.
11. Abrir para primeiros usuarios.
