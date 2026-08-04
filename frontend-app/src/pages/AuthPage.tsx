import { type FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, User } from "lucide-react";
import { useSession } from "../shared/session/SessionContext";
import { useDocumentTitle } from "../shared/lib/useDocumentTitle";

export function AuthPage({ defaultMode }: { defaultMode: "login" | "register" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isDevFallback } = useSession();
  
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasHeroImage, setHasHeroImage] = useState(true);

  useDocumentTitle(mode === "login" ? "Entrar" : "Criar Conta");

  // Sync internal state with URL prop if user uses browser back/forward buttons
  useEffect(() => {
    setMode(defaultMode);
    setError("");
  }, [defaultMode]);

  const nextPath = (location.state as { next?: string } | null)?.next || "/conta";

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
      navigate(nextPath);
    } catch (err: any) {
      setError(err.message || "Nao foi possivel concluir a acao.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSwitchMode(newMode: "login" | "register") {
    setMode(newMode);
    setError("");
    // Use pushState to change URL without triggering React Router remount
    window.history.pushState(location.state, "", newMode === "login" ? "/login" : "/cadastro");
  }

  return (
    <div className="auth-page">
      <section className="login-card-shell" aria-labelledby="auth-title">
        <div className="login-form-panel">
          <Link to="/" className="login-brand-lockup" aria-label="The Pirate Max">
            <img src="/brand/ThePirateMax3.png" alt="" />
            <strong>The Pirate Max</strong>
          </Link>

          <div className="auth-form-transition-container">
            <div className={`auth-form-content ${mode === "login" ? "active" : "inactive-left"}`}>
              <div className="login-heading">
                <h1 id="auth-title">Bem-vindo de volta</h1>
                <p>Acesse sua conta e continue explorando.</p>
              </div>

              {import.meta.env.DEV && isDevFallback ? <div className="inline-banner">Sessao dev local detectada.</div> : null}

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

                {error && mode === "login" ? <div className="error-text" role="alert">{error}</div> : null}

                <button type="submit" className="login-submit-button" disabled={isSubmitting}>
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </button>
              </form>

              {import.meta.env.DEV ? (
                <>
                  <button type="button" className="forgot-password-button" onClick={() => setError("Recuperacao de senha em breve.")}>
                    Esqueci minha senha
                  </button>
                  <div className="login-divider"><span>Ou continuar com</span></div>
                  <div className="social-login-stack">
                    <button type="button" onClick={() => setError("Login com Google em breve.")}>
                      <GoogleIcon /> Entrar com Google
                    </button>
                  </div>
                </>
              ) : null}

              <p className="helper-text login-helper">
                Ainda nao tem uma conta?{" "}
                <a href="/cadastro" onClick={(e) => { e.preventDefault(); handleSwitchMode("register"); }}>
                  Criar conta
                </a>
              </p>
            </div>

            <div className={`auth-form-content ${mode === "register" ? "active" : "inactive-right"}`}>
              <div className="login-heading">
                <h1>Criar nova conta</h1>
                <p>Junte-se a The Pirate Max.</p>
              </div>

              {import.meta.env.DEV && isDevFallback ? <div className="inline-banner">Sessao dev local detectada.</div> : null}

              <form className="auth-form-card login-form-card" onSubmit={handleSubmit}>
                <label className="login-input-field">
                  <User size={20} />
                  <input
                    value={form.name}
                    onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                    type="text"
                    placeholder="Nome completo"
                    aria-label="Nome completo"
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
                    placeholder="Criar senha"
                    aria-label="Criar senha"
                    required
                    minLength={6}
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

                {error && mode === "register" ? <div className="error-text" role="alert">{error}</div> : null}

                <button type="submit" className="login-submit-button" disabled={isSubmitting}>
                  {isSubmitting ? "Criando..." : "Criar conta"}
                </button>
              </form>

              {import.meta.env.DEV ? (
                <>
                  <div className="login-divider"><span>Ou</span></div>
                  <div className="social-login-stack">
                    <button type="button" onClick={() => setError("Google auth indisponível.")}>
                      <GoogleIcon /> Usar conta Google
                    </button>
                  </div>
                </>
              ) : null}

              <p className="helper-text login-helper" style={{ marginTop: "24px" }}>
                Ja possui conta?{" "}
                <a href="/login" onClick={(e) => { e.preventDefault(); handleSwitchMode("login"); }}>
                  Fazer login
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="login-visual-panel">
          {hasHeroImage ? (
            <>
              <img
                src="/auth/login-hero.webp"
                alt="The Pirate Max Login"
                className={`auth-hero-img ${mode === "login" ? "visible" : "hidden"}`}
                onError={() => setHasHeroImage(false)}
              />
              <img
                src="/auth/register-hero.webp"
                alt="The Pirate Max Cadastro"
                className={`auth-hero-img ${mode === "register" ? "visible" : "hidden"}`}
                onError={() => setHasHeroImage(false)}
              />
            </>
          ) : (
            <div className="login-visual-fallback">
              <img src="/brand/ThePirateMax3.png" alt="" />
              <strong>The Pirate Max</strong>
              <span>Acesso seguro</span>
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
