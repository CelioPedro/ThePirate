import { Activity, Boxes, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useSession } from "../session/SessionContext";

export function AdminShell() {
  const { logout, user } = useSession();

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="admin-brand">
          <span className="admin-brand-logo" aria-hidden="true">
            <img src="/brand/ThePirateMaxLogo.png" alt="" />
          </span>
          <div>
            <strong>The Pirate Max</strong>
            <span>central de operacao</span>
          </div>
        </Link>

        <nav className="admin-nav">
          <NavLink to="/admin" end className={adminNavClass}>
            <Activity size={16} />
            Visao geral
          </NavLink>
          <NavLink to="/pedidos" className={adminNavClass}>
            <ShieldCheck size={16} />
            Pedidos cliente
          </NavLink>
          <NavLink to="/conta" className={adminNavClass}>
            <UserCircle2 size={16} />
            Perfil
          </NavLink>
          <NavLink to="/catalogo" className={adminNavClass}>
            <Boxes size={16} />
            Catalogo
          </NavLink>
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile-card">
            <UserCircle2 size={18} />
            <div>
              <strong>{user?.name || "Operador TPM"}</strong>
              <span>{user?.email || "Sessao administrativa"}</span>
            </div>
          </div>
          <button type="button" className="admin-logout-button" onClick={logout}>
            <LogOut size={16} />
            Sair
          </button>
        </div>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}

function adminNavClass({ isActive }: { isActive: boolean }) {
  return isActive ? "admin-nav-link active" : "admin-nav-link";
}
