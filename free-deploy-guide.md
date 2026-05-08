# The Pirate Max - Deploy gratuito de validacao

Este guia sobe um ambiente publico gratuito para testar o sistema fora do localhost. Ele nao substitui producao segura para vendas reais.

## Stack escolhida

- Frontend: Vercel Free
- Backend: Render Free
- Banco: Neon Free
- Dominio: URL gratuita das plataformas nesta etapa

## 1. Preparar banco no Neon

1. Crie conta em `https://neon.com`.
2. Crie um projeto Postgres.
3. Copie a connection string.
4. Separe os dados para o Render:

```text
DB_URL=jdbc:postgresql://HOST/DB?sslmode=require
DB_USERNAME=USUARIO
DB_PASSWORD=SENHA
```

No Neon, a string geralmente vem como:

```text
postgresql://USER:PASSWORD@HOST/DB?sslmode=require
```

Para Spring, transforme em:

```text
jdbc:postgresql://HOST/DB?sslmode=require
```

## 2. Subir backend no Render

1. Suba o projeto para o GitHub.
2. No Render, escolha `New` -> `Blueprint`.
3. Selecione o repositorio.
4. O Render deve ler `render.yaml`.
5. Preencha as envs marcadas como `sync: false`.

Variaveis minimas:

```text
DB_URL=jdbc:postgresql://...
DB_USERNAME=...
DB_PASSWORD=...
CORS_ALLOWED_ORIGIN_PATTERNS=https://URL-DO-FRONT.vercel.app
MERCADO_PAGO_ACCESS_TOKEN=...
MERCADO_PAGO_WEBHOOK_SECRET=...
MERCADO_PAGO_NOTIFICATION_URL=https://URL-DO-BACKEND.onrender.com/api/webhooks/mercadopago
```

Para deploy gratuito de validacao, voce pode usar Mercado Pago fake no primeiro deploy se quiser testar tela e banco antes do pagamento:

```text
MERCADO_PAGO_ACCESS_TOKEN=dummy
MERCADO_PAGO_WEBHOOK_SECRET=dummy
MERCADO_PAGO_NOTIFICATION_URL=https://URL-DO-BACKEND.onrender.com/api/webhooks/mercadopago
```

Mas para pagamento real controlado, use as credenciais reais do Mercado Pago.

## 3. Conferir backend

Depois do deploy, abra:

```text
https://URL-DO-BACKEND.onrender.com/actuator/health
```

Esperado:

```json
{"status":"UP"}
```

Depois confira:

```text
https://URL-DO-BACKEND.onrender.com/api/products
```

## 4. Subir frontend na Vercel

1. No Vercel, importe o mesmo repositorio.
2. Configure:

```text
Root Directory: frontend-app
Build Command: npm run build
Output Directory: dist
```

3. Adicione env:

```text
VITE_API_BASE_URL=https://URL-DO-BACKEND.onrender.com
```

4. Faça deploy.

## 5. Ajustar CORS

Depois que a Vercel gerar a URL, volte no Render e ajuste:

```text
CORS_ALLOWED_ORIGIN_PATTERNS=https://URL-DO-FRONT.vercel.app
```

Depois redeploy/restart no Render.

## 6. Mercado Pago webhook

No painel do Mercado Pago:

```text
https://URL-DO-BACKEND.onrender.com/api/webhooks/mercadopago
```

Eventos:

- Pagamentos
- Order (Mercado Pago), opcional durante transicao

Copie a assinatura secreta para:

```text
MERCADO_PAGO_WEBHOOK_SECRET
```

## 7. Primeiro teste publico

1. Acesse a URL da Vercel.
2. Crie uma conta.
3. Entre no admin com admin real ou bootstrap temporario.
4. Confira estoque.
5. Crie um pedido.
6. Verifique se o PIX aparece.
7. Pague somente em teste controlado.
8. Confirme logs no Render:

```text
event=mercado_pago_pix_request
event=mercado_pago_pix_created
event=mercado_pago_webhook_received
event=payment_approved
event=order_delivered
```

## 8. Limites conhecidos do gratuito

- Render Free pode dormir.
- Webhook pode sofrer cold start.
- Neon Free tem limites de armazenamento/compute.
- Sem dominio proprio nesta etapa.
- Nao recomendado para abrir venda real.

Quando o fluxo estiver validado, o primeiro upgrade recomendado e backend pago pequeno.
