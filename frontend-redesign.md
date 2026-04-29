# Frontend Redesign Plan

## Objetivo

Replanejar o frontend do `The Pirate Max` para sair de uma tela unica experimental e evoluir para uma interface com:

- estrutura de produto clara
- separacao correta entre area publica, area do cliente e operacao
- visual mais profissional
- componentes previsiveis
- fluxo de compra mais confiavel
- base tecnica melhor para crescer

O foco aqui nao e apenas "deixar bonito". O foco e organizar a experiencia para parecer produto de verdade.

## Diagnostico do estado atual

O frontend atual cumpriu bem o papel de destravar validacao rapida do MVP, mas hoje ele mistura responsabilidades demais no mesmo plano:

- vitrine
- carrinho
- autenticacao
- pagamento
- pedidos
- credenciais
- seller panel

Isso gera alguns problemas claros:

1. O usuario nao entende qual e a area principal da tela.
2. Cliente e vendedor aparecem quase como o mesmo papel.
3. Checkout, login e operacao disputam atencao ao mesmo tempo.
4. O layout fica com vazios grandes, cards sem hierarquia e fluxo visual quebrado.
5. Alertas nativos do navegador passam sensacao de prototipo.
6. O `index.html` monolitico e o `app.js` centralizado demais vao ficar caros de manter.

## Direcao recomendada

### Recomendacao principal

Migrar o frontend para uma aplicacao `React + TypeScript + Vite`.

### Motivo

Neste ponto do projeto, a interface ja depende de:

- autenticacao
- carrinho
- pedidos
- polling
- area do cliente
- area administrativa
- multiplos estados de carregamento e erro

Manter isso em `HTML + CSS + JS` puros ainda e possivel, mas deixa a manutencao mais fragil do que precisa ser. Se o objetivo e chegar perto de um padrao profissional de mercado, a troca agora faz sentido.

### Stack recomendada

- `React`
- `TypeScript`
- `Vite`
- `React Router`
- `TanStack Query`
- `Zustand` ou contexto simples para carrinho e sessao
- `React Hook Form` + `Zod`
- `Lucide` para icones

## Arquitetura de produto recomendada

O frontend deve deixar de ser uma "pagina unica com tudo misturado" e passar a ter areas com papeis claros.

### 1. Area publica

Responsabilidade:

- descoberta de produtos
- navegacao por categoria
- busca
- detalhe rapido do produto
- entrada no fluxo de compra

Telas:

- `/` ou `/catalogo`
- `/produto/:slug` opcional mais a frente

### 2. Area do cliente

Responsabilidade:

- login e cadastro
- meus pedidos
- status do pedido
- acesso a credenciais
- historico

Telas:

- `/login`
- `/cadastro`
- `/conta`
- `/pedidos`
- `/pedidos/:id`

### 3. Area administrativa

Responsabilidade:

- pedidos recentes
- filtros por status
- estoque
- diagnostico
- reprocessamento
- alertas operacionais

Telas:

- `/admin`
- `/admin/pedidos`
- `/admin/estoque`
- `/admin/pedidos/:id`

## Estrutura visual recomendada

## Pagina 1 - Catalogo

Esta deve ser a tela principal para o usuario comprador.

### Composicao

1. `Header`
   - logo
   - busca
   - navegacao por categoria
   - botao de conta
   - botao de carrinho

2. `Hero curto`
   - texto objetivo
   - destaque de confianca
   - CTA para explorar catalogo

3. `Faixa de categorias`
   - Streaming
   - Assinaturas
   - Games

4. `Grid de produtos`
   - imagem
   - nome
   - categoria
   - preco
   - estoque
   - CTA

5. `Carrinho em drawer lateral`
   - nao como card principal no meio da pagina
   - resumo de itens
   - total
   - CTA de checkout

### Principio de layout

O catalogo precisa parecer marketplace, nao dashboard.

## Pagina 2 - Checkout / Acesso

Em vez de misturar autenticacao no mesmo bloco visual do carrinho, o ideal e:

- abrir um `drawer` ou `modal` de checkout
- se nao estiver logado, pedir login/cadastro dentro desse fluxo
- depois seguir para confirmacao do pedido

### Sequencia recomendada

1. usuario adiciona item ao carrinho
2. abre carrinho
3. clica em finalizar
4. se nao autenticado:
   - login
   - ou cadastro
5. cria pedido
6. exibe PIX

Isso e muito mais padrao do que espalhar formulario de autenticacao pela area operacional.

## Pagina 3 - Pedido / Pagamento

Depois que o pedido for criado, o ideal e levar o usuario para uma tela dedicada:

- `/pedidos/:id`

### Blocos dessa tela

1. resumo do pedido
2. status atual
3. PIX copia e cola
4. expiracao
5. timeline
   - pedido criado
   - aguardando pagamento
   - pagamento aprovado
   - entrega em processamento
   - entregue
6. credenciais entregues quando existir

### Principio

Pagamento e entrega merecem foco proprio. Hoje isso esta espremido num card pequeno.

## Pagina 4 - Minha conta / Meus pedidos

Essa area deve ser claramente privada e orientada ao cliente.

### Blocos

- cabecalho da conta
- pedidos recentes
- filtros por status
- acesso rapido a credenciais entregues

### O que evitar

- nao misturar seller info
- nao misturar configuracao operacional

## Pagina 5 - Painel administrativo

O painel do vendedor deve ser outra experiencia, nao uma aba ao lado de `Cliente` na mesma composicao.

### Layout recomendado

1. `Sidebar`
   - Visao geral
   - Pedidos
   - Estoque
   - Diagnostico

2. `Header interno`
   - busca
   - filtros
   - indicador de sessao

3. `Conteudo principal`
   - cards KPI
   - tabela/lista de pedidos
   - cards de estoque critico
   - acoes operacionais

### Principio

Cliente compra. Admin opera. Sao fluxos diferentes e merecem shells diferentes.

## Boas praticas de UX que vamos adotar

### 1. Hierarquia de informacao

- uma acao principal por tela
- menos blocos competindo entre si
- separacao clara entre descoberta, compra e pos-compra

### 2. Feedback de sistema

Trocar `alert()` por:

- toast para sucesso/erro leve
- banner inline para estados persistentes
- modal apenas quando necessario

### 3. Estados completos

Cada tela deve prever:

- loading
- vazio
- erro
- sucesso

### 4. Navegacao previsivel

- rotas reais
- URL coerente com o contexto
- botao de voltar fazendo sentido

### 5. Responsividade profissional

- desktop: catalogo em grid + drawer
- tablet: catalogo em grid menor
- mobile: foco em fluxo linear e CTA fixo quando necessario

## Boas praticas de arquitetura frontend

## Estrutura de pastas recomendada

```text
frontend-app/
  src/
    app/
      router/
      providers/
      layout/
    features/
      auth/
      catalog/
      cart/
      checkout/
      orders/
      admin/
      inventory/
    shared/
      components/
      ui/
      lib/
      hooks/
      types/
    pages/
      CatalogPage.tsx
      LoginPage.tsx
      RegisterPage.tsx
      OrderDetailPage.tsx
      AccountPage.tsx
      AdminDashboardPage.tsx
```

## Separacao de responsabilidades

### `features/auth`

- login
- cadastro
- sessao
- guardas de rota

### `features/catalog`

- categorias
- busca
- grid de produtos

### `features/cart`

- estado do carrinho
- drawer
- resumo

### `features/orders`

- listagem
- detalhe
- timeline
- credenciais

### `features/admin`

- dashboard
- pedidos
- diagnostico
- estoque

## Gerenciamento de estado recomendado

### `TanStack Query`

Para:

- produtos
- inventario
- pedidos
- detalhe de pedido
- credenciais
- admin

### `Zustand` ou contexto leve

Para:

- sessao autenticada
- carrinho
- preferencia de UI

## Contratos de integracao

O frontend deve se basear em uma camada de API bem definida:

- `authApi`
- `catalogApi`
- `ordersApi`
- `adminApi`

Nada de `fetch` espalhado direto pelos componentes.

## Design system base

Nao precisamos de um design system gigante agora, mas precisamos de um mini sistema coerente.

### Tokens minimos

- cores
- espacamento
- tipografia
- radius
- sombra
- estados de feedback

### Componentes base

- `Button`
- `Input`
- `Select`
- `Badge`
- `Card`
- `Drawer`
- `Modal`
- `Toast`
- `Tabs`
- `Table`
- `EmptyState`
- `StatusPill`

## Regras de produto e layout

1. Nao colocar cliente e vendedor no mesmo bloco principal.
2. Nao usar pagina operacional como extensao do catalogo.
3. Nao usar alertas nativos como feedback principal.
4. Nao usar cards altos vazios sem conteudo claro.
5. Nao deixar autenticacao perdida no meio da area de pedidos.
6. Nao tratar status de pagamento como detalhe secundario.

## Fases de execucao recomendadas

## Fase 1 - Fundacao tecnica

Objetivo:

Subir a nova base do frontend em stack moderna.

Tarefas:

- criar projeto `Vite + React + TypeScript`
- configurar roteamento
- configurar provider de sessao
- configurar cliente de API
- configurar tema base

## Fase 2 - Shell publica

Objetivo:

Entregar uma vitrine profissional.

Tarefas:

- header
- busca
- categorias
- grid de produtos
- drawer do carrinho

## Fase 3 - Autenticacao e checkout

Objetivo:

Colocar login/cadastro no lugar certo.

Tarefas:

- login
- cadastro
- sessao
- checkout autenticado
- criacao de pedido

## Fase 4 - Pedido e pos-compra

Objetivo:

Dar foco correto ao PIX e a entrega.

Tarefas:

- tela de pedido
- timeline
- polling
- credenciais entregues

## Fase 5 - Painel admin

Objetivo:

Criar operacao separada e limpa.

Tarefas:

- dashboard
- pedidos
- estoque
- diagnostico
- acoes admin

## Fase 6 - Polimento

Objetivo:

Fechar a experiencia com cara de produto.

Tarefas:

- estados vazios
- skeletons
- toasts
- acessibilidade
- refinamento visual

## Recomendacao objetiva

O passo mais correto agora e:

1. parar de remendar o `frontend/index.html` atual
2. tratar a tela atual como laboratorio de validacao
3. iniciar um frontend novo, modular e roteado
4. reimplementar o fluxo em ordem de produto, nao em ordem de improviso

## Ordem que eu seguiria agora

1. criar a nova base `frontend-app`
2. montar `CatalogPage`
3. montar `CartDrawer`
4. montar `Login/Register`
5. montar `OrderDetailPage`
6. montar `AccountPage`
7. montar `AdminDashboardPage`

## Definicao de pronto para o redesign

Vamos considerar este redesign bem sucedido quando:

- a experiencia de cliente estiver claramente separada da experiencia admin
- o checkout estiver linear e facil de entender
- autenticacao estiver no fluxo certo
- a tela de pedido estiver focada em pagamento e entrega
- o painel admin estiver em shell proprio
- o codigo frontend estiver modular, tipado e com camada de dados organizada
