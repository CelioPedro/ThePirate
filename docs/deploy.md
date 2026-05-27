# Deploy e operacao

Este documento resume o fluxo operacional recomendado para alteracoes no The Pirate Max.

## Fluxo geral

1. Fazer alteracoes localmente.
2. Rodar testes e builds possiveis.
3. Commitar as alteracoes.
4. Enviar para o GitHub.
5. Validar o deploy do frontend na Vercel, quando houver mudancas em `frontend-app/`.
6. Atualizar manualmente o backend na Oracle VM, quando houver mudancas em `backend/`.

## Frontend

O frontend de producao fica em `frontend-app/` e e publicado pela Vercel.

Validacao local:

```bash
cd frontend-app
npm run build
```

Deploy:

```bash
git add .
git commit -m "descricao da alteracao"
git push origin main
```

A Vercel deve redeployar automaticamente quando detectar alteracoes relevantes.

Variaveis `VITE_*` sao aplicadas no build. Se `VITE_API_BASE_URL` mudar, o frontend precisa de novo deploy.

## Backend

O backend de producao roda em Docker na Oracle Cloud VM.

Atualizacao manual na VM:

```powershell
ssh -i "$env:USERPROFILE\.ssh\the-pirate-max-oracle.key" ubuntu@163.176.60.109
```

```bash
cd ~/apps/ThePirate
git pull origin main
docker build -t the-pirate-backend:latest .
docker stop the-pirate-backend
docker rm the-pirate-backend
docker run -d \
  --name the-pirate-backend \
  --env-file backend.env \
  -p 8080:8080 \
  --restart unless-stopped \
  the-pirate-backend:latest
```

Validacao:

```bash
docker logs -f the-pirate-backend
curl http://localhost:8080/actuator/health
curl https://api.163.176.60.109.sslip.io/actuator/health
curl https://api.163.176.60.109.sslip.io/api/products
```

## Quando mexer na Vercel

- Alteracao no frontend.
- Alteracao de variaveis de ambiente `VITE_*`.
- Mudanca de dominio.
- Investigacao de logs de build.
- Configuracao de analytics ou dominio proprio.

## Quando mexer na VM

- Alteracao no backend.
- Alteracao de variaveis do backend.
- Alteracao de Nginx.
- Renovacao ou verificacao de HTTPS.
- Investigacao de logs de producao.
- Configuracao de Mercado Pago.

## Quando mexer no Neon

- Backup/export.
- Consulta controlada de dados.
- Revisao de usuarios, pedidos ou estoque.
- Ajuste emergencial documentado.
- Rotacao de senha do banco.

Evite editar dados de producao manualmente, principalmente pedidos, pagamentos e credenciais.

## Checklist antes de publicar alteracoes

- `npm run build` em `frontend-app/` quando houver mudanca de frontend.
- `mvn -f backend/pom.xml test` quando houver mudanca de backend.
- Verificar se nao ha segredos em arquivos versionados.
- Confirmar se os links publicos seguem ativos.
- Conferir logs apos deploy do backend.

