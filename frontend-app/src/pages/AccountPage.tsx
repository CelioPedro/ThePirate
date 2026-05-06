import { Link } from "react-router-dom";
import { ArrowRight, CreditCard, KeyRound, LogOut, PackageCheck, ShieldCheck, Server, Sparkles, UserRound } from "lucide-react";
import { humanizeRole } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";

export function AccountPage() {
  const { user, logout, apiBase, setApiBase, isDevFallback } = useSession();

  return (
    <div className="account-page">
      <section className="account-hero-panel">
        {user ? (
          <>
            <div className="account-profile-head">
              <div className="account-avatar" aria-hidden="true">{initials(user.name)}</div>
              <div>
                <span className="eyebrow">painel do cliente</span>
                <h1>Minha conta</h1>
                <p>Compras, pagamentos e acessos digitais reunidos em uma experiencia simples de acompanhar.</p>
              </div>
            </div>

            <div className="account-profile-card">
              <div>
                <span className="account-label">Usuario</span>
                <strong>{user.name}</strong>
              </div>
              <div>
                <span className="account-label">Email</span>
                <span>{user.email}</span>
              </div>
              <div>
                <span className="account-label">Perfil</span>
                <span className="account-role-pill">{humanizeRole(user.role)}</span>
              </div>
            </div>

            {isDevFallback ? <div className="inline-banner">Sessao local automatica do backend. Para validar login real, use a tela de acesso.</div> : null}

            <div className="account-action-grid">
              <Link to="/pedidos" className="account-action-card">
                <PackageCheck size={20} />
                <span>
                  <strong>Pedidos</strong>
                  <small>Acompanhar compras e status</small>
                </span>
                <ArrowRight size={16} />
              </Link>
              {user.role === "ADMIN" ? (
                <Link to="/admin" className="account-action-card primary">
                  <ShieldCheck size={20} />
                  <span>
                    <strong>Painel admin</strong>
                    <small>Operacao e estoque</small>
                  </span>
                  <ArrowRight size={16} />
                </Link>
              ) : null}
              <button type="button" className="account-action-card" onClick={logout}>
                <LogOut size={20} />
                <span>
                  <strong>Sair</strong>
                  <small>Encerrar sessao</small>
                </span>
              </button>
            </div>

            <div className="account-benefit-grid">
              <article>
                <KeyRound size={18} />
                <strong>Credenciais protegidas</strong>
                <span>Acesse dados entregues diretamente pelo pedido aprovado.</span>
              </article>
              <article>
                <CreditCard size={18} />
                <strong>PIX acompanhado</strong>
                <span>Status de pagamento e entrega no mesmo fluxo.</span>
              </article>
              <article>
                <Sparkles size={18} />
                <strong>Catalogo premium</strong>
                <span>Produtos digitais organizados por categoria e provedor.</span>
              </article>
            </div>
          </>
        ) : (
          <div className="account-empty-state">
            <div className="account-avatar ghost" aria-hidden="true"><UserRound size={28} /></div>
            <span className="eyebrow">painel do cliente</span>
            <h1>Entre na sua conta</h1>
            <p>Acesse para acompanhar pedidos, pagamentos PIX e credenciais entregues.</p>
            <div className="button-row">
              <Link to="/login" className="primary-button compact">Entrar</Link>
              <Link to="/cadastro" className="secondary-button compact">Criar conta</Link>
            </div>
          </div>
        )}
      </section>

      <section className="account-side-panel">
        <div className="account-side-head">
          <div className="account-side-icon"><Server size={20} /></div>
          <div>
            <span className="eyebrow">status</span>
            <h2>Ambiente</h2>
          </div>
        </div>
        <div className="account-status-row">
          <span className="status-dot live" />
          <span>Backend conectado</span>
        </div>
        <label className="account-input-field">
          <span>URL da API</span>
          <input defaultValue={apiBase} onBlur={(event) => void setApiBase(event.target.value.trim())} />
        </label>
      </section>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "TP";
}
