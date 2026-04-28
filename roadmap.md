# The Pirate Max Roadmap

## 1. Objetivo do Roadmap

Este documento traduz o contexto de `master.md` em uma sequencia de execucao para o MVP.

O foco atual nao e expandir escopo. O foco e colocar no ar um fluxo confiavel de:

1. criacao de pedido
2. pagamento via PIX
3. confirmacao por webhook
4. entrega automatizada de credenciais
5. consulta segura pelo cliente

## 2. Principios do MVP

- priorizar consistencia antes de conveniencia
- manter o estado oficial no banco
- tratar webhook e worker como fluxos idempotentes
- evitar features paralelas antes da entrega ponta a ponta funcionar
- instrumentar logs e alertas desde a primeira versao util

## 3. Escopo do MVP

### Inclui

- catalogo basico de produtos
- checkout com PIX
- criacao e persistencia de pedidos
- webhook de confirmacao de pagamento
- entrega assincrona de credenciais
- area do cliente para visualizar pedidos e credenciais
- notificacao minima ao cliente apos entrega

### Nao inclui agora

- refund completo automatizado
- painel administrativo sofisticado
- multiprovedores de pagamento
- automacoes de marketing
- regras complexas de cupons ou afiliados

## 4. Fases de Execucao

### Fase 0. Fundacao

Objetivo: preparar a base para evitar retrabalho estrutural.

Entregas:

- definir entidades `products`, `credentials`, `orders`, `order_items` e `payments`
- fechar a maquina de estados de `order` e `credential`
- definir como as credenciais serao criptografadas
- decidir modelo de autenticacao do cliente
- definir contrato do evento `OrderPaid`

Criterio de pronto:

- o time consegue descrever claramente como um pedido nasce, muda de estado e termina entregue

### Fase 1. Checkout e Pedido

Objetivo: permitir criacao de pedido e geracao de cobranca PIX.

Entregas:

- endpoint para criar pedido
- persistencia inicial com status `PENDING`
- integracao com Mercado Pago para gerar QR Code e copia-e-cola
- retorno do status inicial ao frontend
- pagina ou fluxo de acompanhamento de pagamento

Criterio de pronto:

- um pedido pode ser criado e o frontend consegue exibir um PIX valido para pagamento

### Fase 2. Webhook e Confirmacao

Objetivo: tornar o pagamento confiavel do ponto de vista transacional.

Entregas:

- endpoint de webhook do Mercado Pago
- validacao de autenticidade do webhook
- atualizacao idempotente do pagamento
- transicao do pedido para `PAID` ou `DELIVERY_PENDING`
- publicacao do evento para fila
- persistencia de payload minimo para auditoria

Criterio de pronto:

- pagamentos confirmados atualizam o pedido uma unica vez, mesmo com webhook repetido

### Fase 3. Worker e Entrega

Objetivo: concluir a entrega automatica sem duplicidade.

Entregas:

- consumidor da fila `credentials.delivery`
- reserva atomica de credenciais por produto
- associacao de `credential` ao `order_item`
- atualizacao final do pedido para `DELIVERED`
- tratamento de erro com `DELIVERY_FAILED`
- notificacao ao cliente apos entrega

Criterio de pronto:

- um pedido pago recebe credenciais corretas sem entrega duplicada

### Fase 4. Area do Cliente

Objetivo: dar acesso seguro ao historico e as credenciais.

Entregas:

- endpoint para listar pedidos do cliente
- endpoint para visualizar credenciais do pedido
- controle de autorizacao por usuario
- exibicao segura no frontend
- registro de acesso e visualizacao

Criterio de pronto:

- o cliente autenticado visualiza apenas os proprios pedidos e credenciais

### Fase 5. Operacao e Confiabilidade

Objetivo: nao depender de sorte para o sistema continuar funcionando.

Entregas:

- logs estruturados sem segredos
- metricas de pedidos criados, pagos, entregues e falhos
- alerta para fila parada ou acumulada
- alerta para falhas repetidas no worker
- procedimento de reprocessamento manual

Criterio de pronto:

- existe visibilidade operacional suficiente para detectar e responder a falhas reais

## 5. Ordem Recomendada de Implementacao

1. modelo de dados
2. criacao de pedido
3. geracao de PIX
4. webhook idempotente
5. evento de pagamento confirmado
6. worker de entrega
7. consulta de pedidos
8. consulta de credenciais
9. logs, metricas e alertas

## 6. Riscos que Merecem Dono

- falta de estoque de credenciais
- credencial duplicada entre pedidos
- pagamento confirmado sem entrega
- entrega feita com status incorreto
- vazamento de credenciais em logs
- cliente vendo pedido de outro usuario

Cada risco acima deve virar pelo menos:

- uma regra de negocio
- uma validacao tecnica
- um caso de teste

## 7. Checklist de Pronto para MVP

- fluxo PIX ponta a ponta funciona
- pedido muda de estado corretamente
- webhook suporta repeticao sem corromper dados
- worker suporta reprocessamento sem duplicar entrega
- credenciais ficam criptografadas em repouso
- area do cliente respeita autenticacao e autorizacao
- logs nao expõem segredos
- existe caminho de suporte para falha de entrega

## 8. Proximos Documentos Naturais

Depois deste roadmap, os documentos mais uteis para criar sao:

- `schema.md`: modelo de dados detalhado
- `api.md`: endpoints e contratos
- `runbook.md`: operacao, incidentes e reprocessamento

## 9. Leitura de Prioridade

Se precisarmos resumir tudo em uma linha: primeiro garantir pedido pago com entrega confiavel, depois melhorar experiencia e operacao.
