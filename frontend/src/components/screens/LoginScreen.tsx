import { useState } from 'react';
import { OnflyLogo } from '../icons/OnflyLogo';
import { Footer } from '../shared/Footer';

interface LoginScreenProps {
  onLogin: (email: string, password: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const LoginScreen = ({ onLogin, loading, error }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onLogin(email, password);
  };

  const handleGoogleLogin = async () => {
    await onLogin('joao@empresa.com', '123456');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-slide-up">
      <div className="flex-1 flex flex-col items-center pt-12 px-4">
        <OnflyLogo />
        <p className="text-[13px] text-onfly-text-secondary mt-1.5">
          Viagens corporativas inteligentes
        </p>

        <div className="w-full mt-8 bg-card rounded-2xl border border-onfly-border p-6 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
          <h2 className="text-lg font-semibold text-foreground mb-5">Entrar na sua conta</h2>

          <form onSubmit={handleSubmit}>
            <div>
              <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">
                E-mail
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-3 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="mt-3">
              <label className="text-[11px] uppercase text-onfly-text-secondary tracking-wider font-medium block mb-1">
                Senha
              </label>
              <div className="relative">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••"
                  className="w-full h-[42px] rounded-lg border border-onfly-border pl-9 pr-10 text-sm text-foreground bg-card focus:border-primary focus:ring-[3px] focus:ring-primary/10 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-onfly-text-muted cursor-pointer"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    {showPassword ? (
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                    ) : (
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46A11.8 11.8 0 001 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" fill="currentColor"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <div className="text-right mt-1.5">
              <span className="text-xs text-primary cursor-pointer hover:underline">Esqueci minha senha</span>
            </div>

            {error && (
              <div className="mt-3 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-[10px] bg-primary text-primary-foreground font-semibold text-[15px] mt-5 hover:bg-onfly-blue-hover active:scale-[0.98] transition-all cursor-pointer disabled:opacity-70 flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin-loader" />
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-onfly-border" />
            <span className="text-xs text-onfly-text-muted">ou continue com</span>
            <div className="flex-1 h-px bg-onfly-border" />
          </div>

          <button
            onClick={handleGoogleLogin}
            className="w-full h-11 rounded-[10px] bg-card border border-onfly-border text-sm font-medium text-foreground hover:bg-background transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
            Continuar com Google
          </button>

          <p className="text-center text-xs text-onfly-text-secondary mt-5">
            Não tem conta?{' '}
            <span className="text-primary cursor-pointer hover:underline">Fale com seu gestor</span>
          </p>
        </div>
      </div>

      <Footer text="Planejador de Viagem · Onfly" />
    </div>
  );
};
