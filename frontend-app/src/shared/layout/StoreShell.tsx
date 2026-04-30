import { type FormEvent, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, Search, ShoppingCart, UserCircle2 } from "lucide-react";
import { useCart } from "../cart/CartContext";
import { useSession } from "../session/SessionContext";
import { CartDrawer } from "../ui/CartDrawer";

export function StoreShell() {
  const { openCart, itemCount } = useCart();
  const { user, isDevFallback, isLive, apiBase, setApiBase, refreshSession, lastError } = useSession();
  const location = useLocation();
  const [apiDraft, setApiDraft] = useState(apiBase);

  async function handleApiSubmit(event: FormEvent) {
    event.preventDefault();
    await setApiBase(apiDraft.trim());
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand-mark">
            <div className="brand-badge">TPM</div>
            <div>
              <strong>The Pirate Max</strong>
              <span>digital marketplace</span>
            </div>
          </Link>

          <div className="topbar-search">
            <Search size={18} />
            <input placeholder="Busque produto, categoria ou provedor" aria-label="Buscar produtos" />
          </div>

          <nav className="topbar-nav" aria-label="Navegacao principal">
            <NavLink to="/catalogo" className={navClass}>Catalogo</NavLink>
            <NavLink to="/pedidos" className={navClass}>Pedidos</NavLink>
            <NavLink to="/conta" className={navClass}>Conta</NavLink>
            {user?.role === "ADMIN" ? <NavLink to="/admin" className={navClass}>Admin</NavLink> : null}
          </nav>

          <div className="topbar-actions">
            <form className="api-connection-form" onSubmit={handleApiSubmit}>
              <div className={isLive ? "api-pill online" : "api-pill offline"}>
                <span className="api-dot" />
                {isLive ? "API online" : "API offline"}
              </div>
              <input
                value={apiDraft}
                onChange={(event) => setApiDraft(event.target.value)}
                className="api-base-input"
                aria-label="URL da API"
              />
              <button type="submit" className="text-button compactless">Conectar</button>
            </form>
            <Link to={user ? "/conta" : "/login"} className="icon-button">
              <UserCircle2 size={18} />
              <span>{user ? user.name.split(" ")[0] : "Entrar"}</span>
            </Link>
            <button type="button" className="icon-button primary" onClick={openCart}>
              <ShoppingCart size={18} />
              <span>Carrinho</span>
              <strong>{itemCount}</strong>
            </button>
            <button type="button" className="icon-button mobile-only">
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

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
