# The Pirate Max Runbook

## 1. Objetivo

Este documento descreve os procedimentos operacionais do MVP do `The Pirate Max`.

O foco aqui e responder com clareza a incidentes e situacoes comuns do fluxo:

1. pagamento confirmado
2. webhook recebido
3. entrega automatizada iniciada
4. credenciais entregues ou falha operacional detectada

## 2. Escopo Operacional

Este runbook cobre:

- webhook do Mercado Pago
- fila de entrega
- worker de entrega
- falta de estoque de credenciais
- consulta de pedidos e credenciais
- reprocessamento operacional

Este runbook nao cobre ainda:

- chargeback
- refund automatizado
- gestao administrativa completa
- resposta juridica ou compliance formal

## 3. Sinais Vitais do Sistema

Os indicadores mais importantes para acompanhar no MVP sao:

- quantidade de pedidos `PENDING`
- quantidade de pedidos `PAID`
- quantidade de pedidos `DELIVERY_PENDING`
- quantidade de pedidos `DELIVERED`
- quantidade de pedidos `DELIVERY_FAILED`
- volume de webhooks recebidos
- volume de falhas de assinatura de webhook
- tamanho da fila `credentials.delivery`
- taxa de sucesso do worker
- tempo entre `paid_at` e `delivered_at`

## 4. Estado Saudavel Esperado

Em operacao normal, o comportamento esperado e:

- webhook valido registrado e processado rapidamente
- pedido pago transiciona para entrega sem atraso anormal
- fila de entrega oscila, mas nao cresce continuamente
- worker consome mensagens sem repeticao destrutiva
- pedidos pagos viram `DELIVERED` em janela curta
- `DELIVERY_FAILED` permanece raro e rastreavel

## 5. Incidente: Pagamento Confirmado Sem Entrega

### Sintomas

- pedido aparece como `PAID` ou `DELIVERY_PENDING`
- cliente relata que pagou mas nao recebeu credenciais
- fila pode estar parada, atrasada ou com erro

### Verificacoes

1. localizar o `order_id`
2. confirmar se `paid_at` foi preenchido
3. verificar status atual do pedido
4. verificar existencia do registro em `payments`
5. verificar se o evento `OrderPaid` foi publicado
6. verificar se a fila recebeu a mensagem
7. verificar logs do worker para o `order_id`

### Causas provaveis

- evento nao publicado apos webhook
- fila indisponivel
- worker parado
- falha na reserva de credenciais
- falta de estoque

### Acao

1. se o evento nao foi publicado, republicar `OrderPaid`
2. se a fila estiver indisponivel, restaurar a fila antes de reprocessar
3. se o worker falhou, corrigir e reprocessar o pedido
4. se nao houver estoque, mover o caso para tratamento manual

### Resultado esperado

- pedido vai para `DELIVERED` se a entrega for concluida
- pedido vai para `DELIVERY_FAILED` se houver bloqueio real de estoque ou operacao

## 6. Incidente: Webhook Repetido

### Sintomas

- multiplas chamadas para o mesmo pagamento
- mesmo `provider_payment_id` aparece mais de uma vez
- logs mostram repeticao do mesmo evento

### Risco

- atualizacao duplicada de pagamento
- publicacao repetida do evento de entrega

### Verificacoes

1. localizar `provider_payment_id`
2. verificar tabela `webhook_events`
3. verificar se o pagamento ja estava confirmado
4. verificar se o worker tratou o evento de forma idempotente

### Acao

1. nao alterar manualmente pedido ja consistente
2. garantir que a aplicacao ignore reaplicacao financeira
3. confirmar que o worker nao associou credenciais duplicadas

### Resultado esperado

- o estado final continua correto
- a repeticao fica apenas registrada para auditoria

## 7. Incidente: Falta de Estoque

### Sintomas

- pagamento confirmado
- worker nao encontra credenciais `AVAILABLE`
- pedido termina em `DELIVERY_FAILED`

### Verificacoes

1. identificar o produto comprado
2. contar credenciais com status `AVAILABLE` para o produto
3. verificar se houve reserva simultanea por outro pedido
4. confirmar se o item realmente exige estoque

### Acao

1. manter registro da falha com motivo claro
2. nao marcar o pedido como `DELIVERED`
3. sinalizar necessidade de reposicao ou atendimento manual
4. definir se havera reentrega futura ou contato com o cliente

### Resultado esperado

- falha fica visivel
- pedido nao entra em estado enganoso
- operacao consegue agir sem perder rastreabilidade

## 8. Incidente: Worker Parado ou Fila Acumulada

### Sintomas

- crescimento continuo da fila `credentials.delivery`
- pedidos pagos sem transicao para entrega
- ausencia de consumo por parte do worker

### Verificacoes

1. confirmar se o processo do worker esta ativo
2. verificar conectividade com `Redis`
3. verificar erros recentes de aplicacao
4. medir tempo desde a ultima mensagem processada

### Acao

1. reiniciar o worker se a causa for transitória
2. corrigir credenciais de conexao ou indisponibilidade do `Redis`
3. monitorar se o consumo foi retomado
4. reprocessar mensagens pendentes, se necessario

### Resultado esperado

- fila volta a cair
- pedidos pendentes de entrega avancam normalmente

## 9. Incidente: Cliente Nao Consegue Ver Credenciais

### Sintomas

- pedido esta `DELIVERED`
- endpoint de credenciais retorna erro
- cliente autenticado relata acesso negado ou tela vazia

### Verificacoes

1. confirmar ownership do pedido
2. verificar se `order_items` possuem `credential_id`
3. verificar se a credencial existe e esta marcada como `DELIVERED`
4. verificar falhas no endpoint `GET /api/orders/{orderId}/credentials`
5. verificar registros de auditoria de visualizacao

### Causas provaveis

- bug de autorizacao
- associacao incompleta entre item e credencial
- pedido marcado como entregue antes da hora

### Acao

1. corrigir inconsistencia de dados se houver
2. impedir exibicao parcial incoerente
3. abrir incidente tecnico se o problema for sistemico

## 10. Incidente: Exposicao Indevida de Credenciais

### Sintomas

- credencial aparece para usuario errado
- log contem login ou senha
- houve resposta de API com dados indevidos

### Severidade

- alta

### Acao imediata

1. interromper ou limitar o endpoint afetado se necessario
2. identificar escopo do vazamento
3. preservar logs e evidencias
4. invalidar ou trocar credenciais expostas quando possivel
5. corrigir a falha antes de retomar operacao normal

### Verificacoes

1. revisar ownership por `order_id`
2. revisar filtros do endpoint de credenciais
3. revisar logs da aplicacao
4. revisar consulta de banco ou mapeamento ORM envolvido

## 11. Reprocessamento Manual Recomendado

O sistema deve prever um caminho manual ou administrativo para reprocessar pedidos.

### Casos adequados para reprocessamento

- webhook recebido mas evento nao publicado
- falha transitoria na fila
- falha transitoria no worker

### Casos que nao devem ser reprocessados cegamente

- falta real de estoque
- credencial ja entregue
- dados inconsistentes sem diagnostico

### Passos

1. confirmar estado atual do pedido
2. confirmar se o pagamento e legitimo
3. confirmar se nao existe entrega previa
4. republicar `OrderPaid` ou executar acao equivalente
5. observar resultado final ate `DELIVERED` ou `DELIVERY_FAILED`

## 12. Checklist de Diagnostico por Pedido

Ao investigar qualquer caso, levantar sempre:

- `order_id`
- `user_id`
- `status` do pedido
- `paid_at`
- `delivered_at`
- `provider_payment_id`
- existencia de `webhook_events`
- existencia de mensagem na fila ou historico de processamento
- existencia de `credential_id` em cada item

## 13. Logs e Auditoria Minimos

Os logs devem permitir responder:

- o webhook chegou?
- a assinatura era valida?
- o pagamento foi confirmado?
- o evento foi publicado?
- o worker consumiu?
- a credencial foi reservada?
- o pedido foi entregue?
- o cliente visualizou a credencial?

Os logs nao devem registrar:

- senha em texto puro
- payloads sensiveis sem necessidade
- segredos de integracao

## 14. Alertas Recomendados

- fila acima do limite esperado por mais de X minutos
- worker sem consumo por mais de X minutos
- aumento anormal de `DELIVERY_FAILED`
- aumento anormal de `INVALID_SIGNATURE`
- pedidos `PAID` sem entrega acima da janela esperada

## 15. Janela Operacional Recomendada

Para o MVP, vale definir uma expectativa simples:

- pagamento confirmado deve entrar em entrega quase imediatamente
- entrega automatica deve ser concluida em poucos minutos
- qualquer pedido preso alem da janela definida deve virar alerta operacional

O tempo exato pode ser ajustado depois, mas a regra precisa existir desde cedo.

## 16. Acoes Preventivas

- manter estoque minimo de credenciais para produtos ativos
- testar idempotencia do webhook e do worker
- revisar periodicamente pedidos em `DELIVERY_FAILED`
- revisar tentativas de acesso negado a credenciais
- validar mascaramento e logs em ambiente de homologacao

## 17. Rotina Diaria Recomendada

1. revisar pedidos `DELIVERY_FAILED`
2. revisar pedidos `PAID` ou `DELIVERY_PENDING` acima da janela normal
3. verificar saude da fila e do worker
4. verificar sinais de falha de assinatura no webhook
5. verificar disponibilidade de estoque dos produtos principais

## 18. Proxima Etapa Recomendada

Com `runbook.md`, a base documental do MVP fica funcional para produto, arquitetura, dados, API e operacao.

Se formos continuar, o passo mais util agora e escolher entre:

- transformar essa documentacao em backlog tecnico implementavel
- iniciar a estrutura real do backend e do schema
