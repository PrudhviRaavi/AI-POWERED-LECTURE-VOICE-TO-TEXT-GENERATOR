import { useState } from 'react';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AuthFormProps {
  onSignIn: (email: string, password: string) => Promise<{ error: any }>;
  onSignUp: (email: string, password: string) => Promise<{ error: any }>;
}

export function AuthForm({ onSignIn, onSignUp }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isSignUp
        ? await onSignUp(email, password)
        : await onSignIn(email, password);

      if (error) {
        setError(error.message);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-10">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6 fade-up">
        <section className="soft-panel rounded-3xl p-8 md:p-10 text-slate-900">
          <p className="uppercase tracking-[0.2em] text-xs text-slate-500 mb-3">Intelligent Workspace</p>
          <h1 className="font-editorial text-4xl md:text-5xl leading-tight mb-4">
            Turn lecture chaos into structured insight.
          </h1>
          <p className="text-slate-600 max-w-lg mb-8">
            Record, transcribe, summarize, and organize with a focused interface designed for serious coursework.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-2xl bg-white/70 border border-slate-200 p-4">
              <p className="text-slate-500">Speed</p>
              <p className="text-xl font-bold text-slate-900">3x Faster</p>
            </div>
            <div className="rounded-2xl bg-white/70 border border-slate-200 p-4">
              <p className="text-slate-500">Clarity</p>
              <p className="text-xl font-bold text-slate-900">AI Summary</p>
            </div>
            <div className="rounded-2xl bg-white/70 border border-slate-200 p-4">
              <p className="text-slate-500">Format</p>
              <p className="text-xl font-bold text-slate-900">Export Ready</p>
            </div>
          </div>
        </section>

        <div className="soft-panel rounded-3xl p-8 md:p-10">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-widest text-slate-500 mb-2">Welcome</p>
            <h2 className="text-3xl font-bold text-slate-900">{isSignUp ? 'Create Account' : 'Sign In'}</h2>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsSignUp(false)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                !isSignUp
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(true)}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all ${
                isSignUp
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white/80"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition bg-white/80"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </>
              ) : (
                <>
                  {isSignUp ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  {isSignUp ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setIsSignUp(false)}
                  className="text-blue-700 hover:text-blue-800 font-semibold"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsSignUp(true)}
                  className="text-blue-700 hover:text-blue-800 font-semibold"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            <p>Secure authentication powered by Supabase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
