import { Link } from "react-router-dom";
import { humanizeRole } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";

export function AccountPage() {
  const { user, logout, apiBase, setApiBase, isDevFallback } = useSession();

  return (
    <div className="content-grid">
      <section className="panel-card">
        <span className="eyebrow">conta</span>
        <h1>Minha conta</h1>
        {user ? (
          <div className="stack-card">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
            <span>{humanizeRole(user.role)}</span>
            {isDevFallback ? <div className="inline-banner">Sessao local automatica do backend. Para validar login real, use a tela de acesso.</div> : null}
            <div className="button-row">
              <Link to="/pedidos" className="secondary-button compact">Ver pedidos</Link>
              {user.role === "ADMIN" ? <Link to="/admin" className="primary-button compact">Painel admin</Link> : null}
              <button type="button" className="text-button" onClick={logout}>Sair</button>
            </div>
          </div>
        ) : (
          <div className="empty-state-panel">
            <strong>Nenhuma sessao autenticada</strong>
            <p>Entre ou crie conta para vincular seus pedidos.</p>
            <div className="button-row">
              <Link to="/login" className="primary-button compact">Entrar</Link>
              <Link to="/cadastro" className="secondary-button compact">Criar conta</Link>
            </div>
          </div>
        )}
      </section>

      <section className="panel-card">
        <span className="eyebrow">ambiente</span>
        <h2>API local</h2>
        <p>O frontend novo ja aceita trocar a base da API sem editar codigo.</p>
        <label className="stack-input">
          <span>URL da API</span>
          <input defaultValue={apiBase} onBlur={(event) => void setApiBase(event.target.value.trim())} />
        </label>
      </section>
    </div>
  );
}
