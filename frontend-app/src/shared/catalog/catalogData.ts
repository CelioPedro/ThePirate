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
  "inteligencia-artificial": "/catalog/categories/IA.png",
  "assinaturas-premium": "/catalog/categories/Assinaturas e Premium.png",
  streaming: "/catalog/categories/Streming.png",
  games: "/catalog/categories/Games.png",
  "gift-cards": "/catalog/categories/Gift Cards.png",
  "softwares-licencas": "/catalog/categories/Software%20e%20Licen%C3%A7as.png",
  "redes-sociais": "/catalog/categories/Redes Sociais.png",
  "servicos-digitais": "/catalog/categories/Servi%C3%A7os%20Digitais.png",
  "cursos-treinamentos": "/catalog/categories/Cursos e Treinamentos.png",
  "contas-digitais": "/catalog/categories/Contas Digitais.png"
};

const PRODUCT_IMAGE_BY_KEY: Record<string, string> = {
  adobe: "/catalog/products/adobe.png",
  "amazon-prime": "/catalog/products/prime.png",
  canva: "/catalog/products/canva.png",
  capcut: "/catalog/products/capcut.png",
  claude: "/catalog/products/claude.png",
  "chatgpt-plus": "/catalog/products/gpt.png",
  chatgpt: "/catalog/products/gpt.png",
  copilot: "/catalog/products/copilot.png",
  crunchyroll: "/catalog/products/cruchyroll.png",
  discord: "/catalog/products/discord.png",
  dota: "/catalog/products/dota.png",
  "dota-2": "/catalog/products/dota.png",
  "disney-plus": "/catalog/products/disney.png",
  disney: "/catalog/products/disney.png",
  dropbox: "/catalog/products/dropbox.png",
  duolingo: "/catalog/products/duolinguo.png",
  figma: "/catalog/products/Figma.png",
  github: "/catalog/products/github.png",
  "google-drive": "/catalog/products/googledrive.png",
  googledrive: "/catalog/products/googledrive.png",
  gpt: "/catalog/products/gpt.png",
  hulu: "/catalog/products/hulu.png",
  icloud: "/catalog/products/icloud.png",
  instagram: "/catalog/products/instagrram.png",
  "league-of-legends": "/catalog/products/lol.png",
  lol: "/catalog/products/lol.png",
  linkedin: "/catalog/products/linkedin.png",
  midjourney: "/catalog/products/midjourney.png",
  "nba-league-pass": "/catalog/products/nba.png",
  nba: "/catalog/products/nba.png",
  netflix: "/catalog/products/netflix.png",
  nintendo: "/catalog/products/nintendp.png",
  notion: "/catalog/products/notion.png",
  "paramount-plus": "/catalog/products/paramount.png",
  paramount: "/catalog/products/paramount.png",
  paypal: "/catalog/products/paypal.png",
  pinterest: "/catalog/products/pinterest.png",
  prime: "/catalog/products/prime.png",
  reddit: "/catalog/products/reddit.png",
  roblox: "/catalog/products/roblox.png",
  snapchat: "/catalog/products/snapchat.png",
  spotify: "/catalog/products/spotify.png",
  steam: "/catalog/products/steam.png",
  teknisa: "/catalog/products/teknisa.png",
  telegram: "/catalog/products/telegram.png",
  tiktok: "/catalog/products/tiktok.png",
  twitch: "/catalog/products/twicth.png",
  antigravity: "/catalog/products/antigravity.png",
  vscode: "/catalog/products/vscode.png",
  whatsapp: "/catalog/products/whatsapp.png",
  "x-premium": "/catalog/products/x.png",
  xbox: "/catalog/products/xbox.png",
  youtube: "/catalog/products/youtube.png"
};

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  hulu: "/catalog/products/hulu.png",
  "nba-league-pass": "/catalog/products/nba.png",
  "lol-diamante-1": "/catalog/products/lol.png",
  "lol-platina-2": "/catalog/products/lol.png",
  "lol-desafiante": "/catalog/products/lol.png",
  "lol-ferro": "/catalog/products/lol.png",
  "lol-bronze": "/catalog/products/lol.png",
  "lol-prata": "/catalog/products/lol.png",
  "lol-ouro": "/catalog/products/lol.png",
  "lol-esmeralda": "/catalog/products/lol.png",
  "lol-mestre": "/catalog/products/lol.png",
  "dota-ancient": "/catalog/products/dota.png",
  "dota-divine": "/catalog/products/dota.png",
  "dota-immortal": "/catalog/products/dota.png"
};

const PRODUCT_IMAGE_BY_SKU: Record<string, string> = {
  "TPM-HULU-001": "/catalog/products/hulu.png",
  "TPM-NBA-001": "/catalog/products/nba.png",
  "TPM-LOL-D1-001": "/catalog/products/lol.png",
  "TPM-LOL-P2-001": "/catalog/products/lol.png",
  "TPM-LOL-CHALL-001": "/catalog/products/lol.png",
  "TPM-LOL-FERRO-001": "/catalog/products/lol.png",
  "TPM-LOL-BRONZE-001": "/catalog/products/lol.png",
  "TPM-LOL-PRATA-001": "/catalog/products/lol.png",
  "TPM-LOL-OURO-001": "/catalog/products/lol.png",
  "TPM-LOL-ESMERALDA-001": "/catalog/products/lol.png",
  "TPM-LOL-MESTRE-001": "/catalog/products/lol.png",
  "TPM-DOTA-ANCIENT-001": "/catalog/products/dota.png",
  "TPM-DOTA-DIVINE-001": "/catalog/products/dota.png",
  "TPM-DOTA-IMMORTAL-001": "/catalog/products/dota.png"
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
  return imageUrl.includes("/catalog/products/league-of-legends.png");
}
