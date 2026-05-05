# Plano de reestilizacao do frontend TPM

## Objetivo

Reestilizar todo o frontend do `The Pirate Max` para substituir a estetica atual de SaaS operacional por uma experiencia de marketplace digital com identidade propria: minimalista na estrutura, visualmente forte na marca e mais orientada a descoberta por categorias.

Este documento nao inicia a implementacao. Ele registra a leitura das referencias, a direcao visual escolhida, o impacto no codigo atual e a ordem recomendada de execucao.

## Leitura das referencias

### Thinking Gifts - header e dropdown

O que extrair:

- navbar muito limpa, com tipografia pequena, leve e sem excesso de peso visual
- espacamento generoso entre itens
- acoes do topo discretas
- dropdown de categoria como card flutuante, separado do fundo, com borda arredondada
- hierarquia silenciosa: o header orienta, mas nao compete com o conteudo

Como isso se traduz para TPM:

- remover a sensacao de barra de sistema/admin do header publico
- reduzir peso visual de busca, links e botoes
- reposicionar API/dev controls para um modo menos dominante ou somente contexto de desenvolvimento
- transformar categorias em dropdown/catalog menu, nao em tabs pesadas

### Bandeira pirata - identidade

O que extrair:

- Jolly Roger classico em preto e branco como simbolo de marca
- identidade iconica, irreverente e direta
- personalidade mais forte do que o visual corporativo atual

Como isso se traduz para TPM:

- trocar o badge azul `TPM` por um simbolo preto/branco inspirado em bandeira pirata
- usar preto como ancora visual, mas com composicao contida
- evitar estetica caotica, gamer neon ou excesso de textura
- construir uma marca "bold mas silenciosa": personalidade no logo e nos contrastes, leveza no layout

### GGMax - estrutura de catalogo

O que extrair:

- catalogo dividido em secoes empilhadas por categoria
- cada secao tem titulo, linha horizontal de cards e acao "ver mais"
- categorias populares no topo com imagens de capa grandes
- cards com imagem dominante, permitindo reconhecimento visual antes da leitura

Como isso se traduz para TPM:

- abandonar o grid unico filtrado por tabs como estrutura principal
- montar a home/catalogo como:
  - categorias populares
  - Inteligencia Artificial / Assinaturas / Streaming / Games, conforme dados disponiveis
  - filas horizontais por categoria
  - CTA "ver mais" por secao
- manter busca e filtros como recursos auxiliares, nao como arquitetura principal da pagina

Observacao tecnica:

- hoje o backend/frontend so tipa `STREAMING`, `ASSINATURA` e `GAMES`
- a categoria "Inteligencia Artificial" pode ser uma subcategoria visual derivada de `provider`, `name`, `sku` ou futura evolucao de contrato
- na primeira execucao, usar agrupamento visual conservador sem quebrar o contrato atual

### Depict - cor e contraste

O que extrair:

- fundo neutro claro
- contraste forte dentro dos componentes
- blocos pretos como destaque
- um unico accent quente para guiar acao
- visual limpo, sem poluicao cromatica

Como isso se traduz para TPM:

- paleta base:
  - fundo: off-white / cinza muito claro
  - texto: preto quase absoluto
  - superficies: branco, preto e cinzas quentes
  - accent: laranja vibrante no espirito da referencia Depict
- usar contraste claro/escuro em cards especiais, drawer, CTA e estados de destaque
- substituir gradientes azul/verde/laranja atuais por imagens, fundos solidos e acentos pontuais

## Sintese de direcao

O TPM deve parecer uma loja digital com alma pirata, nao um dashboard corporativo.

Direcao recomendada:

- estrutura minimalista inspirada no Thinking Gifts
- marca iconica preto/branco inspirada na bandeira pirata
- catalogo por secoes horizontais inspirado na GGMax
- contraste claro/escuro com accent quente inspirado na Depict

Principios:

- `contido`, nao apagado
- `pirata`, nao caricato
- `marketplace`, nao SaaS
- `visual`, nao dependente apenas de texto
- `catalogo por descoberta`, nao painel filtrado

## Diagnostico do frontend atual

Arquivos principais analisados:

- `frontend-app/src/shared/layout/StoreShell.tsx`
- `frontend-app/src/pages/CatalogPage.tsx`
- `frontend-app/src/shared/ui/CartDrawer.tsx`
- `frontend-app/src/pages/OrdersPage.tsx`
- `frontend-app/src/pages/AdminDashboardPage.tsx`
- `frontend-app/src/styles.css`
- `frontend-redesign.md`

Estado atual:

- a app React/Vite ja existe e ja separa loja, conta, pedidos e admin
- o header publico ainda parece ferramenta operacional por causa de API controls, badge azul e botoes pesados
- o catalogo usa hero + toolbar + grid filtrado por tabs
- cards de produto dependem de blocos com gradientes por categoria, sem imagem/arte dominante
- a paleta atual e azul SaaS, com verde operacional e laranja pontual
- as paginas de pedidos/admin herdam muitos tokens visuais do mesmo sistema azul

O ponto positivo:

- a base tecnica esta pronta para reestilizar sem recomecar do zero
- `lucide-react` ja esta instalado
- roteamento e carrinho ja existem
- os estados principais de loading, erro e vazio ja existem em boa parte do fluxo

## Escopo da reestilizacao

### Dentro do escopo

- novo sistema de tokens visuais no CSS
- novo header publico
- logo/simbolo TPM em direcao Jolly Roger
- dropdown de categorias
- pagina de catalogo por secoes horizontais
- cards de produto com arte/capa dominante
- categorias populares no topo
- carrinho/drawer ajustado para a nova linguagem visual
- paginas de pedidos e conta harmonizadas com a nova paleta
- admin mantido mais utilitario, mas sem herdar o azul corporativo atual
- responsividade desktop, tablet e mobile
- build final com `npm run build`

### Fora do escopo inicial

- mudar contrato de backend para novas categorias reais
- criar pagina de detalhe de produto
- redesenhar fluxo completo de checkout alem do drawer atual
- adicionar CMS/upload de imagens
- alterar regras de pedido, pagamento ou entrega

## Direcao de design system

### Tokens

Substituir os tokens atuais:

- `--bg`: de azul claro para off-white neutro
- `--surface`: branco limpo
- `--surface-dark`: preto/carvao para blocos de destaque
- `--text`: preto quase absoluto
- `--muted`: cinza medio quente
- `--brand`: preto
- `--accent`: laranja vibrante inspirado na Depict
- `--line`: cinza neutro claro
- `--radius`: reduzir de `16px` para algo entre `8px` e `12px`, com excecao de dropdown/drawer quando fizer sentido

Decisao fechada de accent:

- usar laranja vibrante como cor principal de acao e destaque, seguindo a referencia Depict
- manter o laranja concentrado em CTAs, setas, hover states, foco e pequenos elementos de enfase
- evitar espalhar o laranja em fundos grandes para preservar o contraste preto/branco e a identidade pirata
- manter vermelho escuro apenas para erro/perigo, nao como cor de marca

### Tipografia

- manter stack system por enquanto para evitar dependencia externa
- header com fonte pequena e leve
- titulos do catalogo mais compactos e fortes
- evitar hero gigante com texto institucional
- priorizar nomes de categorias e produtos

### Cards

Produto:

- imagem/arte dominante no topo
- corpo compacto
- preco bem legivel
- estoque e duracao como metadados secundarios
- botao de adicionar menor, mas claro

Categoria popular:

- card de capa com proporcao fixa
- titulo sobreposto ou abaixo, dependendo da imagem
- hover discreto

Secao de categoria:

- titulo
- linha horizontal com overflow
- divisoria/acao "ver mais"

## Arquitetura proposta de componentes

Criar ou extrair componentes pequenos para reduzir o peso de `CatalogPage.tsx`:

- `PirateLogo`
- `CategoryDropdown`
- `PopularCategoryRail`
- `CatalogSection`
- `ProductCard`
- `SectionMoreLink`

Local sugerido:

- `frontend-app/src/shared/ui/` para componentes genericos de UI/marca
- `frontend-app/src/pages/CatalogPage.tsx` pode continuar orquestrando dados e secoes na primeira fase

Alternativa futura:

- mover catalogo para `src/features/catalog/` quando houver mais comportamento, pagina de produto ou subcategorias reais

## Contrato de imagens de produto

Decisao fechada:

- evoluir ja para campo `imageUrl` nos produtos, em vez de depender apenas de fallback visual local.

Motivo:

- o catalogo por secoes precisa de cards com imagem dominante
- a GGMax funciona bem porque o reconhecimento visual vem antes do texto
- adicionar o campo agora evita reescrever os cards depois

Impacto tecnico previsto:

- adicionar coluna nullable `image_url` na tabela `products`
- adicionar campo `imageUrl` em `ProductEntity`
- expor `imageUrl` em `ProductResponse` e `AdminProductResponse`
- aceitar `imageUrl` em `CreateProductRequest` e `UpdateProductRequest`
- mapear `imageUrl` em `ProductCatalogService` e `AdminProductOperationsService`
- incluir `imageUrl?: string | null` em `frontend-app/src/shared/types.ts`
- incluir campo de URL de imagem no formulario admin de produto
- renderizar imagem real nos cards quando existir
- manter fallback visual local quando `imageUrl` estiver vazio ou falhar ao carregar

Validacao adicional:

- migration roda sem afetar produtos existentes
- produtos antigos continuam aparecendo com fallback
- produtos novos podem receber URL pelo admin
- cards nao quebram se a imagem externa falhar, carregar lento ou vier vazia

Observacao:

- a primeira versao deve armazenar URL, nao upload de arquivo. Upload/CMS fica para uma etapa futura.

## Plano de execucao

### Fase 1 - Contrato de imagem de produto

Objetivo:

Preparar backend, API, admin e tipos do frontend para cards com imagem real.

Tarefas:

- criar migration `image_url` nullable em `products`
- atualizar entidade e DTOs de produto
- atualizar requests admin de criar/editar produto
- atualizar service de catalogo e service admin
- atualizar cliente/tipos do React
- adicionar input de URL de imagem no formulario admin
- manter fallback visual quando a URL nao existir

Risco:

- baixo, desde que o campo seja nullable e retrocompativel

Validacao:

- testes/build do backend
- build do frontend
- produto sem imagem continua renderizando
- produto com `imageUrl` renderiza a imagem no catalogo

### Fase 2 - Fundacao visual

Objetivo:

Trocar a linguagem base sem mexer em fluxo de negocio.

Tarefas:

- atualizar tokens globais em `src/styles.css`
- remover gradientes decorativos azuis do `body`
- ajustar radius, sombras, bordas e estados de foco
- definir classes para superficie clara, superficie escura e accent
- revisar botoes, chips, inputs e badges para a nova paleta

Risco:

- impacto amplo por CSS global

Validacao:

- build TypeScript/Vite
- inspecao visual das rotas principais

### Fase 3 - Header publico

Objetivo:

Transformar o topo em uma navbar minimalista e de marca.

Tarefas:

- trocar `brand-badge` por `PirateLogo`
- simplificar texto da marca
- reduzir peso visual da busca
- criar dropdown de categorias inspirado no Thinking Gifts
- manter conta/carrinho como acoes discretas
- deslocar formulario de API para uma faixa/dev area menos dominante
- garantir comportamento mobile

Arquivos provaveis:

- `src/shared/layout/StoreShell.tsx`
- `src/shared/ui/PirateLogo.tsx`
- `src/shared/ui/CategoryDropdown.tsx`
- `src/styles.css`

Validacao:

- header desktop sem poluicao visual
- mobile sem sobreposicao
- dropdown acessivel por teclado/click

### Fase 4 - Catalogo por secoes

Objetivo:

Substituir a experiencia de grid filtrado por uma descoberta em secoes horizontais.

Tarefas:

- remover dependencia visual principal de `activeCategory`
- manter busca como filtro auxiliar
- criar agrupamento de produtos por categoria atual
- criar agrupamento visual especial para IA quando detectado por nome/provider/sku
- renderizar `Categorias populares` no topo
- renderizar secoes empilhadas com rails horizontais
- adicionar "ver mais" por secao, inicialmente como ancora/filtro local

Arquivos provaveis:

- `src/pages/CatalogPage.tsx`
- `src/shared/ui/ProductCard.tsx`
- `src/shared/ui/CatalogSection.tsx`
- `src/styles.css`

Validacao:

- rails horizontais funcionam sem quebrar layout
- produtos continuam adicionando ao carrinho
- estados loading/erro/vazio continuam claros

### Fase 5 - Imagens e arte de cards

Objetivo:

Dar identidade visual aos produtos usando `imageUrl` quando disponivel e fallback local quando necessario.

Tarefas:

- renderizar `imageUrl` como imagem dominante do card
- criar funcao de fallback por provider/categoria
- usar capas visuais locais via CSS quando nao houver imagem real ou quando ela falhar
- preferir padroes compactos e reconheciveis, sem gradiente SaaS
- mapear produtos conhecidos para fallbacks

Opcoes:

- primeira versao: URLs externas cadastradas no admin + fallback local
- versao posterior: upload/armazenamento proprio de assets

Validacao:

- cada card tem uma area visual dominante
- fallback nao parece quebrado
- texto nao estoura em cards pequenos

### Fase 6 - Carrinho, pedidos e conta

Objetivo:

Harmonizar areas de compra e pos-compra com a nova linguagem.

Tarefas:

- redesenhar `CartDrawer` em preto/branco/accent
- ajustar cards de pedidos para menos cara de dashboard azul
- preservar timeline/status com semantica clara
- revisar formularios de login/cadastro/conta para o mesmo sistema visual

Arquivos provaveis:

- `src/shared/ui/CartDrawer.tsx`
- `src/pages/OrdersPage.tsx`
- `src/pages/OrderDetailPage.tsx`
- `src/pages/LoginPage.tsx`
- `src/pages/RegisterPage.tsx`
- `src/pages/AccountPage.tsx`
- `src/styles.css`

Validacao:

- checkout segue funcionando
- pedido PIX e credenciais continuam legiveis
- estados de erro/sucesso mantem contraste acessivel

### Fase 7 - Admin utilitario alinhado

Objetivo:

Nao transformar admin em vitrine, mas retirar o azul SaaS e alinhar ao novo sistema.

Tarefas:

- ajustar sidebar/admin shell
- revisar metric panels, tabs, tabelas e formularios
- preservar densidade operacional
- manter estados perigosos bem destacados

Arquivos provaveis:

- `src/shared/layout/AdminShell.tsx`
- `src/pages/AdminDashboardPage.tsx`
- `src/styles.css`

Validacao:

- admin continua mais denso e funcional que a loja
- acoes criticas continuam reconheciveis
- mobile/tablet nao quebram formularios grandes

### Fase 8 - QA visual e tecnica

Objetivo:

Fechar a reestilizacao com verificacao real.

Tarefas:

- rodar `npm run build`
- abrir app em dev server
- revisar desktop e mobile
- testar adicionar ao carrinho, finalizar quando logado, abrir pedidos e admin
- ajustar sobreposicoes, overflow e responsividade

Validacao minima:

- `npm run build`
- catalogo carrega
- carrinho abre/fecha
- produto adiciona ao carrinho
- rotas principais renderizam
- layout mobile nao tem texto sobreposto

## Ordem recomendada de implementacao

1. Contrato `imageUrl` de produto
2. Fundacao visual em CSS
3. Header + logo + dropdown
4. Catalogo por secoes
5. Cards com imagem real + fallback
6. Carrinho e paginas do cliente
7. Admin alinhado
8. QA visual e build

## Decisoes fechadas e pendencias

### Accent color

Decisao:

- usar laranja vibrante no espirito da Depict como accent principal

### Logo

Recomendacao:

- criar simbolo proprio em SVG/CSS inspirado em Jolly Roger, sem copiar marca externa
- manter preto/branco e usar tamanho discreto no header

Alternativas:

- usar apenas wordmark `The Pirate Max`
- gerar asset bitmap depois e substituir o placeholder vetorial

### Imagens dos cards

Decisao:

- evoluir ja para campo `imageUrl` no backend/admin/frontend

Complemento:

- manter fallback visual local para produtos antigos, URL vazia ou falha de carregamento
- buscar/usar imagens externas apenas quando houver criterio de licenca e confiabilidade da URL

## Definicao de pronto

A reestilizacao sera considerada pronta quando:

- o header publico estiver minimalista e sem cara de painel operacional
- a marca TPM estiver ancorada em preto/branco com simbolo pirata reconhecivel
- o catalogo estiver organizado em secoes horizontais por categoria
- cards tiverem area visual dominante usando `imageUrl` quando existir
- a paleta azul corporativa tiver sido removida da loja publica
- o laranja Depict estiver aplicado como accent principal sem dominar a pagina
- carrinho, pedidos, conta e admin estiverem visualmente coerentes
- a app passar em `npm run build`
- a verificacao visual desktop/mobile nao mostrar sobreposicoes ou quebras graves

## Proximo passo

Com as decisoes de accent e `imageUrl` fechadas, o proximo passo de implementacao deve comecar pelo contrato de imagem de produto e depois seguir para a fundacao visual.
