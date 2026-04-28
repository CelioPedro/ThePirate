# The Pirate Max Catalogo Inicial

## 1. Objetivo

Este documento registra o catalogo inicial que estamos usando no projeto.

Neste momento a fonte de verdade do catalogo local fica alinhada entre:

- seed do backend
- inventario inicial de desenvolvimento
- fallback do frontend

## 2. Modelo Base

Cada produto do catalogo carrega os campos principais:

- `sku`
- `slug`
- `name`
- `category`
- `provider`
- `description`
- `price_cents`
- `currency`
- `region_code`
- `duration_days`
- `delivery_type`
- `requires_stock`
- `fulfillment_notes`

## 3. Regras Assumidas Nesta Fase

- moeda padrao: `BRL`
- regiao padrao: `BR`
- entrega padrao: `CREDENTIAL`
- todos os itens exigem estoque
- streamings e assinaturas recorrentes comecam com `duration_days = 30`
- contas de jogo usam `duration_days = 0`, porque nao dependem de vigencia mensal

## 4. Catalogo Atual

### Streaming - R$ 9,99

| SKU | Produto | Provider | Preco |
| --- | --- | --- | --- |
| `TPM-NETFLIX-001` | Netflix Premium | `NETFLIX` | `999` |
| `TPM-CRUNCHYROLL-001` | Crunchyroll | `CRUNCHYROLL` | `999` |
| `TPM-AMAZON-PRIME-001` | Amazon Prime Video | `AMAZON_PRIME` | `999` |
| `TPM-HULU-001` | Hulu | `HULU` | `999` |
| `TPM-NBA-001` | NBA League Pass | `NBA` | `999` |
| `TPM-PARAMOUNT-001` | Paramount+ | `PARAMOUNT_PLUS` | `999` |
| `TPM-DISNEY-001` | Disney+ | `DISNEY_PLUS` | `999` |

| `TPM-YOUTUBE-001` | YouTube Premium | `YOUTUBE_PREMIUM` | `1299` |

### Assinaturas

| SKU | Produto | Categoria | Provider | Preco |
| --- | --- | --- | --- | --- |
| `TPM-CANVA-001` | Canva Pro | `ASSINATURA` | `CANVA` | `699` |
| `TPM-FIGMA-001` | Figma | `ASSINATURA` | `FIGMA` | `2299` |
| `TPM-CHATGPT-001` | ChatGPT Plus | `ASSINATURA` | `CHATGPT_PLUS` | `2599` |
| `TPM-ANTIGRAVITY-001` | Antigravity | `ASSINATURA` | `ANTIGRAVITY` | `2599` |

### Games

| SKU | Produto | Categoria | Provider | Preco |
| --- | --- | --- | --- | --- |
| `TPM-LOL-D1-001` | Conta LoL Diamante 1 | `GAMES` | `LEAGUE_OF_LEGENDS` | `24990` |
| `TPM-LOL-P2-001` | Conta LoL Platina 2 | `GAMES` | `LEAGUE_OF_LEGENDS` | `15890` |
| `TPM-LOL-CHALL-001` | Conta LoL Desafiante | `GAMES` | `LEAGUE_OF_LEGENDS` | `38999` |

## 5. Estoque Inicial de Desenvolvimento

As quantidades atuais do seed local sao apenas operacionais para teste:

- Netflix: `8`
- Crunchyroll: `7`
- Amazon Prime Video: `7`
- Hulu: `5`
- NBA League Pass: `4`
- Paramount+: `6`
- Disney+: `7`
- YouTube Premium: `6`
- Canva Pro: `10`
- Figma: `6`
- ChatGPT Plus: `5`
- Antigravity: `4`
- Conta LoL Diamante 1: `3`
- Conta LoL Platina 2: `4`
- Conta LoL Desafiante: `2`

## 6. Proximo Passo Recomendado

Com esse catalogo ampliado, o proximo passo mais importante e separar melhor os tipos de estoque:

- credenciais recorrentes de assinatura
- contas unitarias de alto valor
- lotes por fornecedor
- prioridade de reposicao por categoria
