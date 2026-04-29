# Backend Next Steps

## Objetivo

Organizar as proximas entregas do backend do The Pirate Max depois da validacao ponta a ponta com PostgreSQL local.

Neste momento, o fluxo principal do MVP ja foi validado:

- catalogo real
- estoque real
- criacao de pedido
- reserva de credencial
- geracao de pagamento PIX fake
- expiracao de pedido nao pago
- webhook de aprovacao
- entrega automatica
- consulta de status
- visualizacao de credenciais
- auditoria basica

O foco agora e sair de um backend funcional de MVP para um backend operacionalmente confiavel.

## Prioridades

1. Endurecer operacao e reprocessamento
2. Melhorar rastreabilidade e falha controlada
3. Introduzir autenticacao minima
4. Reforcar seguranca de credenciais
5. Preparar base para operacao assistida e painel vendedor

## Fase 1 - Operacao e reprocessamento

### Objetivo

Permitir que pedidos e entregas possam ser diagnosticados e reprocessados sem mexer manualmente no banco.

### Tarefas

#### 1.1 Criar endpoint administrativo de reprocessamento de entrega

Permitir reprocessar um pedido especifico que esteja em:

- `PAID`
- `DELIVERY_PENDING`
- `DELIVERY_FAILED`

Sugestao de endpoint:

- `POST /api/admin/orders/{orderId}/reprocess-delivery`

Resultado esperado:

- o backend tenta novamente a entrega
- retorna o novo estado do pedido
- nao duplica entrega em pedido ja `DELIVERED`

#### 1.2 Criar endpoint administrativo de liberacao manual de reserva

Permitir soltar uma reserva em situacoes operacionais especificas.

Sugestao de endpoint:

- `POST /api/admin/orders/{orderId}/release-reservation`

Regras:

- permitido apenas para pedidos `PENDING` ou `CANCELED`
- credenciais `RESERVED` voltam para `AVAILABLE`
- limpar `reserved_at`

#### 1.3 Registrar motivo de falha de entrega

Adicionar rastreabilidade para sabermos por que um pedido falhou.

Sugestao:

- incluir `failure_reason` no pedido ou em tabela dedicada de tentativas

Exemplos:

- `MISSING_CREDENTIAL`
- `INVALID_CREDENTIAL`
- `ORDER_ALREADY_CANCELED`
- `ORDER_NOT_PAID`
- `UNKNOWN_DELIVERY_ERROR`

#### 1.4 Registrar tentativas de entrega

Criar historico minimo de tentativas do worker.

Sugestao de tabela futura:

- `delivery_attempts`

Campos sugeridos:

- `id`
- `order_id`
- `attempt_number`
- `status`
- `failure_reason`
- `created_at`

### Criterios de pronto

- pedido com falha pode ser reprocessado por endpoint
- backend nao exige SQL manual para operacao comum
- pedido ja entregue nao duplica credencial
- causa da falha fica visivel

## Fase 2 - Robustez de webhook e transicoes

### Objetivo

Fechar lacunas em estados anormais de pagamento e notificacao.

### Tarefas

#### 2.1 Tratar webhook aprovado apos expiracao

Definir comportamento para pedido:

- expirado
- estoque liberado
- depois recebe webhook `approved`

Opcoes de regra:

1. ignorar e marcar para revisao manual
2. reabrir pedido se estoque ainda existir
3. marcar inconsistencia operacional

Recomendacao:

- nao reabrir automaticamente
- registrar inconsistencia
- manter pedido em estado revisavel

#### 2.2 Melhorar idempotencia de webhook

Hoje ja existe base de idempotencia por `provider_event_id`.

Expandir para:

- eventos repetidos com payload diferente
- webhook de pedido ja entregue
- webhook para pagamento inexistente
- webhook sem `external_reference`

#### 2.3 Refinar maquina de estados

Formalizar transicoes validas:

- `PENDING -> PAID`
- `PENDING -> CANCELED`
- `PAID -> DELIVERY_PENDING`
- `DELIVERY_PENDING -> DELIVERED`
- `DELIVERY_PENDING -> DELIVERY_FAILED`

Bloquear transicoes invalidas com erro explicito.

### Criterios de pronto

- eventos tardios nao quebram consistencia
- transicoes invalidas ficam bloqueadas
- problemas de webhook ficam auditaveis

## Fase 3 - Observabilidade e suporte operacional

### Objetivo

Dar visibilidade para operacao sem depender de debug no codigo.

### Tarefas

#### 3.1 Melhorar logs por pedido

Padronizar logs com:

- `orderId`
- `externalReference`
- `productSku`
- `paymentStatus`
- `orderStatus`

Pontos principais:

- criacao do pedido
- reserva
- expiracao
- webhook
- entrega
- falha
- visualizacao de credenciais

#### 3.2 Expor metricas basicas

Comecar com:

- pedidos por status
- entregas falhas
- reservas expiradas
- webhooks recebidos
- webhooks duplicados
- estoque baixo por SKU

#### 3.3 Criar endpoint de diagnostico basico para admin

Sugestao:

- `GET /api/admin/orders/{orderId}/diagnostics`

Retornar:

- status atual do pedido
- status do pagamento
- item e credencial associada
- timestamps principais
- ultimas tentativas

### Criterios de pronto

- pedidos problematicos podem ser entendidos sem abrir banco
- temos visibilidade minima do sistema em execucao

## Fase 4 - Autenticacao minima

### Objetivo

Parar de depender de usuario fixo de desenvolvimento e criar base real para area do cliente.

### Tarefas

#### 4.1 Criar identidade de usuario real

Evoluir de `DevUserProvider` para usuario autenticado.

Escopo minimo:

- cadastro simples
- login
- senha com hash
- sessao ou token

#### 4.2 Proteger endpoints do cliente

Cobrir:

- `POST /api/orders`
- `GET /api/orders`
- `GET /api/orders/{orderId}`
- `GET /api/orders/{orderId}/status`
- `GET /api/orders/{orderId}/credentials`

#### 4.3 Criar papel administrativo basico

Necessario para:

- reprocessamento manual
- diagnostico
- visao operacional do vendedor

### Criterios de pronto

- pedidos deixam de depender de usuario hardcoded
- cliente so ve os proprios pedidos
- endpoints administrativos ficam separados

## Fase 5 - Seguranca das credenciais

### Objetivo

Trocar protecao fraca de desenvolvimento por base minima de seguranca real.

### Tarefas

#### 5.1 Substituir base64 por criptografia real

Aplicar a:

- `login_encrypted`
- `password_encrypted`

Sugestao:

- AES com chave vinda de ambiente
- versionamento de chave mantido em `encryption_key_version`

#### 5.2 Mascarar visualizacao por padrao

Regras sugeridas:

- mostrar credencial completa apenas sob acao explicita
- registrar auditoria sempre
- opcionalmente limitar reexibicao

#### 5.3 Melhorar trilha de auditoria

Expandir `credential_views` com:

- origem da visualizacao
- acao realizada
- contexto administrativo ou cliente

### Criterios de pronto

- credenciais nao ficam protegidas apenas por codificacao reversivel
- acesso sensivel tem auditoria melhor

## Fase 6 - Preparacao para seller panel real

### Objetivo

Dar ao frontend operacional backend suficiente para um painel vendedor funcional.

### Tarefas

#### 6.1 Endpoint de pedidos operacionais

Sugestao:

- `GET /api/admin/orders`

Filtros:

- status
- categoria
- SKU
- data

#### 6.2 Endpoint de alertas de estoque

Sugestao:

- `GET /api/admin/inventory/alerts`

Mostrar:

- estoque zerado
- estoque baixo
- estoque reservado alto

#### 6.3 Endpoint de resumo operacional

Sugestao:

- `GET /api/admin/dashboard`

Trazer:

- pedidos pendentes
- pagos
- falhos
- entregues
- expirados

### Criterios de pronto

- frontend vendedor pode deixar de usar agregacoes improvisadas
- operacao passa a ler o backend diretamente

## Ordem recomendada de execucao

1. endpoint de reprocessamento manual
2. motivo de falha e tentativas de entrega
3. tratamento de webhook tardio e transicoes invalidas
4. logs e diagnostico administrativo
5. autenticacao minima
6. criptografia real
7. endpoints operacionais para seller panel

## Tarefas imediatas sugeridas

### Bloco A - Operacao

- criar `POST /api/admin/orders/{orderId}/reprocess-delivery`
- criar `POST /api/admin/orders/{orderId}/release-reservation`
- registrar `failure_reason`

### Bloco B - Consistencia

- tratar webhook aprovado apos expiracao
- consolidar transicoes validas do pedido

### Bloco C - Observabilidade

- adicionar logs estruturados principais
- criar endpoint de diagnostico por pedido

## Definicao de pronto deste ciclo

Este ciclo pode ser considerado concluido quando:

- a equipe consegue operar falhas sem SQL manual
- o backend explica por que um pedido falhou
- o sistema resiste melhor a eventos repetidos e tardios
- existe base minima segura para ligar autenticacao e seller panel real
