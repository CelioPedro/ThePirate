import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../shared/session/SessionContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useSession();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (form.password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setIsSubmitting(true);
    try {
      await register(form);
      navigate("/conta");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Nao foi possivel criar a conta agora.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-panel-card">
        <span className="eyebrow">novo cadastro</span>
        <h1>Criar conta</h1>
        <p>Monte sua conta para concentrar pedidos, pagamentos e acesso seguro aos produtos entregues.</p>
        <form className="auth-form-card" onSubmit={handleSubmit}>
          <label>
            Nome
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
          </label>
          <label>
            Email
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} type="email" required />
          </label>
          <label>
            Senha
            <input value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} type="password" minLength={8} required />
          </label>
          {error ? <div className="error-text">{error}</div> : null}
          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
        <p className="helper-text">Ja tem conta? <Link to="/login">Entrar</Link></p>
      </section>
    </div>
  );
}
