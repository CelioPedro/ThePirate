# Mercado Pago - Plano de Integracao

Este documento descreve como o The Pirate Max deve integrar pagamento real com Mercado Pago no MVP, mantendo o fluxo local de desenvolvimento funcional.

## Objetivo do MVP

Aceitar pagamento via Pix para produtos digitais, confirmar o pagamento por webhook e liberar a entrega automatica da credencial somente depois da confirmacao do provedor.

## Decisao de arquitetura

Usaremos Checkout Transparente com Orders API do Mercado Pago, com Pix como primeiro metodo de pagamento.

O frontend nunca fala diretamente com o Mercado Pago. O fluxo seguro e:

1. Frontend cria pedido no backend.
2. Backend reserva uma credencial disponivel.
3. Backend cria uma ordem Pix no Mercado Pago.
4. Backend salva QR Code, copia-e-cola, status e identificador do provedor.
5. Frontend exibe o Pix ao cliente.
6. Mercado Pago envia webhook para o backend.
7. Backend valida e processa o evento.
8. Pedido aprovado dispara entrega de credencial.
9. Pedido expirado/cancelado libera reserva.

## Variaveis de ambiente

Obrigatorias para uso real:

```powershell
$env:MERCADO_PAGO_GATEWAY="real"
$env:MERCADO_PAGO_ACCESS_TOKEN="APP_USR-..."
```

Opcionais:

```powershell
$env:MERCADO_PAGO_BASE_URL="https://api.mercadopago.com"
$env:MERCADO_PAGO_WEBHOOK_SECRET="..."
$env:MERCADO_PAGO_NOTIFICATION_URL="https://seu-dominio.com/api/webhooks/mercadopago"
$env:MERCADO_PAGO_PIX_EXPIRATION_MINUTES="30"
```

Para desenvolvimento local sem chamar o Mercado Pago:

```powershell
$env:MERCADO_PAGO_GATEWAY="fake"
```

## Conta Mercado Pago

Para o MVP, a conta recomendada e uma unica conta Mercado Pago operando como recebedora principal da loja.

Isso simplifica:

- recebimento
- conciliacao
- suporte
- entrega automatica
- auditoria

O modelo marketplace, em que cada vendedor recebe diretamente, deve ficar para uma fase posterior. Ele exige onboarding de vendedores, autorizacao/OAuth, possivel split, regras de repasse e conciliacao por vendedor.

## Tabelas envolvidas

### orders

Guarda o pedido do cliente e seu estado de negocio:

- `PENDING`
- `PAID`
- `DELIVERED`
- `CANCELED`
- `DELIVERY_FAILED`

### order_items

Liga pedido, produto e credencial reservada.

### payments

Guarda o estado do provedor:

- `provider`
- `provider_payment_id`
- `provider_status`
- `pix_qr_code`
- `pix_copy_paste`
- `pix_expires_at`
- `paid_at`
- `provider_payload`

### webhook_events

Garante idempotencia e auditoria dos eventos recebidos.

## Status esperados do Mercado Pago

Status importantes para o MVP:

- `pending`: pagamento aguardando
- `approved`: pagamento aprovado
- `rejected`: pagamento rejeitado
- `cancelled`/`canceled`: pagamento cancelado
- `expired`: Pix expirado

Somente `approved` pode disparar entrega.

## Webhook

Endpoint local:

```http
POST /api/webhooks/mercadopago
```

Em producao, o Mercado Pago precisa chamar uma URL publica HTTPS. Localhost nao funciona diretamente. Para desenvolvimento, usar uma ponte publica como ngrok ou cloudflared.

No Checkout Transparente via Orders, a URL de webhook deve ser cadastrada no painel da aplicacao Mercado Pago em Webhooks. A Orders API rejeita `notification_url` dentro do payload de criacao da order.

O webhook deve:

1. Registrar o evento bruto.
2. Ignorar duplicados ja processados.
3. Localizar o pedido por `external_reference`.
4. Atualizar o pagamento.
5. Marcar pedido como pago quando status for `approved`.
6. Disparar entrega.

## Operacao segura

Regras importantes:

- O access token nunca deve ir para o frontend.
- A entrega nunca deve depender de botao no frontend.
- Webhook duplicado deve ser seguro.
- Aprovacao depois da expiracao deve ser tratada sem entregar pedido cancelado.
- Pedido sem estoque nao deve criar pagamento real.
- Credencial reservada deve ser liberada quando o pedido expirar.

## Implementacao atual

O backend tem dois gateways Pix:

- `fake`: padrao para desenvolvimento local.
- `real`: chama o Mercado Pago quando `MERCADO_PAGO_GATEWAY=real`.

O gateway real cria uma ordem Pix usando o `external_reference` do pedido. A resposta do provedor e guardada em `payments.provider_payload`, e os dados de Pix retornam para o frontend pelo fluxo ja existente.

## Proximos passos antes de producao

1. Criar app no painel do Mercado Pago.
2. Gerar access token de teste.
3. Configurar conta/chave Pix.
4. Expor webhook local com HTTPS publico.
5. Testar criacao de Pix real em ambiente de teste.
6. Testar webhook real.
7. Confirmar prazos, tarifas e regras da conta Mercado Pago.
8. Trocar credenciais de teste por producao somente depois do fluxo completo validado.
