# The Pirate Max - Revisao critica do backend para producao

## Veredito curto

O backend ja cobre o ciclo central do MVP de vendedor unico, mas ainda nao deve abrir venda real antes de fechar os bloqueadores abaixo. O risco principal nao e o fluxo feliz; e a operacao quando pagamento, webhook, expiracao ou infraestrutura saem do caminho ideal.

## Bloqueadores reais

1. Hospedagem gratuita com cold start nao serve para venda real. Checkout, login, webhook e entrega podem atrasar quando a instancia dorme.
2. Pagamento produtivo precisa ser validado ponta a ponta com credenciais reais, webhook HTTPS real e pelo menos tres compras controladas.
3. Estoque produtivo ainda depende de cadastro manual de credenciais e de rotina operacional clara para reposicao, invalidacao e alerta de estoque baixo.
4. O backend agora tem base de recuperacao de senha e rate limiting em rotas criticas, mas ainda falta provedor real de e-mail e MFA para admin.
5. Entrega roda por scanner agendado no processo web, nao por fila duravel. Funciona para MVP pequeno, mas nao e resiliente o bastante para operacao com cold start ou multiplas instancias.
6. Pagamento aprovado depois da expiracao agora entra em `PAYMENT_REVIEW` e ja pode ser resolvido pelo backend como entrega manual ou reembolso, com auditoria. Falta plugar a acao no frontend admin.
7. A suite completa de testes voltou a ficar verde depois da atualizacao dos fixtures para o modelo atual de catalogo.

## Pontos fortes ja existentes

- JWT stateless com senha armazenada via hash.
- Autorizacao admin separada por role.
- Reserva de estoque com lock pessimista.
- Chave de idempotencia por usuario/pedido.
- Webhook com validacao de assinatura e persistencia de eventos.
- Credenciais criptografadas com versao de chave.
- Auditoria de revelacao/copia de credenciais pelo admin.
- Logs estruturados por evento e `requestId`.

## Estado por area

### Autenticacao e autorizacao

- Bom: login, cadastro, JWT, role `ADMIN`, rotas admin protegidas.
- Bom: recuperacao de senha com token hasheado, expiracao configuravel e resposta generica para evitar enumeracao de e-mails.
- Bom: rate limiting em login, cadastro, solicitacao de reset de senha e checkout.
- Falta: envio real de e-mail de reset, verificacao de e-mail, MFA para admin, revogacao de sessoes/tokens e trilha de alteracao de privilegios.

### Estoque

- Bom: estoque e reservado antes do pagamento, lock pessimista evita dupla reserva concorrente.
- Falta: alerta de estoque critico, importacao em lote, rotina formal de reposicao e contrato para produtos que nao exigem estoque.

### Pagamento

- Bom: Payments API, idempotencia com `externalReference`, Pix persistido no pedido.
- Bom: `PAYMENT_REVIEW` tem endpoint admin para decidir entre `DELIVER` e `REFUND`, com motivo obrigatorio e log de acao.
- Falta: teste produtivo controlado concluido e interface admin para usar a rotina sem chamada manual de API.

### Webhook

- Bom: assinatura validada, payload persistido, duplicatas reconhecidas, reprocessamento de status aprovado.
- Falta: observabilidade de falhas/retries, restricao operacional para eventos esperados e monitoramento de webhooks nao processados.

### Entrega

- Bom: credencial so e revelada depois de `DELIVERED`; falhas ficam diagnosticaveis.
- Falta: fila duravel/worker separado; scanner agendado e aceitavel apenas para primeiro MVP pequeno.

### Seguranca

- Bom: credenciais cifradas, secrets por ambiente, bootstrap de admin temporario.
- Falta: headers de seguranca/CSP no edge, MFA, rotacao documentada de segredos, backup/restore ensaiado, politica legal e de suporte.

### Logs e observabilidade

- Bom: eventos de negocio relevantes ja estao logados.
- Falta: metricas, alertas, dashboard de erros, correlacao externa, retencao controlada e mascaramento sistematico de PII.

### Testes e qualidade

- Bom: existem testes de API e de servicos para auth, pedidos, entrega, pagamento e administracao; a suite completa esta verde novamente.
- Bom: cobertura adicionada para reset de senha e resolucao manual de `PAYMENT_REVIEW`.
- Falta: manter a suite completa como gate obrigatorio antes de deploy e ampliar cobertura de rate limiting e falhas operacionais raras.

## Desenvolvimento/fallback ainda presente

- `DevelopmentDataInitializer` continua existindo para perfis nao produtivos.
- `FakePixPaymentGateway` continua necessario localmente.
- `AUTH_ENABLED=false` ainda existe como opcao fora de producao.
- `CORS_ALLOWED_ORIGIN_PATTERNS=*` ainda e aceito fora de producao.
- Pagador fixo por env (`MERCADO_PAGO_PAYER_EMAIL`, `MERCADO_PAGO_PAYER_FIRST_NAME`) ainda existe para local/sandbox.
- Entrega por scanner agendado substitui a fila Redis descrita em documentos antigos.

## Plano em fases

### Fase 1 - fechar pre-requisitos de venda

1. Manter suite completa verde como gate antes de deploy.
2. Subir backend em hospedagem sem cold start.
3. Configurar dominio, CORS restrito, secrets produtivos e webhook produtivo.
4. Rodar compras produtivas controladas.
5. Plugar no frontend admin a resolucao de pedidos em `PAYMENT_REVIEW`: revisar pagamento tardio, decidir entre reentrega manual e reembolso, e registrar a decisao.
6. Cadastrar estoque real minimo e roteiro operacional.

### Fase 2 - endurecimento de conta e operacao

1. Envio real de e-mail para recuperacao de senha.
2. MFA para admin.
3. Rate limiting persistente/distribuido se houver multiplas instancias.
4. Alertas de estoque baixo, webhook falho e entrega falha.
5. Backup/restore testado e runbook de incidente.

### Fase 3 - resiliencia

1. Migrar entrega para fila duravel/worker.
2. Reconciliacao automatizada de pagamentos.
3. Dashboard operacional de webhooks/eventos.
4. Rotacao de segredos e chaves de credenciais.

## Contratos que o frontend ainda precisara fechar depois

- Estados finais de erro para auth, checkout, webhook pendente, expiracao e entrega falha.
- Fluxo visual de recuperacao de senha usando `POST /api/auth/password-reset/request` e `POST /api/auth/password-reset/confirm`.
- Tratamento visual completo de `PAYMENT_REVIEW`, com instrucao clara para cliente e acao operacional para admin via `POST /api/admin/orders/{orderId}/resolve-payment-review`.
- Alertas de estoque indisponivel e produtos sem estoque.
- Estados administrativos de webhook falho, entrega falha e reprocessamento.
- Remocao definitiva de controles tecnicos e qualquer dependencia de URL manual de API.
