# The Pirate Max API

## 1. Objetivo

Este documento descreve os contratos principais de API para o MVP do `The Pirate Max`.

O foco do MVP e cobrir o fluxo essencial:

1. criar pedido
2. gerar pagamento PIX
3. receber confirmacao por webhook
4. entregar credenciais
5. permitir consulta segura pelo cliente

## 2. Convencoes Gerais

### Base path

Base sugerida:

`/api`

### Formato

- requests e responses em `application/json`
- timestamps em `ISO-8601`
- valores monetarios em centavos
- identificadores em `uuid`

### Autenticacao

Recomendacao para o MVP:

- endpoints do cliente exigem autenticacao
- endpoint de webhook nao usa autenticacao de usuario
- integridade do webhook e validada por assinatura do provedor

### Padrao de resposta de erro

Formato sugerido:

```json
{
  "error": {
    "code": "ORDER_NOT_FOUND",
    "message": "Order not found"
  }
}
```

Campos:

- `error.code`: codigo estavel para integracao
- `error.message`: mensagem legivel

## 3. Estados Expostos pela API

### `order.status`

- `PENDING`
- `PAID`
- `DELIVERY_PENDING`
- `DELIVERED`
- `DELIVERY_FAILED`
- `CANCELED`
- `REFUNDED`

### `payment.provider`

- `MERCADO_PAGO`

### `payment.method`

- `PIX`

## 4. Endpoint `POST /api/orders`

Cria um novo pedido e gera a cobranca PIX.

### Objetivo

- receber os itens do carrinho
- persistir o pedido
- criar o pagamento PIX no Mercado Pago
- devolver dados necessarios para o frontend exibir o PIX

### Autenticacao

- recomendada para usuario logado
- se compra como convidado existir, este contrato pode ganhar adaptacao futura

### Request

```json
{
  "items": [
    {
      "product_id": "6b5a7e68-8b0d-4a7f-9cd2-9c520cfaf001",
      "quantity": 1
    }
  ],
  "payment_method": "PIX"
}
```

### Regras

- `items` nao pode vir vazio
- `payment_method` deve ser `PIX` no MVP
- cada item deve referenciar um produto ativo
- no MVP, o ideal e aceitar apenas `quantity = 1`

### Response `201 Created`

```json
{
  "order": {
    "id": "ae35d1a5-0fe6-46f2-bf22-2bd8171b5d10",
    "status": "PENDING",
    "payment_method": "PIX",
    "total_cents": 2990,
    "currency": "BRL",
    "created_at": "2026-04-27T18:30:00Z"
  },
  "payment": {
    "provider": "MERCADO_PAGO",
    "method": "PIX",
    "qr_code": "000201010212...",
    "copy_paste": "000201010212...",
    "expires_at": "2026-04-27T19:00:00Z"
  }
}
```

### Erros esperados

- `400 INVALID_REQUEST`
- `404 PRODUCT_NOT_FOUND`
- `409 PRODUCT_UNAVAILABLE`
- `422 INVALID_PAYMENT_METHOD`

## 5. Endpoint `GET /api/orders`

Lista os pedidos do usuario autenticado.

### Objetivo

- exibir historico resumido de pedidos
- permitir navegacao ate o detalhe

### Autenticacao

- obrigatoria

### Response `200 OK`

```json
{
  "orders": [
    {
      "id": "ae35d1a5-0fe6-46f2-bf22-2bd8171b5d10",
      "status": "DELIVERED",
      "payment_method": "PIX",
      "total_cents": 2990,
      "currency": "BRL",
      "created_at": "2026-04-27T18:30:00Z",
      "paid_at": "2026-04-27T18:32:10Z",
      "delivered_at": "2026-04-27T18:32:18Z"
    }
  ]
}
```

### Erros esperados

- `401 UNAUTHORIZED`

## 6. Endpoint `GET /api/orders/{orderId}`

Retorna detalhes do pedido do usuario autenticado.

### Objetivo

- mostrar itens comprados
- mostrar status atual do pedido
- permitir polling simples no frontend

### Autenticacao

- obrigatoria

### Response `200 OK`

```json
{
  "order": {
    "id": "ae35d1a5-0fe6-46f2-bf22-2bd8171b5d10",
    "status": "DELIVERY_PENDING",
    "payment_method": "PIX",
    "total_cents": 2990,
    "currency": "BRL",
    "created_at": "2026-04-27T18:30:00Z",
    "paid_at": "2026-04-27T18:32:10Z",
    "delivered_at": null,
    "items": [
      {
        "id": "b2d2183b-0922-43f2-8380-a53bd76cf010",
        "product_id": "6b5a7e68-8b0d-4a7f-9cd2-9c520cfaf001",
        "product_name": "Produto X",
        "quantity": 1,
        "unit_price_cents": 2990,
        "total_price_cents": 2990
      }
    ]
  }
}
```

### Erros esperados

- `401 UNAUTHORIZED`
- `404 ORDER_NOT_FOUND`

## 7. Endpoint `GET /api/orders/{orderId}/credentials`

Retorna as credenciais entregues para um pedido.

### Objetivo

- permitir que o cliente visualize as credenciais apos entrega
- registrar trilha minima de visualizacao

### Autenticacao

- obrigatoria

### Regras

- o pedido deve pertencer ao usuario autenticado
- o pedido deve estar em `DELIVERED`
- a resposta nao deve vazar credenciais de outros itens ou pedidos
- o acesso deve ser auditado em `credential_views`

### Response `200 OK`

```json
{
  "order_id": "ae35d1a5-0fe6-46f2-bf22-2bd8171b5d10",
  "status": "DELIVERED",
  "credentials": [
    {
      "order_item_id": "b2d2183b-0922-43f2-8380-a53bd76cf010",
      "product_id": "6b5a7e68-8b0d-4a7f-9cd2-9c520cfaf001",
      "product_name": "Produto X",
      "login": "user@example.com",
      "password": "secret-password"
    }
  ]
}
```

### Erros esperados

- `401 UNAUTHORIZED`
- `403 ACCESS_DENIED`
- `404 ORDER_NOT_FOUND`
- `409 CREDENTIALS_NOT_READY`

## 8. Endpoint `POST /api/webhooks/mercadopago`

Recebe notificacoes de pagamento do Mercado Pago.

### Objetivo

- validar autenticidade do evento
- registrar o webhook recebido
- atualizar pagamento e pedido
- publicar evento para entrega

### Autenticacao

- sem autenticacao de usuario
- validacao por assinatura e regras do provedor

### Request

O payload real depende do contrato do Mercado Pago. Para o MVP, o backend deve:

- armazenar o payload bruto relevante
- extrair identificadores necessarios para correlacao
- validar assinatura antes de alterar estado financeiro

### Response `200 OK`

```json
{
  "received": true
}
```

### Regras

- o processamento deve ser idempotente
- webhooks invalidos devem ser registrados mas nao aplicados
- o pedido nao deve ser entregue diretamente no webhook
- apos confirmacao, publicar evento `OrderPaid`

### Erros esperados

- `400 INVALID_WEBHOOK`
- `401 INVALID_SIGNATURE`

Observacao:

- mesmo em cenarios invalidos, pode ser estrategico responder `200` apos registrar a tentativa, dependendo do comportamento desejado com retries do provedor

## 9. Endpoint `GET /api/orders/{orderId}/status`

Endpoint enxuto para polling do frontend.

### Objetivo

- reduzir payload quando a tela so precisa saber o estado do pedido

### Autenticacao

- obrigatoria

### Response `200 OK`

```json
{
  "order_id": "ae35d1a5-0fe6-46f2-bf22-2bd8171b5d10",
  "status": "PAID",
  "paid_at": "2026-04-27T18:32:10Z",
  "delivered_at": null
}
```

### Erros esperados

- `401 UNAUTHORIZED`
- `404 ORDER_NOT_FOUND`

## 10. Evento Interno `OrderPaid`

Evento publicado pelo backend para disparar a entrega assincrona.

### Objetivo

- desacoplar confirmacao de pagamento da entrega de credenciais

### Payload sugerido

```json
{
  "event_name": "OrderPaid",
  "event_id": "ebae0ad1-65de-42f8-922e-702b0ab2f111",
  "occurred_at": "2026-04-27T18:32:10Z",
  "order_id": "ae35d1a5-0fe6-46f2-bf22-2bd8171b5d10",
  "payment_id": "b20f4a4c-4b75-46a7-9d60-1553b4f07040",
  "user_id": "91d7f884-e6fd-4ab2-95fd-3189544b4600"
}
```

### Regras

- `event_id` deve ser unico para rastreabilidade
- o worker deve tratar repeticao do mesmo evento como caso normal

## 11. Contrato de Saida do Worker

O worker nao precisa expor API publica, mas deve obedecer regras claras de efeito.

### Ao processar com sucesso

- reservar credenciais necessarias
- associar `credential_id` aos `order_items`
- atualizar `credentials.status` para `DELIVERED`
- atualizar `orders.status` para `DELIVERED`
- registrar `delivered_at`

### Ao falhar por falta de estoque

- atualizar `orders.status` para `DELIVERY_FAILED`
- registrar motivo operacional em log ou tabela de suporte

### Ao reprocessar mensagem

- nao duplicar associacao de credenciais
- nao mudar um pedido ja entregue para estado invalido

## 12. Codigos de Erro Recomendados

- `INVALID_REQUEST`
- `UNAUTHORIZED`
- `ACCESS_DENIED`
- `ORDER_NOT_FOUND`
- `PRODUCT_NOT_FOUND`
- `PRODUCT_UNAVAILABLE`
- `INVALID_PAYMENT_METHOD`
- `INVALID_WEBHOOK`
- `INVALID_SIGNATURE`
- `CREDENTIALS_NOT_READY`
- `INTERNAL_ERROR`

## 13. Regras de Seguranca de API

- nunca retornar segredos internos do provedor de pagamento
- nunca expor credenciais sem verificar dono do pedido
- nunca registrar senha em logs
- aplicar rate limit em endpoints sensiveis
- validar ownership em qualquer endpoint com `orderId`

## 14. Sequencia Recomendada de Implementacao

1. `POST /api/orders`
2. `GET /api/orders/{orderId}`
3. `POST /api/webhooks/mercadopago`
4. evento interno `OrderPaid`
5. `GET /api/orders`
6. `GET /api/orders/{orderId}/status`
7. `GET /api/orders/{orderId}/credentials`

## 15. Proxima Etapa Recomendada

Com `api.md` definido, o documento mais util depois deste e `runbook.md`, para cobrir:

- reprocessamento de entrega
- falta de estoque
- falhas no webhook
- verificacoes operacionais
