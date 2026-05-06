import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const CATEGORIES = [
  { id: "inteligencia-artificial", label: "Inteligencia Artificial", detail: "ChatGPT, Gemini e ferramentas digitais", to: "/categoria/inteligencia-artificial" },
  { id: "assinaturas-premium", label: "Assinaturas e Premium", detail: "Acessos premium e softwares", to: "/categoria/assinaturas-premium" },
  { id: "streaming", label: "Streaming", detail: "Video, musica e entretenimento", to: "/categoria/streaming" },
  { id: "games", label: "Games", detail: "Contas, jogos e creditos", to: "/categoria/games" },
  { id: "gift-cards", label: "Gift Cards", detail: "Cartoes digitais e creditos", to: "/categoria/gift-cards" },
  { id: "softwares-licencas", label: "Softwares e Licencas", detail: "Chaves e ferramentas", to: "/categoria/softwares-licencas" },
  { id: "redes-sociais", label: "Redes Sociais", detail: "Servicos para plataformas sociais", to: "/categoria/redes-sociais" },
  { id: "servicos-digitais", label: "Servicos Digitais", detail: "Operacoes sob demanda", to: "/categoria/servicos-digitais" },
  { id: "cursos-treinamentos", label: "Cursos e Treinamentos", detail: "Conteudos e formacoes", to: "/categoria/cursos-treinamentos" },
  { id: "contas-digitais", label: "Contas Digitais", detail: "Acessos e perfis", to: "/categoria/contas-digitais" }
];

export function CategoryDropdown() {
  return (
    <div className="category-dropdown">
      <button type="button" className="nav-link category-trigger" aria-haspopup="true">
        Categorias
      </button>
      <div className="category-menu" role="menu" aria-label="Categorias do catalogo">
        {CATEGORIES.map((category) => (
          <Link key={category.id} to={category.to} className="category-menu-item" role="menuitem">
            <span>
              <strong>{category.label}</strong>
              <small>{category.detail}</small>
            </span>
            <ChevronRight size={16} />
          </Link>
        ))}
        <Link to="/catalogo" className="category-menu-all" role="menuitem">
          Ver todo catalogo
        </Link>
      </div>
    </div>
  );
}
