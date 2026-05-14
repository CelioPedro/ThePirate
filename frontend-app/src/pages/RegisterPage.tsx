import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useSession } from "../shared/session/SessionContext";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useSession();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasHeroImage, setHasHeroImage] = useState(true);

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
      <section className="login-card-shell register-card-shell" aria-labelledby="register-title">
        <div className="login-form-panel">
          <Link to="/" className="login-brand-lockup" aria-label="The Pirate Max">
            <img src="/brand/ThePirateMaxLogo.webp" alt="" />
            <strong>The Pirate Max</strong>
          </Link>

          <div className="login-heading">
            <h1 id="register-title">Crie sua conta</h1>
            <p>Organize seus pedidos, pagamentos e acessos digitais em um so lugar.</p>
          </div>

          <form className="auth-form-card login-form-card" onSubmit={handleSubmit}>
            <label className="login-input-field">
              <UserRound size={20} />
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nome"
                aria-label="Nome"
                required
              />
            </label>
            <label className="login-input-field">
              <Mail size={20} />
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                type="email"
                placeholder="E-mail"
                aria-label="E-mail"
                required
              />
            </label>
            <label className="login-input-field">
              <LockKeyhole size={20} />
              <input
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                type={showPassword ? "text" : "password"}
                minLength={8}
                placeholder="Senha"
                aria-label="Senha"
                required
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </label>

            {error ? <div className="error-text">{error}</div> : null}

            <button type="submit" className="login-submit-button" disabled={isSubmitting}>
              {isSubmitting ? "Criando conta..." : "Criar conta"}
            </button>
          </form>

          <div className="login-divider"><span>Ou criar com</span></div>

          <div className="social-login-stack">
            <button type="button" onClick={() => setError("Cadastro com Google em breve.")}>
              <GoogleIcon />
              Criar com Google
            </button>
            <button type="button" onClick={() => setError("Cadastro com Facebook em breve.")}>
              <FacebookIcon />
              Criar com Facebook
            </button>
          </div>

          <p className="helper-text login-helper">Ja tem uma conta? <Link to="/login">Entrar</Link></p>
        </div>

        <div className="login-visual-panel">
          {hasHeroImage ? (
            <img
              src="/auth/register-hero.webp"
              alt="The Pirate Max"
              onError={() => setHasHeroImage(false)}
            />
          ) : (
            <div className="login-visual-fallback">
              <img src="/brand/ThePirateMaxLogo.webp" alt="" />
              <strong>Bem-vindo a bordo</strong>
              <span>Imagem da pagina de cadastro</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="social-provider-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="social-provider-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path fill="#1877F2" d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.96h-1.51c-1.49 0-1.95.93-1.95 1.89v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z" />
      <path fill="#fff" d="m16.67 15.56.53-3.49h-3.32V9.8c0-.96.46-1.89 1.95-1.89h1.51V4.95s-1.37-.24-2.68-.24c-2.74 0-4.53 1.67-4.53 4.7v2.66H7.08v3.49h3.05V24a12.26 12.26 0 0 0 3.75 0v-8.44h2.79z" />
    </svg>
  );
}
