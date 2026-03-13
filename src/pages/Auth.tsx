/**
 * Auth Page - Sign in / Sign up with Google OAuth
 */

import React, { useState } from 'react';
import { Scissors, Loader2, Sparkles, Video, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Auth: React.FC = () => {
  const { signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');



  const handleEmailAuth = async (e?: React.FormEvent) => {
    if (e && 'preventDefault' in e) e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      const message = err?.message || (mode === 'login' ? 'Error al iniciar sesión con email.' : 'Error al registrarse.');
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-background to-accent/10 items-center justify-center p-12">
        <div className="max-w-md space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(199,89%,48%)] shadow-lg">
              <Scissors className="h-6 w-6 text-primary-foreground" />
            </div>
            <h2 className="text-3xl font-bold gradient-text">Clip Flow Studio</h2>
          </div>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Transforma tus videos largos en clips virales para redes sociales en minutos.
          </p>

          <div className="space-y-4">
            <Feature icon={<Video className="h-5 w-5 text-primary" />} text="Sube tu video y genera clips automáticamente" />
            <Feature icon={<Sparkles className="h-5 w-5 text-primary" />} text="Títulos y descripciones generados con IA" />
            <Feature icon={<Zap className="h-5 w-5 text-primary" />} text="Exporta en formatos optimizados para cada red" />
          </div>
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[hsl(199,89%,48%)] shadow-lg">
              <Scissors className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === 'login'
                ? 'Inicia sesión para continuar con tus proyectos'
                : 'Regístrate gratis y empieza a crear clips'}
            </p>
          </div>



          {/* Email / Password form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            <div className="text-[11px] text-muted-foreground/60">Usar email de prueba: <span className="font-mono">demo@clipflow.com</span></div>
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <div className="text-[11px] text-muted-foreground/60">Contraseña de prueba: <span className="font-mono">Demo123</span></div>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar con email' : 'Crear cuenta'}
            </Button>
          </form>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          {/* Toggle mode */}
          <div className="text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                ¿No tienes cuenta?{' '}
                <button
                  onClick={() => { setMode('register'); setError(null); }}
                  className="text-primary font-medium hover:underline"
                >
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                ¿Ya tienes cuenta?{' '}
                <button
                  onClick={() => { setMode('login'); setError(null); }}
                  className="text-primary font-medium hover:underline"
                >
                  Iniciar sesión
                </button>
              </>
            )}
          </div>

          {/* Demo hint - subtle */}
          <button
            type="button"
            onClick={() => { setEmail('demo@clipflow.com'); setPassword('Demo123'); }}
            className="w-full text-center text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer"
          >
            ¿Solo querés probar? Usá <span className="font-mono">demo@clipflow.com</span> / <span className="font-mono">Demo123</span>
          </button>

          <p className="text-xs text-muted-foreground text-center">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">{icon}</div>
    <span className="text-sm text-foreground">{text}</span>
  </div>
);

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export default Auth;
