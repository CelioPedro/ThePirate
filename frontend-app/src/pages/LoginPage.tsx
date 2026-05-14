import { type FormEvent, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useSession } from "../shared/session/SessionContext";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isDevFallback } = useSession();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasHeroImage, setHasHeroImage] = useState(true);

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
      <section className="login-card-shell" aria-labelledby="login-title">
        <div className="login-form-panel">
          <Link to="/" className="login-brand-lockup" aria-label="The Pirate Max">
            <img src="/brand/ThePirateMaxLogo.webp" alt="" />
            <strong>The Pirate Max</strong>
          </Link>

          <div className="login-heading">
            <h1 id="login-title">Bem-vindo de volta</h1>
            <p>Acesse sua conta e continue explorando.</p>
          </div>

          {isDevFallback ? <div className="inline-banner">Sessao dev local detectada. Entrar aqui substitui a sessao automatica.</div> : null}

          <form className="auth-form-card login-form-card" onSubmit={handleSubmit}>
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
              {isSubmitting ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <button type="button" className="forgot-password-button" onClick={() => setError("Recuperacao de senha em breve.")}>
            Esqueci minha senha
          </button>

          <div className="login-divider"><span>Ou continuar com</span></div>

          <div className="social-login-stack">
            <button type="button" onClick={() => setError("Login com Google em breve.")}>
              <GoogleIcon />
              Entrar com Google
            </button>
            <button type="button" onClick={() => setError("Login com Facebook em breve.")}>
              <FacebookIcon />
              Entrar com Facebook
            </button>
          </div>

          <p className="helper-text login-helper">Ainda nao tem uma conta? <Link to="/cadastro">Criar conta</Link></p>
        </div>

        <div className="login-visual-panel">
          {hasHeroImage ? (
            <img
              src="/auth/login-hero.webp"
              alt="The Pirate Max"
              onError={() => setHasHeroImage(false)}
            />
          ) : (
            <div className="login-visual-fallback">
              <img src="/brand/ThePirateMaxLogo.webp" alt="" />
              <strong>The Pirate Max</strong>
              <span>Imagem da pagina de login</span>
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
