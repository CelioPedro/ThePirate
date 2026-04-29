import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSession } from "../shared/session/SessionContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isDevFallback } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = (location.state as { next?: string } | null)?.next || "/conta";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(form);
      navigate(nextPath);
    } catch {
      setError("Nao foi possivel entrar agora. Revise email e senha.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel-card">
        <span className="eyebrow">acesso do cliente</span>
        <h1>Entrar</h1>
        <p>Use sua conta para acompanhar pedidos, PIX e credenciais entregues.</p>
        {isDevFallback ? <div className="inline-banner">Sessao dev local detectada. Entrar aqui substitui a sessao automatica.</div> : null}
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" required />
          </label>
          <label>
            Senha
            <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" required />
          </label>
          {error ? <div className="error-text">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="helper-text">Ainda nao tem conta? <Link to="/cadastro">Criar conta</Link></p>
      </section>
    </div>
  );
}
