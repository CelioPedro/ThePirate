# The Pirate Max - Plano de subida para producao

Este roteiro troca o foco dos testes sandbox instaveis para uma validacao produtiva controlada, com pagamento real de baixo valor, webhook publico e entrega automatica observavel.

## 1. Decisao operacional

Para o primeiro MVP, o marketplace opera com um unico vendedor: a propria conta Mercado Pago da The Pirate Max.

Ficam fora desta primeira subida:

- split de pagamento entre vendedores
- onboarding/OAuth de vendedores externos
- carteira interna
- repasse automatico

Entram nesta subida:

- catalogo e estoque reais
- checkout PIX real
- webhook produtivo
- entrega automatica de credenciais
- painel admin para acompanhamento, reposicao e diagnostico

## 2. Arquitetura de producao

Fluxo esperado:

1. cliente cria conta e faz login
2. cliente adiciona produto ao carrinho
3. backend reserva uma credencial disponivel
4. backend cria pagamento PIX no Mercado Pago via Payments API
5. frontend exibe QR Code/copia-e-cola
6. Mercado Pago confirma pagamento por webhook HTTPS
7. backend valida assinatura do webhook
8. pedido muda para `PAID`
9. worker de entrega libera a credencial
10. cliente visualiza a credencial na tela do pedido

## 3. Variaveis obrigatorias do backend

Perfil recomendado:

```powershell
-Dspring-boot.run.profiles=production
```

Variaveis:

```powershell
DB_URL=jdbc:postgresql://HOST:5432/the_pirate_max
DB_USERNAME=...
DB_PASSWORD=...

AUTH_JWT_SECRET=...
CREDENTIAL_ENCRYPTION_SECRET=...
CREDENTIAL_ENCRYPTION_KEY_VERSION=prod-aesgcm-v1

MERCADO_PAGO_ACCESS_TOKEN=APP_USR_PRODUTIVO_REAL
MERCADO_PAGO_WEBHOOK_SECRET=assinatura_secreta_produtiva
MERCADO_PAGO_NOTIFICATION_URL=https://api.seudominio.com/api/webhooks/mercadopago
MERCADO_PAGO_PIX_EXPIRATION_MINUTES=30

CORS_ALLOWED_ORIGIN_PATTERNS=https://seudominio.com
```

Nao usar em producao:

```powershell
MERCADO_PAGO_PAYER_EMAIL
MERCADO_PAGO_PAYER_FIRST_NAME
MERCADO_PAGO_WEBHOOK_SIGNATURE_VALIDATION_ENABLED=false
AUTH_ENABLED=false
```

No perfil `production`, o backend ignora comprador fixo por variavel. O pagador deve ser sempre o usuario autenticado que fez o pedido.

## 4. Mercado Pago

Configurar no painel da aplicacao produtiva:

- credenciais produtivas reais
- webhook em modo producao
- URL: `https://api.seudominio.com/api/webhooks/mercadopago`
- evento `Pagamentos`
- evento `Order (Mercado Pago)` pode continuar ativo durante a transicao, mas o fluxo principal passa a ser Payments API
- assinatura secreta copiada para `MERCADO_PAGO_WEBHOOK_SECRET`

O teste final deve ser feito com:

- conta vendedora: conta produtiva da The Pirate Max
- conta compradora: conta real diferente da vendedora
- produto de baixo valor
- pagamento PIX real

## 5. Banco de dados

Antes do primeiro teste produtivo:

- rodar migrations Flyway
- conferir tabela `products`
- conferir estoque em `credentials`
- conferir admin real
- remover ou desativar dados claramente fake se necessario

Consultas uteis:

```sql
select sku, name, price_cents, status
from products
order by name;

select p.sku, p.name, c.status, count(*)
from products p
join credentials c on c.product_id = p.id
group by p.sku, p.name, c.status
order by p.name, c.status;

select o.id, o.external_reference, o.status, o.total_cents, o.created_at,
       pay.provider_payment_id, pay.provider_status, pay.paid_at
from orders o
left join payments pay on pay.order_id = o.id
order by o.created_at desc
limit 20;
```

## 6. Checklist de deploy

- backend respondendo `/actuator/health`
- frontend apontando para API real
- CORS restrito ao dominio real
- webhook publico respondendo 200
- assinatura de webhook validada
- logs acessiveis
- admin real consegue entrar
- usuario real consegue criar conta
- checkout gera PIX real
- pedido aparece como `PENDING`
- webhook muda pedido para `PAID`
- entrega muda pedido para `DELIVERED`
- credencial aparece sem expor segredo antes da entrega

## 7. Teste produtivo controlado

1. cadastrar produto de teste barato
2. cadastrar uma credencial real ou descartavel para esse produto
3. criar usuario comprador real
4. comprar esse produto
5. copiar/pagar PIX
6. acompanhar logs:

```text
event=mercado_pago_pix_request
event=mercado_pago_pix_created
event=mercado_pago_webhook_received
event=mercado_pago_webhook_payment_fetched
event=payment_approved
event=order_delivered
```

7. confirmar no frontend:

- pedido pago
- entrega concluida
- credencial revelavel/copavel

## 8. Critérios para abrir o MVP

Abrir para usuarios reais somente quando:

- 3 compras produtivas controladas forem concluidas de ponta a ponta
- 1 compra cancelada/expirada for validada sem entrega indevida
- reposicao de estoque pelo admin estiver funcionando
- painel admin mostrar pedidos e diagnostico
- logs permitirem rastrear pagamento e entrega pelo `externalReference`

## 9. Pendencias depois da primeira subida

- melhorar reconciliacao manual de pagamentos
- tela admin de eventos/webhooks
- alerta de estoque critico
- termos de uso e politica de reembolso
- painel financeiro simples
- base para multiplos vendedores
