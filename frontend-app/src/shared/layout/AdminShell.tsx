import { Activity, Boxes, ShieldCheck } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

export function AdminShell() {
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <Link to="/admin" className="brand-mark admin-brand">
          <div className="brand-badge">TPM</div>
          <div>
            <strong>The Pirate Max</strong>
            <span>operacao</span>
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
          <NavLink to="/catalogo" className={adminNavClass}>
            <Boxes size={16} />
            Voltar ao catalogo
          </NavLink>
        </nav>
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
