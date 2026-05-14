import { humanizeCategory } from "../lib/format";
import type { CatalogCategory, Product } from "../types";

export const FALLBACK_CATEGORIES: CatalogCategory[] = [
  { id: "fallback-ia", name: "Inteligencia Artificial", slug: "inteligencia-artificial", description: "ChatGPT, Gemini e ferramentas", imageUrl: null, sortOrder: 10, active: true },
  { id: "fallback-assinaturas", name: "Assinaturas e Premium", slug: "assinaturas-premium", description: "Softwares e acessos premium", imageUrl: null, sortOrder: 20, active: true },
  { id: "fallback-streaming", name: "Streaming", slug: "streaming", description: "Entretenimento digital", imageUrl: null, sortOrder: 30, active: true },
  { id: "fallback-games", name: "Games", slug: "games", description: "Contas, creditos e jogos", imageUrl: null, sortOrder: 40, active: true },
  { id: "fallback-gift-cards", name: "Gift Cards", slug: "gift-cards", description: "Cartoes digitais e creditos", imageUrl: null, sortOrder: 50, active: true },
  { id: "fallback-softwares", name: "Softwares e Licencas", slug: "softwares-licencas", description: "Chaves e ferramentas", imageUrl: null, sortOrder: 60, active: true },
  { id: "fallback-redes", name: "Redes Sociais", slug: "redes-sociais", description: "Servicos para plataformas sociais", imageUrl: null, sortOrder: 70, active: true },
  { id: "fallback-servicos", name: "Servicos Digitais", slug: "servicos-digitais", description: "Operacoes digitais sob demanda", imageUrl: null, sortOrder: 80, active: true },
  { id: "fallback-cursos", name: "Cursos e Treinamentos", slug: "cursos-treinamentos", description: "Conteudos e formacoes", imageUrl: null, sortOrder: 90, active: true },
  { id: "fallback-contas", name: "Contas Digitais", slug: "contas-digitais", description: "Acessos e perfis digitais", imageUrl: null, sortOrder: 100, active: true }
];

const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  "inteligencia-artificial": "/catalog/categories/IA.webp",
  "assinaturas-premium": "/catalog/categories/Assinaturas e Premium.webp",
  streaming: "/catalog/categories/Streming.webp",
  games: "/catalog/categories/Games.webp",
  "gift-cards": "/catalog/categories/Gift Cards.webp",
  "softwares-licencas": "/catalog/categories/Software%20e%20Licen%C3%A7as.webp",
  "redes-sociais": "/catalog/categories/Redes Sociais.webp",
  "servicos-digitais": "/catalog/categories/Servi%C3%A7os%20Digitais.webp",
  "cursos-treinamentos": "/catalog/categories/Cursos e Treinamentos.webp",
  "contas-digitais": "/catalog/categories/Contas Digitais.webp"
};

const PRODUCT_IMAGE_BY_KEY: Record<string, string> = {
  adobe: "/catalog/products/adobe.webp",
  "amazon-prime": "/catalog/products/prime.webp",
  canva: "/catalog/products/canva.webp",
  capcut: "/catalog/products/capcut.webp",
  claude: "/catalog/products/claude.webp",
  "chatgpt-plus": "/catalog/products/gpt.webp",
  chatgpt: "/catalog/products/gpt.webp",
  copilot: "/catalog/products/copilot.webp",
  crunchyroll: "/catalog/products/cruchyroll.webp",
  discord: "/catalog/products/discord.webp",
  dota: "/catalog/products/dota.webp",
  "dota-2": "/catalog/products/dota.webp",
  "disney-plus": "/catalog/products/disney.webp",
  disney: "/catalog/products/disney.webp",
  dropbox: "/catalog/products/dropbox.webp",
  duolingo: "/catalog/products/duolinguo.webp",
  figma: "/catalog/products/Figma.webp",
  github: "/catalog/products/github.webp",
  "google-drive": "/catalog/products/googledrive.webp",
  googledrive: "/catalog/products/googledrive.webp",
  gpt: "/catalog/products/gpt.webp",
  hulu: "/catalog/products/hulu.webp",
  icloud: "/catalog/products/icloud.webp",
  instagram: "/catalog/products/instagrram.webp",
  "league-of-legends": "/catalog/products/lol.webp",
  lol: "/catalog/products/lol.webp",
  linkedin: "/catalog/products/linkedin.webp",
  midjourney: "/catalog/products/midjourney.webp",
  "nba-league-pass": "/catalog/products/nba.webp",
  nba: "/catalog/products/nba.webp",
  netflix: "/catalog/products/netflix.webp",
  nintendo: "/catalog/products/nintendp.webp",
  notion: "/catalog/products/notion.webp",
  "paramount-plus": "/catalog/products/paramount.webp",
  paramount: "/catalog/products/paramount.webp",
  paypal: "/catalog/products/paypal.webp",
  pinterest: "/catalog/products/pinterest.webp",
  prime: "/catalog/products/prime.webp",
  reddit: "/catalog/products/reddit.webp",
  roblox: "/catalog/products/roblox.webp",
  snapchat: "/catalog/products/snapchat.webp",
  spotify: "/catalog/products/spotify.webp",
  steam: "/catalog/products/steam.webp",
  teknisa: "/catalog/products/teknisa.webp",
  telegram: "/catalog/products/telegram.webp",
  tiktok: "/catalog/products/tiktok.webp",
  twitch: "/catalog/products/twicth.webp",
  antigravity: "/catalog/products/antigravity.webp",
  vscode: "/catalog/products/vscode.webp",
  whatsapp: "/catalog/products/whatsapp.webp",
  "x-premium": "/catalog/products/x.webp",
  xbox: "/catalog/products/xbox.webp",
  youtube: "/catalog/products/youtube.webp"
};

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  hulu: "/catalog/products/hulu.webp",
  "nba-league-pass": "/catalog/products/nba.webp",
  "lol-diamante-1": "/catalog/products/lol.webp",
  "lol-platina-2": "/catalog/products/lol.webp",
  "lol-desafiante": "/catalog/products/lol.webp",
  "lol-ferro": "/catalog/products/lol.webp",
  "lol-bronze": "/catalog/products/lol.webp",
  "lol-prata": "/catalog/products/lol.webp",
  "lol-ouro": "/catalog/products/lol.webp",
  "lol-esmeralda": "/catalog/products/lol.webp",
  "lol-mestre": "/catalog/products/lol.webp",
  "dota-ancient": "/catalog/products/dota.webp",
  "dota-divine": "/catalog/products/dota.webp",
  "dota-immortal": "/catalog/products/dota.webp"
};

const PRODUCT_IMAGE_BY_SKU: Record<string, string> = {
  "TPM-HULU-001": "/catalog/products/hulu.webp",
  "TPM-NBA-001": "/catalog/products/nba.webp",
  "TPM-LOL-D1-001": "/catalog/products/lol.webp",
  "TPM-LOL-P2-001": "/catalog/products/lol.webp",
  "TPM-LOL-CHALL-001": "/catalog/products/lol.webp",
  "TPM-LOL-FERRO-001": "/catalog/products/lol.webp",
  "TPM-LOL-BRONZE-001": "/catalog/products/lol.webp",
  "TPM-LOL-PRATA-001": "/catalog/products/lol.webp",
  "TPM-LOL-OURO-001": "/catalog/products/lol.webp",
  "TPM-LOL-ESMERALDA-001": "/catalog/products/lol.webp",
  "TPM-LOL-MESTRE-001": "/catalog/products/lol.webp",
  "TPM-DOTA-ANCIENT-001": "/catalog/products/dota.webp",
  "TPM-DOTA-DIVINE-001": "/catalog/products/dota.webp",
  "TPM-DOTA-IMMORTAL-001": "/catalog/products/dota.webp"
};

export function getCategoryImageUrl(category: CatalogCategory) {
  return category.imageUrl || CATEGORY_IMAGE_BY_SLUG[category.slug] || null;
}

export function getProductImageUrl(product: Product) {
  const fallbackImageUrl = getProductImageFallbackUrl(product);
  if (product.imageUrl && !isGeneratedPlaceholderImage(product.imageUrl)) {
    return product.imageUrl;
  }
  return fallbackImageUrl;
}

export function getProductImageFallbackUrl(product: Product) {
  const explicitBySlug = PRODUCT_IMAGE_BY_SLUG[product.slug];
  if (explicitBySlug) return explicitBySlug;
  const explicitBySku = PRODUCT_IMAGE_BY_SKU[product.sku];
  if (explicitBySku) return explicitBySku;
  const haystack = `${product.slug} ${product.name} ${product.provider} ${product.sku}`.toLowerCase();
  const matchedKey = Object.keys(PRODUCT_IMAGE_BY_KEY).find((key) => haystack.includes(key));
  return matchedKey ? PRODUCT_IMAGE_BY_KEY[matchedKey] : null;
}

export function getProductImageFromText(value: string) {
  const haystack = value.toLowerCase();
  const matchedKey = Object.keys(PRODUCT_IMAGE_BY_KEY).find((key) => haystack.includes(key));
  return matchedKey ? PRODUCT_IMAGE_BY_KEY[matchedKey] : null;
}

export function getProductSectionSlugs(product: Product) {
  const primarySlug = product.categorySlug || legacyCategorySlug(product.category);
  const slugs = new Set([primarySlug]);
  const haystack = `${product.slug} ${product.name} ${product.provider} ${product.sku}`.toLowerCase();
  if (haystack.includes("antigravity")) {
    slugs.add("inteligencia-artificial");
  }
  return Array.from(slugs);
}

export function legacyCategorySlug(category: string) {
  const map: Record<string, string> = {
    ASSINATURA: "assinaturas-premium",
    STREAMING: "streaming",
    GAMES: "games"
  };
  return map[category] || category.toLowerCase();
}

export function formatCategoryLabel(product: Product) {
  const label = product.categoryName || humanizeCategory(product.categorySlug || product.category);
  const map: Record<string, string> = {
    "Inteligencia Artificial": "IA",
    "Inteligência Artificial": "IA",
    "Assinaturas e Premium": "Premium",
    "Softwares e Licencas": "Software",
    "Softwares e Licenças": "Software",
    "Redes Sociais": "Social",
    "Servicos Digitais": "Digital",
    "Serviços Digitais": "Digital",
    "Cursos e Treinamentos": "Curso",
    "Contas Digitais": "Conta"
  };
  return map[label] || label;
}

function isGeneratedPlaceholderImage(imageUrl: string) {
  return imageUrl.includes("/catalog/products/league-of-legends.webp");
}
