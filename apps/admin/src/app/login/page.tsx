'use client';

// Force dynamic rendering — this page uses browser-side Supabase client
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="mb-5 inline-flex size-16 items-center justify-center rounded-2xl bg-ai-deep font-display text-3xl text-washi-raised shadow-lg">
            無
          </div>
          <h1 className="font-display text-3xl tracking-tight">MugenDojo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pannello Amministrazione</p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h2 className="mb-6 text-lg font-semibold">Accedi</h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sensei@mugendojo.it"
                className="w-full rounded-md border border-border bg-washi px-3.5 py-2.5 text-foreground placeholder-muted-foreground transition focus:border-ai focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-border bg-washi px-3.5 py-2.5 text-foreground placeholder-muted-foreground transition focus:border-ai focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {error && (
              <div className="rounded-md border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-accent">
                {error}
              </div>
            )}

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-ai-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Accesso in corso…' : 'Accedi al Dojo'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          MugenDojo · {new Date().getFullYear()}
        </p>
      </div>
    </main>
  );
}
