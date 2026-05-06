import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Search, ShoppingBag, UserCircle2 } from "lucide-react";
import { useCart } from "../cart/CartContext";
import { useSession } from "../session/SessionContext";
import { CartDrawer } from "../ui/CartDrawer";
import { CategoryDropdown } from "../ui/CategoryDropdown";

export function StoreShell() {
  const { openCart, itemCount } = useCart();
  const { user, isDevFallback, isLive, refreshSession, lastError } = useSession();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="app-shell">
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
              <NavLink to="/catalogo#inteligencia-artificial" className="site-menu-link">Inteligencia Artificial</NavLink>
              <NavLink to="/catalogo#streaming" className="site-menu-link">Streaming</NavLink>
              <NavLink to="/catalogo#games" className="site-menu-link">Games</NavLink>
              <NavLink to="/pedidos" className="site-menu-link">Pedidos</NavLink>
              <NavLink to="/conta" className="site-menu-link">Conta</NavLink>
              {user?.role === "ADMIN" ? <NavLink to="/admin" className="site-menu-link">Admin</NavLink> : null}
            </div>
          </nav>

          <Link to="/" className="header-logo-slot" aria-label="The Pirate Max">
            <img src="/brand/ThePirateMaxLogo.png" alt="The Pirate Max" />
          </Link>

          <div className="topbar-actions topbar-actions-right">
            <div className="topbar-search">
              <Search size={16} />
              <input placeholder="Buscar produtos..." aria-label="Buscar produtos" />
            </div>
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
      </header>

      <span
        className={isLive ? "connection-status-dot online" : "connection-status-dot offline"}
        aria-label={isLive ? "API conectada" : "API desconectada"}
        role="status"
      />

      {isDevFallback && location.pathname !== "/login" && location.pathname !== "/cadastro" ? (
        <div className="env-banner">
          <div className="container env-banner-inner">
            <strong>Ambiente local:</strong>
            <span>sessao de desenvolvimento ativa. Voce pode comprar com ela ou entrar com uma conta real.</span>
            <Link to="/login">Trocar sessao</Link>
          </div>
        </div>
      ) : null}

      {!isLive && lastError ? (
        <div className="offline-banner">
          <div className="container env-banner-inner">
            <strong>Conexao:</strong>
            <span>{lastError}</span>
            <button type="button" className="text-button compactless" onClick={() => void refreshSession()}>Tentar novamente</button>
          </div>
        </div>
      ) : null}

      <main className="page-main">
        <Outlet />
      </main>

      <CartDrawer />
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return isActive ? "nav-link active" : "nav-link";
}
