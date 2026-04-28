# The Pirate Max

## 1. Visao Geral

`The Pirate Max` parece estar sendo concebido como uma operacao de venda digital com pagamento via PIX e entrega automatizada de credenciais apos confirmacao do pagamento.

Pelo fluxo ja documentado, o produto combina:

- frontend para checkout e area de pedidos
- backend em `Spring`
- integracao com `Mercado Pago`
- fila em `Redis`
- worker de entrega assincrona

O desenho atual ja aponta para uma operacao pensada para escalar melhor do que um fluxo totalmente sincrono, separando confirmacao de pagamento da entrega do produto.

## 2. Objetivo do Produto

O objetivo imediato do projeto deve ser permitir que um usuario:

1. selecione um ou mais produtos
2. finalize a compra via PIX
3. receba confirmacao automatica apos pagamento
4. acesse suas credenciais com seguranca

Em termos práticos, o sistema precisa priorizar:

- confiabilidade no recebimento do webhook
- consistencia no estado do pedido
- entrega automatica sem duplicidade
- protecao das credenciais entregues

## 3. Fluxo Principal Atual

O fluxo identificado no diagrama existente e o seguinte:

1. O usuario finaliza a compra no frontend.
2. O frontend envia a criacao do pedido ao backend.
3. O backend cria o pedido com status `PENDING`.
4. O backend gera o pagamento PIX pela API do Mercado Pago.
5. O frontend exibe QR Code e codigo copia-e-cola.
6. O usuario paga no app do banco.
7. O Mercado Pago chama o webhook de confirmacao.
8. O backend valida o webhook e atualiza o pedido para `PAID`.
9. O backend publica um evento de pedido pago.
10. A mensagem vai para a fila `credentials.delivery`.
11. O worker consome a fila e associa as credenciais aos itens do pedido.
12. O pedido e marcado como `DELIVERED`.
13. O usuario acessa a area de pedidos e visualiza as credenciais.

## 4. Arquitetura Base

### Frontend

Responsabilidades esperadas:

- checkout
- exibicao do PIX
- consulta do status do pedido
- area "Meus Pedidos"
- exibicao segura das credenciais

### Backend (`Spring`)

Responsabilidades esperadas:

- criacao e persistencia de pedidos
- integracao com Mercado Pago
- processamento de webhook
- publicacao de eventos
- autorizacao de acesso a credenciais
- descriptografia em memoria

### Fila (`Redis`)

Responsabilidades esperadas:

- desacoplar pagamento confirmado da entrega
- absorver picos de processamento
- reduzir risco de timeout no webhook

### Worker de Entrega

Responsabilidades esperadas:

- consumir eventos de pedido pago
- buscar credenciais disponiveis
- vincular credenciais ao pedido
- concluir entrega
- disparar notificacao ao cliente

## 5. Entidades Principais

Mesmo sem esquema formal ainda, o contexto sugere pelo menos estas entidades:

### `Product`

- identificador
- nome
- descricao
- status
- tipo de entrega

### `Credential`

- identificador
- product_id
- login
- senha
- status (`AVAILABLE`, `RESERVED`, `DELIVERED`, `BLOCKED`)
- origem/lote

### `Order`

- identificador
- customer_id ou referencia do comprador
- status
- valor total
- metodo de pagamento
- referencia externa do Mercado Pago
- timestamps de criacao, pagamento e entrega

### `OrderItem`

- identificador
- order_id
- product_id
- quantidade
- credential_id associado apos entrega

### `Payment`

- identificador interno
- order_id
- provider (`MercadoPago`)
- provider_payment_id
- status
- payload de auditoria

## 6. Maquina de Estados Recomendada

Para evitar ambiguidade, vale padronizar os estados logo cedo.

### Pedido

- `PENDING`: pedido criado, aguardando pagamento
- `PAID`: pagamento confirmado
- `DELIVERY_PENDING`: aguardando worker concluir a entrega
- `DELIVERED`: credenciais associadas e prontas para consulta
- `DELIVERY_FAILED`: houve falha operacional apos o pagamento
- `CANCELED`: pedido cancelado ou expirado
- `REFUNDED`: valor devolvido, se esse fluxo existir

### Credencial

- `AVAILABLE`: pronta para uso em estoque
- `RESERVED`: separada para uma entrega em andamento
- `DELIVERED`: entregue ao cliente
- `INVALID`: removida por problema operacional

## 7. Regras de Negocio Importantes

- O webhook deve ser idempotente.
- O worker de entrega tambem deve ser idempotente.
- Uma credencial nao pode ser entregue duas vezes.
- O sistema nao deve marcar um pedido como `DELIVERED` antes da associacao bem-sucedida de todos os itens.
- Credenciais devem permanecer criptografadas em repouso e ser descriptografadas apenas em memoria.
- O acesso a credenciais deve exigir autenticacao e autorizacao.
- Deve existir trilha de auditoria minima para pagamento, entrega e visualizacao.

## 8. Pontos Criticos de Seguranca

Esse projeto lida com credenciais, entao seguranca nao e detalhe. Neste momento, os cuidados mais importantes sao:

- validar assinatura e origem do webhook do Mercado Pago
- nunca registrar login/senha em logs de aplicacao
- criptografar credenciais no banco
- proteger segredos de integracao em variaveis de ambiente
- limitar tentativas e acessos a endpoints sensiveis
- registrar visualizacao de credenciais por usuario e horario
- considerar mascaramento parcial antes de liberar exibicao completa

## 9. Riscos Operacionais Ja Visiveis

- falta de estoque de credenciais apos pagamento confirmado
- entrega duplicada em caso de reprocessamento
- divergencia entre status do pagamento e status do pedido
- falha silenciosa no worker
- webhook recebido fora de ordem ou repetido
- consulta de credenciais sem camada suficiente de autorizacao

Cada um desses pontos merece tratamento explicito na implementacao inicial.

## 10. Backlog Prioritario

### Fundacao tecnica

- definir modelo de dados de `orders`, `order_items`, `payments`, `products` e `credentials`
- fechar a maquina de estados do pedido
- definir contrato dos eventos publicados para fila

### Pagamento

- implementar criacao de cobranca PIX no Mercado Pago
- implementar webhook com validacao de assinatura
- persistir payloads essenciais para auditoria

### Entrega

- implementar reserva atomica de credenciais
- garantir idempotencia do worker
- tratar falta de estoque sem perder rastreabilidade

### Area do cliente

- endpoint seguro para consultar pedidos
- endpoint seguro para consultar credenciais do pedido
- experiencia de atualizacao de status apos pagamento

### Observabilidade

- logs estruturados sem segredos
- metricas de pedidos pagos, entregues e falhos
- alerta para fila parada ou falhas repetidas no worker

## 11. Decisoes Tecnicas que Valem Ser Assumidas Agora

Enquanto o projeto ainda esta pequeno, algumas definicoes ajudam bastante:

- usar `Redis` apenas como fila/evento de entrega, nao como fonte de verdade
- manter banco relacional como origem oficial do estado do pedido
- tratar webhook e entrega como fluxos independentes e reprocessaveis
- modelar entregas com idempotencia desde o primeiro commit

## 12. Perguntas em Aberto

Estas sao as principais definicoes que ainda parecem faltar no material atual:

- Quem e o usuario autenticado: conta propria, compra como convidado ou ambos?
- O catalogo vende uma credencial por item ou pode vender acesso compartilhado?
- Existe estoque finito por produto?
- O cliente pode visualizar credenciais quantas vezes quiser?
- Havera reembolso, cancelamento automatico ou expiracao de pedido?
- O envio por e-mail mostra as credenciais ou apenas avisa que estao disponiveis na area logada?

## 13. Proxima Versao Desejada deste Documento

Quando o projeto avancar, este arquivo deve evoluir para incluir:

- modelo de dados detalhado
- contratos de API
- contrato do webhook
- eventos da fila
- politicas de seguranca
- estrategia de testes
- checklist de deploy

## 14. Referencia de Fluxo

O fluxo-base documentado atualmente esta em `mermaid.md`.

## 15. Resumo Executivo

Hoje o projeto ja tem um nucleo funcional bem definido: pagamento PIX, confirmacao por webhook e entrega assincrona de credenciais. O proximo passo mais importante nao e aumentar escopo, e sim consolidar regras de negocio, estados, seguranca e observabilidade para que a base nasca confiavel.
