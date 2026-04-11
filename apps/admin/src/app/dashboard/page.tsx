import { createSupabaseServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Dashboard root — protected server component.
 * Verifies the session; redirects to /login if unauthenticated.
 */
export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">無</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MugenDojo</h1>
            <p className="text-slate-400 text-sm">Pannello Amministrazione</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Placeholder cards */}
          {[
            { label: 'Presenze oggi', value: '—', icon: '🥋' },
            { label: 'Aikidoka attivi', value: '—', icon: '👥' },
            { label: 'Prossimo esame', value: '—', icon: '📋' },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-2xl p-6"
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <p className="text-slate-400 text-sm">{card.label}</p>
              <p className="text-2xl font-bold mt-1">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-sm text-slate-500">
          Autenticato come: <span className="text-slate-300">{user.email}</span>
        </div>
      </div>
    </main>
  );
}
