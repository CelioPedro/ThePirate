# The Pirate Max - Plano do que depende do operador

Este plano lista apenas os passos que dependem diretamente de voce: criar contas, escolher servicos, configurar paineis externos, validar pagamentos reais e tomar decisoes operacionais. A parte tecnica que pode ser feita no codigo fica fora deste arquivo.

## 1. Decisoes iniciais

### 1.1 Definir dominio

Escolher e comprar um dominio para o projeto.

Sugestoes:

- `thepiratemax.com.br`
- `thepiratemax.com`
- `thepiratemax.gg`

Decisao recomendada para MVP: comprar um dominio simples e usar:

- frontend: `https://thepiratemax.com.br`
- backend/API: `https://api.thepiratemax.com.br`

### 1.2 Definir nivel de hospedagem

Para teste gratuito, Render/Vercel/Neon funcionam.

Para venda real, evitar backend gratuito com cold start. O backend precisa responder bem em:

- login
- checkout
- webhook Mercado Pago
- entrega automatica

Decisao recomendada para venda real: migrar backend para um plano pago simples ou outro provedor sem cold start antes de abrir para compradores reais.

## 2. Contas externas

### 2.1 Mercado Pago

Voce precisa ter:

- conta Mercado Pago real da operacao
- acesso ao painel de desenvolvedor
- aplicacao produtiva criada
- credenciais produtivas
- webhook produtivo configurado

Guardar com seguranca:

- `MERCADO_PAGO_ACCESS_TOKEN`
- `MERCADO_PAGO_WEBHOOK_SECRET`

Nunca publicar essas chaves em print, GitHub, video ou conversa.

### 2.2 Banco gerenciado

Voce ja iniciou com Neon.

Manter salvos:

- host
- database
- username
- password
- connection string

Para producao real, confirmar se o plano escolhido cobre:

- armazenamento suficiente
- backup
- estabilidade
- limite de conexoes

### 2.3 E-mail transacional

O backend ja tem base de recuperacao de senha, mas falta escolher o servico que enviara o e-mail.

Opcoes comuns:

- Resend
- Brevo
- SendGrid
- Amazon SES

Para MVP, Resend ou Brevo costumam ser mais simples.

Voce precisara:

- criar conta
- validar dominio/remetente
- gerar API key
- definir e-mail remetente, por exemplo `suporte@thepiratemax.com.br`

## 3. Configuracoes de producao

### 3.1 Variaveis do backend

No painel do provedor do backend, preencher:

```text
SPRING_PROFILES_ACTIVE=production
DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...

AUTH_JWT_SECRET=...
AUTH_JWT_EXPIRATION_HOURS=24
AUTH_PASSWORD_RESET_EXPIRATION_MINUTES=30
AUTH_PASSWORD_RESET_EXPOSE_TOKEN=false

CREDENTIAL_ENCRYPTION_SECRET=...
CREDENTIAL_ENCRYPTION_KEY_VERSION=prod-aesgcm-v1

MERCADO_PAGO_ACCESS_TOKEN=APP_USR-...
MERCADO_PAGO_WEBHOOK_SECRET=...
MERCADO_PAGO_NOTIFICATION_URL=https://api.seudominio.com/api/webhooks/mercadopago
MERCADO_PAGO_PIX_EXPIRATION_MINUTES=30

CORS_ALLOWED_ORIGIN_PATTERNS=https://seudominio.com

RATE_LIMIT_ENABLED=true
RATE_LIMIT_LOGIN_PER_MINUTE=10
RATE_LIMIT_REGISTER_PER_MINUTE=5
RATE_LIMIT_PASSWORD_RESET_PER_MINUTE=5
RATE_LIMIT_CHECKOUT_PER_MINUTE=20
```

### 3.2 Variaveis que nao devem ficar ativas em producao

Nao usar:

```text
AUTH_ENABLED=false
MERCADO_PAGO_WEBHOOK_SIGNATURE_VALIDATION_ENABLED=false
AUTH_PASSWORD_RESET_EXPOSE_TOKEN=true
```

Evitar em producao:

```text
MERCADO_PAGO_PAYER_EMAIL
MERCADO_PAGO_PAYER_FIRST_NAME
```

Essas variaveis sao uteis em teste/sandbox, mas a venda real deve usar os dados do cliente autenticado.

## 4. Admin real

### 4.1 Criar primeiro admin

No primeiro deploy produtivo, ligar temporariamente:

```text
INITIAL_ADMIN_ENABLED=true
INITIAL_ADMIN_EMAIL=seu-email-admin@dominio.com
INITIAL_ADMIN_PASSWORD=uma-senha-forte-com-12-ou-mais-caracteres
INITIAL_ADMIN_NAME=Seu Nome
```

Depois de criar o admin:

1. confirmar login no frontend
2. voltar no provedor
3. mudar `INITIAL_ADMIN_ENABLED=false`
4. redeploy/restart do backend

### 4.2 Guardar acesso

Usar um gerenciador de senhas.

Nao usar senha curta, repetida ou compartilhada.

## 5. Estoque inicial

Antes de vender:

1. escolher produtos reais do MVP
2. cadastrar produtos no painel admin
3. cadastrar credenciais reais ou descartaveis
4. revisar preco, categoria, descricao e duracao
5. conferir estoque no painel admin

Regra operacional: nao anunciar produto sem estoque suficiente para atender o pedido automaticamente.

## 6. Mercado Pago produtivo

### 6.1 Configurar webhook

No painel Mercado Pago:

- modo: producao
- URL: `https://api.seudominio.com/api/webhooks/mercadopago`
- eventos: pagamentos e/ou orders conforme configuracao ativa
- assinatura secreta: copiar para `MERCADO_PAGO_WEBHOOK_SECRET`

### 6.2 Validar com compra real pequena

Fazer teste com:

- produto barato
- credencial descartavel
- conta compradora diferente da conta vendedora
- Pix real de baixo valor

Validar:

1. pedido fica `PENDING`
2. Pix e gerado
3. pagamento e confirmado pelo Mercado Pago
4. webhook chega no backend
5. pedido vira `PAID`
6. entrega roda e vira `DELIVERED`
7. cliente consegue ver a credencial
8. admin enxerga pedido e logs

## 7. Testes obrigatorios antes de abrir

Executar pelo menos:

1. compra produtiva aprovada
2. compra criada e nao paga ate expirar
3. tentativa de compra sem estoque
4. login de cliente
5. login de admin
6. cadastro de nova credencial
7. revelacao/copia de credencial pelo admin
8. simulacao operacional de `PAYMENT_REVIEW`

O MVP so deve abrir quando esses testes estiverem previsiveis.

## 8. Politicas e textos publicos

Antes de vender, criar textos minimos para:

- termos de uso
- politica de privacidade
- politica de entrega
- politica de reembolso
- canal de suporte

Para MVP, podem ser paginas simples, mas precisam existir.

## 9. Checklist final de abertura

- dominio comprado e apontado
- frontend publicado no dominio final
- backend publicado em URL HTTPS final
- CORS restrito ao dominio real
- Mercado Pago produtivo configurado
- webhook produtivo funcionando
- banco produtivo com backup
- admin real criado
- bootstrap de admin desligado
- estoque real cadastrado
- compra real pequena validada
- credenciais entregues corretamente
- logs acessiveis
- termos e suporte publicados

## 10. O que pode ficar para depois da primeira venda controlada

- multi-vendedor
- split de pagamento
- painel financeiro completo
- MFA admin
- fila duravel para entrega
- rate limit distribuido
- dashboard avancado de observabilidade
- automacao completa de reembolso

Esses pontos sao importantes, mas nao bloqueiam um teste produtivo controlado com poucos usuarios e estoque pequeno, desde que voce acompanhe a operacao de perto.
