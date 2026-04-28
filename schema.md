# The Pirate Max Schema

## 1. Objetivo

Este documento define a modelagem de dados recomendada para o MVP do `The Pirate Max`.

O objetivo e suportar com seguranca e consistencia o fluxo de:

1. criacao de pedido
2. pagamento via PIX
3. confirmacao por webhook
4. entrega assincrona de credenciais
5. consulta segura pelo cliente

## 2. Premissas de Modelagem

- banco relacional como fonte oficial de verdade
- `Redis` usado apenas para fila/eventos
- credenciais armazenadas criptografadas em repouso
- webhook e worker precisam ser idempotentes
- o sistema deve permitir auditoria minima de pagamento e entrega

## 3. Entidades Principais

Para o MVP, a modelagem recomendada inclui:

- `users`
- `products`
- `credentials`
- `orders`
- `order_items`
- `payments`
- `webhook_events`
- `credential_views`

As duas ultimas tabelas sao fortemente recomendadas para confiabilidade e auditoria.

## 4. Tabela `users`

Representa o cliente autenticado no sistema.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `email`: `varchar`, unico, obrigatorio
- `password_hash`: `varchar`, obrigatorio se houver login por senha
- `name`: `varchar`, opcional
- `status`: `varchar`, obrigatorio
- `created_at`: `timestamp`, obrigatorio
- `updated_at`: `timestamp`, obrigatorio

Estados recomendados para `status`:

- `ACTIVE`
- `BLOCKED`
- `PENDING_VERIFICATION`

Observacoes:

- se o MVP comecar com compra como convidado, ainda vale manter esta tabela prevista
- `email` deve ter indice unico

## 5. Tabela `products`

Representa os itens comercializados.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `sku`: `varchar`, unico, obrigatorio
- `slug`: `varchar`, unico, obrigatorio
- `name`: `varchar`, obrigatorio
- `description`: `text`, opcional
- `category`: `varchar`, obrigatorio
- `provider`: `varchar`, obrigatorio
- `status`: `varchar`, obrigatorio
- `price_cents`: `bigint`, obrigatorio
- `currency`: `varchar(3)`, obrigatorio
- `region_code`: `varchar`, obrigatorio
- `duration_days`: `integer`, obrigatorio
- `delivery_type`: `varchar`, obrigatorio
- `requires_stock`: `boolean`, obrigatorio
- `fulfillment_notes`: `text`, opcional
- `created_at`: `timestamp`, obrigatorio
- `updated_at`: `timestamp`, obrigatorio

Estados recomendados para `status`:

- `ACTIVE`
- `INACTIVE`
- `ARCHIVED`

Valores recomendados para `delivery_type`:

- `CREDENTIAL`

Valores recomendados para `category`:

- `STREAMING`

Valores recomendados para `provider` no catalogo inicial:

- `NETFLIX`
- `PARAMOUNT_PLUS`
- `DISNEY_PLUS`

Observacoes:

- `price_cents` evita problemas de arredondamento
- `sku` deve ser usado como referencia operacional humana
- `slug` ajuda no catalogo, na navegacao e em futuras rotas publicas
- `duration_days` deixa explicita a vigencia operacional da oferta

## 6. Tabela `credentials`

Representa as credenciais de acesso associadas a um produto.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `product_id`: `uuid`, chave estrangeira para `products.id`
- `login_encrypted`: `text`, obrigatorio
- `password_encrypted`: `text`, obrigatorio
- `encryption_key_version`: `varchar`, obrigatorio
- `status`: `varchar`, obrigatorio
- `source_batch`: `varchar`, opcional
- `reserved_at`: `timestamp`, opcional
- `delivered_at`: `timestamp`, opcional
- `created_at`: `timestamp`, obrigatorio
- `updated_at`: `timestamp`, obrigatorio

Estados recomendados para `status`:

- `AVAILABLE`
- `RESERVED`
- `DELIVERED`
- `INVALID`

Observacoes:

- nao armazenar login e senha em texto puro
- `reserved_at` ajuda a investigar entregas travadas
- cada credencial pertence a um unico produto

Indices recomendados:

- indice por `product_id`
- indice por `status`
- indice composto por `product_id, status`

## 7. Tabela `orders`

Representa o pedido do cliente.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `user_id`: `uuid`, chave estrangeira para `users.id`
- `status`: `varchar`, obrigatorio
- `payment_method`: `varchar`, obrigatorio
- `subtotal_cents`: `bigint`, obrigatorio
- `total_cents`: `bigint`, obrigatorio
- `currency`: `varchar(3)`, obrigatorio
- `external_reference`: `varchar`, unico, obrigatorio
- `paid_at`: `timestamp`, opcional
- `delivered_at`: `timestamp`, opcional
- `canceled_at`: `timestamp`, opcional
- `created_at`: `timestamp`, obrigatorio
- `updated_at`: `timestamp`, obrigatorio

Estados recomendados para `status`:

- `PENDING`
- `PAID`
- `DELIVERY_PENDING`
- `DELIVERED`
- `DELIVERY_FAILED`
- `CANCELED`
- `REFUNDED`

Valores recomendados para `payment_method`:

- `PIX`

Observacoes:

- `external_reference` deve ser enviado ao provedor de pagamento para correlacao
- `subtotal_cents` e `total_cents` podem ser iguais no MVP

Indices recomendados:

- indice por `user_id`
- indice por `status`
- indice por `created_at`
- indice unico por `external_reference`

## 8. Tabela `order_items`

Representa cada item comprado dentro do pedido.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `order_id`: `uuid`, chave estrangeira para `orders.id`
- `product_id`: `uuid`, chave estrangeira para `products.id`
- `credential_id`: `uuid`, chave estrangeira para `credentials.id`, opcional ate a entrega
- `quantity`: `integer`, obrigatorio
- `unit_price_cents`: `bigint`, obrigatorio
- `total_price_cents`: `bigint`, obrigatorio
- `created_at`: `timestamp`, obrigatorio
- `updated_at`: `timestamp`, obrigatorio

Observacoes:

- para credenciais unitarias, o MVP funciona melhor com `quantity = 1`
- se um pedido puder comprar mais de uma unidade do mesmo produto, talvez seja melhor expandir em multiplas linhas de item ao inves de usar quantidade agregada
- `credential_id` deve ser unico quando preenchido, para impedir reutilizacao da mesma credencial em dois itens

Indices recomendados:

- indice por `order_id`
- indice por `product_id`
- indice unico parcial ou equivalente por `credential_id`

## 9. Tabela `payments`

Representa a tentativa e a confirmacao do pagamento.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `order_id`: `uuid`, chave estrangeira para `orders.id`
- `provider`: `varchar`, obrigatorio
- `provider_payment_id`: `varchar`, opcional antes da confirmacao, unico quando existir
- `provider_status`: `varchar`, opcional
- `payment_method`: `varchar`, obrigatorio
- `amount_cents`: `bigint`, obrigatorio
- `currency`: `varchar(3)`, obrigatorio
- `pix_qr_code`: `text`, opcional
- `pix_copy_paste`: `text`, opcional
- `provider_payload`: `text` ou `json`, opcional
- `paid_at`: `timestamp`, opcional
- `created_at`: `timestamp`, obrigatorio
- `updated_at`: `timestamp`, obrigatorio

Valores recomendados para `provider`:

- `MERCADO_PAGO`

Valores recomendados para `payment_method`:

- `PIX`

Observacoes:

- `provider_payload` deve excluir segredos e ser usado com parcimonia
- uma abordagem simples para o MVP e ter um `payment` principal por pedido

Indices recomendados:

- indice por `order_id`
- indice unico por `provider_payment_id` quando nao nulo
- indice por `provider_status`

## 10. Tabela `webhook_events`

Registra webhooks recebidos para auditoria e idempotencia.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `provider`: `varchar`, obrigatorio
- `event_type`: `varchar`, opcional
- `provider_event_id`: `varchar`, opcional
- `signature_valid`: `boolean`, obrigatorio
- `payload`: `text` ou `json`, obrigatorio
- `processed`: `boolean`, obrigatorio
- `processed_at`: `timestamp`, opcional
- `created_at`: `timestamp`, obrigatorio

Observacoes:

- se o Mercado Pago fornecer identificador unico de evento, ele deve ser indexado
- essa tabela ajuda a investigar repeticoes, fraude e falhas de processamento

Indices recomendados:

- indice por `provider`
- indice por `provider_event_id`
- indice por `processed`

## 11. Tabela `credential_views`

Auditoria minima de acesso as credenciais pelo cliente.

Campos recomendados:

- `id`: `uuid`, chave primaria
- `user_id`: `uuid`, chave estrangeira para `users.id`
- `order_id`: `uuid`, chave estrangeira para `orders.id`
- `order_item_id`: `uuid`, chave estrangeira para `order_items.id`
- `viewed_at`: `timestamp`, obrigatorio
- `ip_address`: `varchar`, opcional
- `user_agent`: `varchar`, opcional

Observacoes:

- esta tabela nao substitui logs, mas cria uma trilha de auditoria util

Indices recomendados:

- indice por `user_id`
- indice por `order_id`
- indice por `viewed_at`

## 12. Relacionamentos

Relacionamentos principais:

- um `user` possui muitos `orders`
- um `order` possui muitos `order_items`
- um `order` possui um ou mais `payments`
- um `product` possui muitas `credentials`
- um `order_item` referencia um `product`
- um `order_item` pode receber uma `credential`
- um `order` pode ter muitos `webhook_events` indiretamente relacionados pelo pagamento
- um `order_item` pode gerar muitos `credential_views`

## 13. Regras de Integridade

Estas regras deveriam existir no codigo e, quando possivel, no banco:

- `orders.total_cents` deve ser igual a soma de `order_items.total_price_cents`
- `payments.amount_cents` deve ser igual ao valor do pedido no fluxo normal
- `order_items.credential_id` nao pode apontar para credencial de outro produto
- uma `credential` com status `DELIVERED` nao pode voltar para `AVAILABLE`
- uma `credential` nao pode ser associada a mais de um `order_item`
- um `order` so pode virar `DELIVERED` se todos os itens tiverem `credential_id`
- um webhook invalido nunca deve atualizar o estado financeiro do pedido

## 14. Regras de Concorrencia

Como o sistema envolve webhook e worker, a concorrencia precisa estar prevista desde o inicio.

Recomendacoes:

- usar transacao ao reservar credenciais
- atualizar a credencial com condicao de status atual, por exemplo de `AVAILABLE` para `RESERVED`
- confirmar entrega apenas apos a associacao de todos os itens
- impedir dupla confirmacao de pagamento com verificacao por `provider_payment_id`
- tratar reprocessamento do worker como fluxo normal, nao como excecao rara

## 15. Estrategia de Estoque

Para o MVP, a estrategia mais segura e simples e:

1. cada credencial representa uma unidade vendavel
2. o estoque disponivel e a contagem de `credentials` com status `AVAILABLE`
3. a reserva ocorre somente apos pagamento confirmado
4. se nao houver estoque, o pedido vai para `DELIVERY_FAILED` e entra em tratamento operacional

Isso reduz complexidade antes de existir um painel administrativo maduro.

## 16. Estrategia de Chaves

Recomendacoes:

- usar `uuid` como chave primaria em todas as tabelas principais
- manter `sku` em `products` como identificador humano
- manter `external_reference` em `orders` como referencia de correlacao externa

## 17. Campos que Podem Esperar

Estes campos podem ficar fora do MVP sem prejuizo estrutural:

- endereco do cliente
- cupom de desconto
- afiliado
- parcelas
- reembolso detalhado
- historico completo de transicoes de estado

## 18. Duvidas de Modelagem Ainda Abertas

- compra como convidado sera permitida?
- um item do pedido sempre corresponde a exatamente uma credencial?
- o cliente podera trocar credencial apos entrega?
- o sistema exibira a senha completa toda vez ou com controle adicional?

## 19. Proxima Etapa Recomendada

Com este schema fechado, o documento mais util a seguir e `api.md`, detalhando:

- criacao de pedido
- consulta de pedido
- consulta de credenciais
- webhook de pagamento
