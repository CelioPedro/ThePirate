import { Product } from "../types";

export type ProductGroup = {
  baseName: string;
  products: Product[];
};

export function groupProducts(products: Product[]): ProductGroup[] {
  const groups = new Map<string, Product[]>();
  
  for (const p of products) {
    // Regex para extrair a base do nome, removendo o que estiver entre parênteses no final.
    // Ex: "ChatGPT Plus 4.0 (Privada)" -> "ChatGPT Plus 4.0"
    const match = p.name.match(/^(.*?)(?:\s*\([^)]*\))?\s*$/);
    const baseName = match && match[1] ? match[1].trim() : p.name.trim();
    
    if (!groups.has(baseName)) {
      groups.set(baseName, []);
    }
    groups.get(baseName)!.push(p);
  }
  
  return Array.from(groups.entries()).map(([baseName, groupedProducts]) => ({
    baseName,
    products: groupedProducts
  }));
}
