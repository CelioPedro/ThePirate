# The Pirate Max - Guia para Apresentacao Comercial e Fluxo de Deploy

Este arquivo deve orientar a criacao de uma apresentacao comercial do projeto no GitHub/portfolio e tambem servir como guia operacional para futuras alteracoes no codigo.

## 1. Objetivo da apresentacao

Apresentar o The Pirate Max como um marketplace digital funcional, com catalogo, carrinho, login, pedidos, painel administrativo, estoque de credenciais, backend em producao e infraestrutura sem cold start.

O foco nao deve ser vender como produto final ainda. O foco e demonstrar:

- visao de produto;
- arquitetura full stack;
- fluxo real de compra digital;
- backend estruturado para producao;
- deploy em ambiente proprio;
- evolucao futura para pagamentos reais.

## 2. Links importantes

Substituir ou confirmar os links antes de publicar:

- Frontend em producao: `https://the-pirate-frontend.vercel.app`
- Backend/API: `https://api.163.176.60.109.sslip.io`
- Health check: `https://api.163.176.60.109.sslip.io/actuator/health`
- Repositorio: `https://github.com/CelioPedro/ThePirate`

Observacao: o dominio `sslip.io` e util para teste/infra sem dominio proprio. Para uma apresentacao mais profissional, futuramente usar dominio proprio.

## 3. Texto sugerido para README comercial

### Titulo

The Pirate Max - Marketplace digital com entrega automatizada

### Descricao curta

The Pirate Max e uma plataforma full stack para venda de produtos digitais, com catalogo, autenticacao, carrinho, pedidos, controle de estoque, painel administrativo e entrega de credenciais apos pagamento.

### Descricao expandida

O projeto simula uma operacao real de marketplace digital. O usuario consegue navegar pelo catalogo, criar conta, adicionar produtos ao carrinho e gerar um pedido. No painel administrativo, o operador acompanha pedidos, produtos e estoque de credenciais. O backend foi estruturado com foco em consistencia, seguranca operacional e evolucao para pagamentos reais.

### Funcionalidades principais

- Catalogo de produtos digitais por categoria.
- Cadastro e login de usuarios.
- Carrinho e criacao de pedidos.
- Reserva de estoque durante o pedido.
- Painel administrativo para produtos, pedidos e credenciais.
- Entrega de credenciais protegida.
- Backend Java/Spring Boot com PostgreSQL.
- Banco remoto Neon/PostgreSQL.
- Frontend Vite/React hospedado na Vercel.
- Backend em Docker na Oracle Cloud VM, sem cold start.
- Nginx como reverse proxy com HTTPS via Certbot.

## 4. Stack tecnica

### Frontend

- React
- Vite
- TypeScript
- Vercel

### Backend

- Java
- Spring Boot
- Spring Security
- JPA/Hibernate
- Flyway
- PostgreSQL
- Docker

### Infraestrutura

- Oracle Cloud VM Always Free
- Docker na VM
- Nginx como reverse proxy
- HTTPS com Certbot/Let's Encrypt
- Neon PostgreSQL remoto
- Vercel para frontend

## 5. Arquitetura atual

```text
Usuario
  -> Frontend Vercel
  -> API HTTPS em api.163.176.60.109.sslip.io
  -> Nginx na Oracle VM
  -> Container Docker do backend Spring Boot
  -> Banco Neon PostgreSQL
```

## 6. Status atual do projeto

Estado recomendado para comunicar:

- MVP tecnico funcional.
- Ambiente publico sem cold start para o backend.
- Fluxo de catalogo, autenticacao, pedidos e admin em validacao.
- Pagamento real ainda em fase de integracao/validacao final.
- Visual e identidade do frontend ainda em evolucao.

Evitar dizer que o produto esta pronto para venda publica real enquanto Mercado Pago, dominio proprio, politicas comerciais e revisao final de seguranca nao estiverem fechados.

## 7. Pendencias antes de vender de verdade

- Configurar Mercado Pago com credenciais reais de producao.
- Validar webhook real em dominio definitivo.
- Usar dominio proprio.
- Rotacionar segredos expostos durante desenvolvimento.
- Revisar politicas de suporte, reembolso e termos de uso.
- Melhorar observabilidade e rotina de backup.
- Refinar layout final do frontend.
- Validar fluxo completo de compra real com valor baixo.

## 8. Como fazer alteracoes no codigo agora

O projeto esta em um monorepo com backend e frontend no mesmo repositorio.

Fluxo recomendado:

1. Fazer alteracoes localmente.
2. Rodar testes/build local quando possivel.
3. Commitar e enviar para o GitHub.
4. A Vercel deve redeployar automaticamente o frontend quando houver mudancas na pasta `frontend-app`.
5. O backend na Oracle VM nao redeploya sozinho. Ele precisa ser atualizado manualmente na VM, a menos que futuramente seja configurado CI/CD.

## 9. Atualizacao do frontend

Quando alterar apenas o frontend:

```bash
git add .
git commit -m "descricao da alteracao"
git push origin main
```

Depois:

- verificar o deploy automatico na Vercel;
- se necessario, clicar em Redeploy no dashboard da Vercel;
- testar o site publico.

Importante: variaveis `VITE_*` sao aplicadas no build. Se alterar `VITE_API_BASE_URL`, precisa fazer redeploy.

## 10. Atualizacao do backend na Oracle VM

Quando alterar o backend:

1. Subir as alteracoes para o GitHub.
2. Entrar na VM:

```powershell
ssh -i "$env:USERPROFILE\.ssh\the-pirate-max-oracle.key" ubuntu@163.176.60.109
```

3. Atualizar o codigo:

```bash
cd ~/apps/ThePirate
git pull origin main
```

4. Rebuildar a imagem Docker:

```bash
docker build -t the-pirate-backend:latest .
```

5. Recriar o container:

```bash
docker stop the-pirate-backend
docker rm the-pirate-backend

docker run -d \
  --name the-pirate-backend \
  --env-file backend.env \
  -p 8080:8080 \
  --restart unless-stopped \
  the-pirate-backend:latest
```

6. Acompanhar logs:

```bash
docker logs -f the-pirate-backend
```

7. Testar:

```bash
curl http://localhost:8080/actuator/health
curl https://api.163.176.60.109.sslip.io/actuator/health
curl https://api.163.176.60.109.sslip.io/api/products
```

## 11. Quando precisa mexer na Vercel

Mexer na Vercel quando:

- alterar variaveis de ambiente do frontend;
- mudar dominio;
- revisar logs de build;
- forcar redeploy;
- configurar analytics ou dominio proprio.

Nao precisa mexer na Vercel para alteracoes exclusivas do backend, exceto se o contrato da API mudar e o frontend tambem precisar ser atualizado.

## 12. Quando precisa mexer na VM

Mexer na VM quando:

- alterar backend;
- alterar variaveis do backend no `backend.env`;
- alterar Nginx;
- renovar/verificar HTTPS;
- investigar logs de producao;
- atualizar Docker/imagem/container;
- configurar Mercado Pago no backend.

## 13. Quando precisa mexer no Neon

Mexer no Neon quando:

- consultar dados diretamente;
- fazer backup/export;
- revisar usuarios, pedidos ou estoque;
- executar algum ajuste emergencial controlado;
- rotacionar senha do banco.

Evitar editar dados manualmente em producao, principalmente pedidos, pagamentos e credenciais, salvo em operacao consciente e documentada.

## 14. Proximo passo recomendado depois da apresentacao

Depois de criar o GitHub/portfolio:

1. Validar login/admin no ambiente publico.
2. Adicionar algumas credenciais reais de teste pelo painel admin.
3. Confirmar compra ate o ponto anterior ao pagamento real.
4. Configurar Mercado Pago de producao com dominio definitivo ou URL HTTPS atual.
5. Fazer uma compra real de baixo valor.
6. Ajustar frontend com identidade visual final.

