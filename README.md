# The Pirate Max

Marketplace digital full stack com catalogo, autenticacao, carrinho, pedidos, painel administrativo, estoque de credenciais e entrega automatizada apos confirmacao de pagamento.

> Status: MVP tecnico funcional em validacao. O projeto demonstra arquitetura, fluxo de compra digital e operacao em ambiente publico, mas ainda nao deve ser comunicado como produto final aberto para venda publica sem a revisao final de pagamento, dominio, seguranca e politicas comerciais.

## Links

- Frontend em producao: https://the-pirate-frontend.vercel.app
- Backend/API: https://api.163.176.60.109.sslip.io
- Health check: https://api.163.176.60.109.sslip.io/actuator/health
- Repositorio: https://github.com/CelioPedro/ThePirate

## Visao do produto

The Pirate Max simula uma operacao real de venda de produtos digitais. O usuario pode navegar pelo catalogo, criar uma conta, adicionar itens ao carrinho e gerar pedidos. No painel administrativo, o operador acompanha produtos, pedidos e estoque de credenciais. O backend foi estruturado para consistencia, seguranca operacional e evolucao para pagamentos reais.

O objetivo deste repositorio e apresentar a construcao de um sistema full stack de ponta a ponta: frontend, backend, banco, autenticacao, regras de pedido, deploy e documentacao operacional.

## Funcionalidades

- Catalogo de produtos digitais por categoria.
- Cadastro e login de usuarios.
- Carrinho e criacao de pedidos.
- Reserva de estoque durante o pedido.
- Painel administrativo para produtos, pedidos e credenciais.
- Entrega protegida de credenciais.
- Backend Java/Spring Boot com PostgreSQL.
- Migracoes de banco com Flyway.
- Frontend React/Vite/TypeScript.
- Deploy do frontend na Vercel.
- Backend em Docker na Oracle Cloud VM.
- Nginx como reverse proxy com HTTPS.

## Stack tecnica

### Frontend

- React
- Vite
- TypeScript
- React Router
- Vercel

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA/Hibernate
- Flyway
- PostgreSQL
- Docker

### Infraestrutura

- Oracle Cloud VM Always Free
- Docker
- Nginx
- HTTPS com Certbot/Let's Encrypt
- Neon PostgreSQL
- Vercel

## Arquitetura

```text
Usuario
  -> Frontend Vercel
  -> API HTTPS em api.163.176.60.109.sslip.io
  -> Nginx na Oracle VM
  -> Container Docker do backend Spring Boot
  -> Banco Neon PostgreSQL
```

Detalhes em [docs/architecture.md](docs/architecture.md).

## Estrutura do repositorio

```text
backend/       API Java/Spring Boot, dominio, servicos, seguranca e migracoes
frontend-app/  Frontend React/Vite usado em producao
frontend/      Prototipo frontend legado
docs/          Documentacao de portfolio, arquitetura, deploy e roadmap
tools/         Assets fonte e scripts auxiliares
```

## Rodando localmente

### Frontend

```bash
cd frontend-app
npm install
npm run dev
```

### Backend

```bash
mvn -f backend/pom.xml spring-boot:run -Dspring-boot.run.profiles=local
```

Tambem existem perfis para PostgreSQL local e producao. Consulte [docs/deploy.md](docs/deploy.md) antes de usar ambientes com dados persistentes ou integracoes reais.

## Validacao

```bash
cd frontend-app
npm run build
```

```bash
mvn -f backend/pom.xml test
```

## Status atual

- MVP tecnico funcional.
- Ambiente publico com backend sem cold start.
- Fluxos de catalogo, autenticacao, pedidos e admin em validacao.
- Pagamento real ainda em fase de integracao/validacao final.
- Visual e identidade do frontend ainda em evolucao.

## Pendencias antes de venda real

- Configurar Mercado Pago com credenciais reais de producao.
- Validar webhook real em dominio definitivo.
- Usar dominio proprio.
- Rotacionar segredos usados durante desenvolvimento.
- Revisar termos de uso, reembolso, suporte e politicas comerciais.
- Melhorar observabilidade e rotina de backup.
- Refinar layout final do frontend.
- Fazer compra real controlada com valor baixo.

## Documentacao

- [docs/architecture.md](docs/architecture.md): arquitetura e componentes.
- [docs/deploy.md](docs/deploy.md): fluxo de deploy e operacao.
- [docs/portfolio-roadmap.md](docs/portfolio-roadmap.md): proximos passos para deixar o projeto pronto como portfolio.
- [github-portfolio-presentation-plan.md](github-portfolio-presentation-plan.md): guia original de apresentacao comercial.

