# The Pirate Max - Estabilizacao do MVP

## Objetivo

Antes da reestilizacao completa do frontend, esta etapa estabiliza fluxo, contratos e regras de negocio para que o redesign seja principalmente visual.

Ao final desta etapa, o frontend deve poder trocar layout, componentes e identidade visual sem redescobrir regra de pagamento, entrega, credenciais ou pedido.

## Ordem de execucao

### 1. Idempotencia do checkout

Problema: duplo clique, refresh ou retry de rede pode criar mais de um pedido para a mesma intencao de compra.

Resultado esperado:

- frontend envia uma chave unica por tentativa de checkout
- backend salva essa chave por usuario
- repetir a mesma chave retorna o mesmo pedido/pagamento
- nao duplica reserva de credencial

### 2. Concorrencia de estoque

Problema: compras simultaneas nao podem reservar a mesma credencial.

Resultado esperado:

- reserva usa lock transacional
- teste garante que a mesma credencial nao e vinculada a dois itens
- falta de estoque retorna erro claro

### 3. Webhook e simulacao

Problema: fluxo fake/local nao pode vazar para producao, e webhook real precisa de validacao mais forte.

Resultado esperado:

- simulacao local bloqueada quando gateway real/producao estiver ativo
- webhook Mercado Pago valida assinatura quando segredo estiver configurado
- payload invalido nao aprova pedido

### 4. Credenciais do cliente

Problema: a entrega funciona, mas a revelacao das credenciais do cliente deve ficar mais rastreavel.

Resultado esperado:

- endpoint de listagem mostra entrega sem expor segredo completo
- endpoint separado revela/copia credencial
- auditoria registra visualizacao/revelacao do cliente

### 5. Estados finais e suporte

Problema: estados como `DELIVERY_FAILED`, `CANCELED` e `REFUNDED` precisam virar fluxo compreensivel.

Resultado esperado:

- cliente entende o que fazer em cada estado
- admin consegue reprocessar entrega falha
- contrato deixa claro quando pedido esta finalizado

### 6. Contratos estaveis para frontend

Problema: redesign grande fica caro se os dados mudarem no meio.

Resultado esperado:

- contratos documentados para catalogo, checkout, pedido, entrega e admin
- frontend consome esses contratos sem workaround visual
- campos sensiveis ficam fora de listagens comuns

## Criterio final

- `npm run build` passa
- `mvn -f backend\pom.xml test` passa
- fluxo cliente: catalogo -> carrinho -> Pix -> pago -> entregue -> credenciais
- fluxo admin: produto -> estoque -> pedido -> diagnostico -> reprocessamento
- sem dependencia de usuario dev para producao
- sem endpoint de simulacao operacional em modo real/producao
