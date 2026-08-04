import { useEffect, useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, UserCircle2, Instagram, Facebook, Youtube, MessageCircle } from "lucide-react";
import { apiClient } from "../api/client";
import { useCart } from "../cart/CartContext";
import { FALLBACK_CATEGORIES, getCategoryImageUrl, getProductImageUrl } from "../catalog/catalogData";
import { useSession } from "../session/SessionContext";
import { CartDrawer } from "../ui/CartDrawer";
import { CategoryDropdown } from "../ui/CategoryDropdown";
import { SafeImage } from "../ui/SafeImage";
import type { CatalogCategory, Product } from "../types";

export function StoreShell() {
  const { openCart, itemCount } = useCart();
  const { apiBase, user, isDevFallback, isLive, refreshSession, lastError } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [suggestionProducts, setSuggestionProducts] = useState<Product[]>([]);
  const [suggestionCategories, setSuggestionCategories] = useState<CatalogCategory[]>(FALLBACK_CATEGORIES);
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/cadastro";

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchFocused(false);
  }, [location.pathname]);

  useEffect(() => {
    let isMounted = true;
    async function loadSuggestions() {
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiClient.getProducts(apiBase),
          apiClient.getCategories(apiBase).catch(() => FALLBACK_CATEGORIES)
        ]);
        if (!isMounted) return;
        setSuggestionProducts(productsResponse);
        setSuggestionCategories(categoriesResponse.length > 0 ? categoriesResponse : FALLBACK_CATEGORIES);
      } catch {
        if (!isMounted) return;
        setSuggestionProducts([]);
        setSuggestionCategories(FALLBACK_CATEGORIES);
      }
    }

    if (!isAuthRoute) {
      void loadSuggestions();
    }

    return () => {
      isMounted = false;
    };
  }, [apiBase, isAuthRoute]);

  const quickSearch = useMemo(() => {
    const term = headerSearch.trim().toLowerCase();
    if (!term) {
      return {
        products: suggestionProducts.slice(0, 4),
        categories: suggestionCategories.slice(0, 3)
      };
    }

    return {
      products: suggestionProducts
        .filter((product) => `${product.name} ${product.provider} ${product.description}`.toLowerCase().includes(term))
        .slice(0, 4),
      categories: suggestionCategories
        .filter((category) => `${category.name} ${category.description || ""}`.toLowerCase().includes(term))
        .slice(0, 3)
    };
  }, [headerSearch, suggestionCategories, suggestionProducts]);

  const shouldShowSearchSuggestions = isSearchFocused && (quickSearch.products.length > 0 || quickSearch.categories.length > 0);

  return (
    <div className={isAuthRoute ? "app-shell auth-shell" : "app-shell"}>
      {!isAuthRoute ? (
      <header className="topbar">
        <div className="container topbar-inner">
          <nav className="topbar-nav topbar-nav-left" aria-label="Navegacao principal">
            <button
              type="button"
              className={isMenuOpen ? "topbar-menu-button active" : "topbar-menu-button"}
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}
              aria-controls="site-menu"
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" />
              <span className="hamburger-line" />
            </button>
            <div className="desktop-nav-links">
              <NavLink to="/catalogo" className={navClass}>Catalogo</NavLink>
              <CategoryDropdown />
              <NavLink to="/pedidos" className={navClass}>Pedidos</NavLink>
              <NavLink to="/conta" className={navClass}>Conta</NavLink>
              {user?.role === "ADMIN" ? <NavLink to="/admin" className={navClass}>Admin</NavLink> : null}
            </div>
            <div id="site-menu" className={isMenuOpen ? "site-menu-popover open" : "site-menu-popover"}>
              <NavLink to="/catalogo" className="site-menu-link">Catalogo</NavLink>
              <NavLink to="/categoria/inteligencia-artificial" className="site-menu-link">Inteligencia Artificial</NavLink>
              <NavLink to="/categoria/streaming" className="site-menu-link">Streaming</NavLink>
              <NavLink to="/categoria/games" className="site-menu-link">Games</NavLink>
              <NavLink to="/pedidos" className="site-menu-link">Pedidos</NavLink>
              <NavLink to="/conta" className="site-menu-link">Conta</NavLink>
              {user?.role === "ADMIN" ? <NavLink to="/admin" className="site-menu-link">Admin</NavLink> : null}
            </div>
          </nav>

          <Link to="/" className="header-logo-slot" aria-label="The Pirate Max">
            <img src="/brand/ThePirateMaxLogo.webp" alt="The Pirate Max" />
          </Link>

          <div className="topbar-actions topbar-actions-right">
            <form
              className="topbar-search"
              onSubmit={(event) => {
                event.preventDefault();
                const term = headerSearch.trim();
                setIsSearchFocused(false);
                navigate(term ? `/catalogo?busca=${encodeURIComponent(term)}` : "/catalogo");
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
            >
              <Search size={16} />
              <input
                value={headerSearch}
                onChange={(event) => setHeaderSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setIsSearchFocused(false);
                    event.currentTarget.blur();
                  }
                }}
                placeholder="Buscar produtos..."
                aria-label="Buscar produtos"
                aria-expanded={shouldShowSearchSuggestions}
                aria-controls="header-search-suggestions"
              />
              {shouldShowSearchSuggestions ? (
                <div id="header-search-suggestions" className="search-suggestions" role="listbox" aria-label="Sugestoes de busca">
                  {quickSearch.products.length > 0 ? (
                    <div className="search-suggestion-group">
                      <span>Produtos</span>
                      {quickSearch.products.map((product) => (
                        <Link key={product.id} to={`/produto/${product.slug}`} className="search-suggestion-item" role="option">
                          <span className="search-suggestion-thumb" aria-hidden="true">
                            <SafeImage
                              src={getProductImageUrl(product)}
                              alt=""
                              fallback={<span>{product.name.slice(0, 2)}</span>}
                              loading="lazy"
                            />
                          </span>
                          <span>
                            <strong>{product.name}</strong>
                            <small>{product.provider}</small>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  {quickSearch.categories.length > 0 ? (
                    <div className="search-suggestion-group">
                      <span>Categorias</span>
                      {quickSearch.categories.map((category) => (
                        <Link key={category.id} to={`/categoria/${category.slug}`} className="search-suggestion-item" role="option">
                          <span className="search-suggestion-thumb category" aria-hidden="true">
                            <SafeImage
                              src={getCategoryImageUrl(category)}
                              alt=""
                              fallback={<span>{category.name.slice(0, 2)}</span>}
                              loading="lazy"
                            />
                          </span>
                          <span>
                            <strong>{category.name}</strong>
                            <small>{category.description || "Ver categoria"}</small>
                          </span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                  <button type="submit" className="search-suggestion-submit">
                    Ver todos os resultados
                  </button>
                </div>
              ) : null}
            </form>
            <div className="topbar-icon-actions">
              <Link to={user ? "/conta" : "/login"} className="header-icon-link" aria-label={user ? `Abrir conta de ${user.name}` : "Entrar"}>
                <UserCircle2 size={24} />
              </Link>
              <button type="button" className="header-bag-button" onClick={openCart} aria-label="Abrir carrinho">
                <span className="header-bag-icon">
                  <ShoppingBag size={25} />
                  <strong>{itemCount}</strong>
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
      ) : null}

      {import.meta.env.DEV && !isAuthRoute ? <span
        className={isLive ? "connection-status-dot online" : "connection-status-dot offline"}
        aria-label={isLive ? "API conectada" : "API desconectada"}
        role="status"
      /> : null}

      {import.meta.env.DEV && isDevFallback && location.pathname !== "/login" && location.pathname !== "/cadastro" ? (
        <div className="env-banner">
          <div className="container env-banner-inner">
            <strong>Ambiente local:</strong>
            <span>sessao de desenvolvimento ativa. Voce pode comprar com ela ou entrar com uma conta real.</span>
            <Link to="/login">Trocar sessao</Link>
          </div>
        </div>
      ) : null}

      {!isAuthRoute && !isLive && lastError ? (
        <div className="offline-banner">
          <div className="container env-banner-inner">
            <strong>Conexao:</strong>
            <span>{lastError}</span>
            <button type="button" className="text-button compactless" onClick={() => void refreshSession()}>Tentar novamente</button>
          </div>
        </div>
      ) : null}

      <main className="page-main" key={location.pathname}>
        <Outlet />
      </main>

      {!isAuthRoute ? (
        <footer className="site-footer">
          <div className="container">
            <div className="site-footer-inner">
              <div className="footer-col footer-col-about">
                <img src="/brand/ThePirateMaxLogo.webp" alt="The Pirate Max" />
                <p>
                  A The Pirate Max é a sua plataforma definitiva para produtos digitais. Oferecemos entrega rápida, suporte dedicado e segurança máxima para todas as suas compras de assinaturas, jogos e licenças.
                </p>
                <div className="footer-socials">
                  <a href="#" aria-label="Discord"><MessageCircle size={20} /></a>
                  <a href="#" aria-label="YouTube"><Youtube size={20} /></a>
                  <a href="#" aria-label="Facebook"><Facebook size={20} /></a>
                  <a href="#" aria-label="Instagram"><Instagram size={20} /></a>
                </div>
              </div>

              <div className="footer-col">
                <h4>Acesso Rápido</h4>
                <ul className="footer-links">
                  <li><Link to="/catalogo">Catálogo</Link></li>
                  <li><Link to="/categoria/inteligencia-artificial">Inteligência Artificial</Link></li>
                  <li><Link to="/categoria/streaming">Streaming</Link></li>
                  <li><Link to="/categoria/games">Games</Link></li>
                  <li><Link to="/pedidos">Meus Pedidos</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Como Funciona</h4>
                <ul className="footer-links">
                  <li><Link to="/termos">Como comprar</Link></li>
                  <li><Link to="/termos">Vantagens</Link></li>
                  <li><Link to="/termos">Formas de pagamento</Link></li>
                  <li><Link to="/termos">Prazos de entrega</Link></li>
                  <li><Link to="/conta">Suporte e Ajuda</Link></li>
                </ul>
              </div>

              <div className="footer-col">
                <h4>Institucional</h4>
                <ul className="footer-links">
                  <li><Link to="/termos">Termos de uso</Link></li>
                  <li><Link to="/termos">Política de privacidade</Link></li>
                  <li><Link to="/termos">Política de reembolso</Link></li>
                  <li><Link to="/termos">Garantia de entrega</Link></li>
                </ul>
              </div>
            </div>

            <div className="site-footer-bottom">
              <p>Copyright &copy; The Pirate Max 2026. Todos os direitos reservados.</p>
              <p>CNPJ: 00.000.000/0001-00</p>
            </div>
          </div>
        </footer>
      ) : null}

      <CartDrawer />
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link active" : "nav-link";
}
