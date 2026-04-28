# The Pirate Max Tasks

## 1. Objetivo

Este documento converte a documentacao atual do projeto em um backlog tecnico implementavel para o MVP.

Documentos de referencia:

- `master.md`
- `roadmap.md`
- `schema.md`
- `api.md`
- `runbook.md`

## 2. Prioridade Geral

A ordem mais segura para o MVP e:

1. fundacao de projeto e dados
2. criacao de pedido e pagamento PIX
3. webhook e confirmacao de pagamento
4. fila e worker de entrega
5. area autenticada do cliente
6. logs, metricas e operacao

## 3. Convencoes de Execucao

- cada tarefa deve produzir artefato verificavel
- sempre que possivel, concluir backend com teste basico antes de seguir
- nao implementar conveniencias antes do fluxo ponta a ponta funcionar
- qualquer tarefa que toque pagamento ou credenciais deve incluir validacao de seguranca

## 4. Fase 0. Fundacao

### T0.1 Definir stack real do backend

Objetivo:

- confirmar estrutura `Spring` do projeto

Entregas:

- projeto backend inicial criado
- configuracao base de ambiente
- configuracao de banco
- configuracao de `Redis`

Pronto quando:

- a aplicacao sobe localmente com healthcheck basico

### T0.2 Estruturar configuracao por ambiente

Objetivo:

- separar desenvolvimento, homologacao e producao desde cedo

Entregas:

- arquivo de configuracao por ambiente
- leitura de segredos via variaveis de ambiente
- placeholders para credenciais do Mercado Pago

Pronto quando:

- a aplicacao inicializa sem segredos hardcoded

### T0.3 Modelar entidades principais

Objetivo:

- transformar `schema.md` em entidades reais

Entregas:

- entidades `users`, `products`, `credentials`, `orders`, `order_items`, `payments`, `webhook_events`, `credential_views`
- enums de status
- relacoes principais mapeadas

Pronto quando:

- o modelo compila e reflete as relacoes esperadas

### T0.4 Criar migracoes iniciais

Objetivo:

- versionar a estrutura do banco

Entregas:

- migracao inicial do schema
- indices principais
- restricoes unicas e estrangeiras

Pronto quando:

- banco novo pode ser provisionado apenas pelas migracoes

## 5. Fase 1. Catalogo e Pedido

### T1.1 Criar cadastro inicial de produtos

Objetivo:

- permitir que o sistema tenha itens vendaveis reais

Entregas:

- seed inicial de produtos
- campos minimos de produto
- regra de produto ativo/inativo

Pronto quando:

- existe pelo menos um produto valido consultavel no banco

### T1.2 Criar endpoint `POST /api/orders`

Objetivo:

- receber carrinho e criar pedido

Entregas:

- validacao de payload
- criacao de `order`
- criacao de `order_items`
- calculo de total

Pronto quando:

- pedido valido e persistido com status `PENDING`

### T1.3 Integrar criacao de PIX com Mercado Pago

Objetivo:

- gerar pagamento real a partir do pedido

Entregas:

- client de integracao com Mercado Pago
- envio de `external_reference`
- captura de QR Code e copia-e-cola
- persistencia inicial em `payments`

Pronto quando:

- pedido criado retorna dados de PIX utilizaveis

### T1.4 Criar teste de criacao de pedido

Objetivo:

- proteger o fluxo inicial contra regressao

Entregas:

- teste de sucesso
- teste para produto invalido
- teste para payload invalido

Pronto quando:

- endpoint principal passa com cenarios minimos cobertos

## 6. Fase 2. Webhook e Confirmacao

### T2.1 Criar endpoint `POST /api/webhooks/mercadopago`

Objetivo:

- receber evento de pagamento

Entregas:

- rota de webhook
- captura do payload recebido
- resposta HTTP consistente

Pronto quando:

- o backend aceita webhook e registra tentativa

### T2.2 Validar assinatura do webhook

Objetivo:

- impedir confirmacao fraudulenta

Entregas:

- validacao de assinatura/origem
- marcacao de `signature_valid`
- rejeicao logica de eventos invalidos

Pronto quando:

- webhook invalido nao altera estado financeiro

### T2.3 Atualizar pagamento e pedido com idempotencia

Objetivo:

- garantir consistencia mesmo com repeticao

Entregas:

- correlacao por `provider_payment_id`
- atualizacao segura de `payments`
- transicao de `orders` para `PAID` ou `DELIVERY_PENDING`

Pronto quando:

- o mesmo webhook pode chegar mais de uma vez sem corromper estado

### T2.4 Publicar evento `OrderPaid`

Objetivo:

- disparar entrega assincrona

Entregas:

- payload do evento
- publicacao na fila `credentials.delivery`
- rastreabilidade do evento

Pronto quando:

- pedido pago gera mensagem consumivel pelo worker

### T2.5 Criar testes de webhook

Objetivo:

- blindar o fluxo de pagamento confirmado

Entregas:

- teste de webhook valido
- teste de webhook repetido
- teste de assinatura invalida

Pronto quando:

- comportamento idempotente esta coberto

## 7. Fase 3. Estoque e Worker

### T3.1 Criar seed e carga inicial de credenciais

Objetivo:

- disponibilizar estoque minimo para testes e operacao

Entregas:

- dados de credenciais criptografadas
- vinculacao de credenciais a produtos

Pronto quando:

- existe estoque `AVAILABLE` para ao menos um produto

### T3.2 Implementar reserva atomica de credenciais

Objetivo:

- impedir entrega duplicada

Entregas:

- selecao transacional de credenciais
- transicao de `AVAILABLE` para `RESERVED`
- protecao contra corrida concorrente

Pronto quando:

- duas entregas simultaneas nao conseguem reservar a mesma credencial

### T3.3 Implementar worker de entrega

Objetivo:

- consumir `OrderPaid` e concluir a entrega

Entregas:

- consumidor da fila
- busca do pedido
- reserva e associacao de credenciais
- atualizacao do pedido para `DELIVERED`

Pronto quando:

- um pedido pago vira `DELIVERED` automaticamente

### T3.4 Tratar falta de estoque

Objetivo:

- falhar com rastreabilidade e sem mentir ao sistema

Entregas:

- transicao para `DELIVERY_FAILED`
- log claro do motivo
- caminho previsivel para reprocessamento futuro

Pronto quando:

- falta de estoque nao gera entrega parcial ou estado incorreto

### T3.5 Criar testes do worker

Objetivo:

- reduzir risco na parte mais sensivel da entrega

Entregas:

- teste de entrega bem-sucedida
- teste de reprocessamento
- teste de falta de estoque

Pronto quando:

- comportamento principal do worker esta coberto

## 8. Fase 4. Area do Cliente

### T4.1 Implementar autenticacao base

Objetivo:

- proteger pedidos e credenciais

Entregas:

- fluxo minimo de autenticacao
- identificacao do usuario autenticado no backend

Pronto quando:

- endpoints autenticados conseguem resolver o usuario atual

### T4.2 Criar endpoint `GET /api/orders`

Objetivo:

- listar pedidos do cliente

Entregas:

- busca filtrada por usuario
- retorno resumido de pedidos

Pronto quando:

- usuario ve apenas os proprios pedidos

### T4.3 Criar endpoint `GET /api/orders/{orderId}`

Objetivo:

- consultar detalhes do pedido

Entregas:

- detalhe do pedido
- itens comprados
- validacao de ownership

Pronto quando:

- usuario autenticado acessa apenas pedidos proprios

### T4.4 Criar endpoint `GET /api/orders/{orderId}/status`

Objetivo:

- suportar polling leve no frontend

Entregas:

- retorno enxuto de status
- timestamps principais

Pronto quando:

- frontend pode acompanhar confirmacao e entrega sem payload pesado

### T4.5 Criar endpoint `GET /api/orders/{orderId}/credentials`

Objetivo:

- liberar credenciais com seguranca

Entregas:

- leitura controlada das credenciais
- descriptografia em memoria
- registro em `credential_views`

Pronto quando:

- apenas o dono do pedido entregue consegue visualizar as credenciais

### T4.6 Criar testes da area autenticada

Objetivo:

- proteger ownership e seguranca

Entregas:

- teste de acesso autorizado
- teste de acesso negado
- teste de credenciais ainda nao prontas

Pronto quando:

- os endpoints do cliente respeitam autorizacao

## 9. Fase 5. Operacao e Observabilidade

### T5.1 Estruturar logs do fluxo de pedido

Objetivo:

- tornar incidentes investigaveis

Entregas:

- logs por `order_id`
- logs por `provider_payment_id`
- logs por evento de worker

Pronto quando:

- um incidente pode ser rastreado ponta a ponta nos logs

### T5.2 Criar metricas minimas

Objetivo:

- medir saude do fluxo

Entregas:

- contador de pedidos criados
- contador de pedidos pagos
- contador de pedidos entregues
- contador de `DELIVERY_FAILED`

Pronto quando:

- o time consegue acompanhar conversao e falhas basicas

### T5.3 Monitorar fila e worker

Objetivo:

- detectar travamentos cedo

Entregas:

- metrica de backlog da fila
- metrica de processamento do worker
- alerta para fila parada

Pronto quando:

- fila acumulada gera sinal operacional

### T5.4 Criar rotina de reprocessamento

Objetivo:

- resolver falhas transitorias com previsibilidade

Entregas:

- estrategia de republicacao do evento
- checklist operacional alinhado com `runbook.md`

Pronto quando:

- pedido afetado pode ser reprocessado sem improviso

## 10. Tarefas Transversais

### TT.1 Proteger segredos

- armazenar segredos fora do codigo
- revisar exposicao em logs

### TT.2 Padronizar erros de API

- aplicar `error.code`
- aplicar status HTTP coerentes

### TT.3 Garantir idempotencia

- webhook
- pagamento
- worker

### TT.4 Documentar decisoes

- atualizar docs quando a implementacao divergir do plano

## 11. Ordem Recomendada de Inicio Imediato

Se fossemos comecar agora mesmo, eu abriria nesta ordem:

1. `T0.1`
2. `T0.2`
3. `T0.3`
4. `T0.4`
5. `T1.1`
6. `T1.2`
7. `T1.3`
8. `T2.1`
9. `T2.2`
10. `T2.3`

## 12. Marco de MVP Funcional

O MVP passa a existir de verdade quando estas tarefas estiverem concluídas:

- `T0.3`
- `T0.4`
- `T1.2`
- `T1.3`
- `T2.3`
- `T2.4`
- `T3.2`
- `T3.3`
- `T4.5`

## 13. Proxima Etapa Recomendada

Com `tasks.md`, a documentacao ja virou backlog.

O passo mais forte daqui para frente e um destes:

- iniciar a estrutura real do backend
- converter `tasks.md` em board de execucao
