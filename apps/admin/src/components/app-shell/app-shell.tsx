"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  ClipboardCheck,
  CalendarDays,
  Award,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface NavItem {
  href?: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/attendance", label: "Presenze", icon: ClipboardCheck },
  { label: "Calendario", icon: CalendarDays },
  { label: "Esami", icon: Award },
  { label: "Comunicazioni", icon: MessageSquare },
];

function RailLink({ item, active }: { item: NavItem; active: boolean }) {
  const className = cn(
    "group relative flex h-11 w-11 items-center justify-center rounded-lg transition-colors",
    active ? "bg-primary text-primary-foreground" : "text-washi/70 hover:bg-white/10 hover:text-washi",
    !item.href && "cursor-default opacity-40 hover:bg-transparent",
  );
  const inner = (
    <>
      <item.icon className="size-5" />
      <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-md bg-sumi px-2 py-1 text-xs text-washi shadow-lg group-hover:block">
        {item.label}
        {!item.href && " · in arrivo"}
      </span>
    </>
  );
  return item.href ? (
    <Link href={item.href} aria-label={item.label} aria-current={active ? "page" : undefined} className={className}>
      {inner}
    </Link>
  ) : (
    <button type="button" aria-label={`${item.label} (in arrivo)`} disabled className={className}>
      {inner}
    </button>
  );
}

export function AppShell({ userEmail, children }: { userEmail: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Rail — hakama seam */}
      <aside className="sticky top-0 flex h-screen w-16 flex-col items-center gap-1 bg-ai-deep py-4">
        <Link
          href="/dashboard"
          aria-label="MugenDojo"
          className="mb-4 flex size-11 items-center justify-center rounded-lg bg-shu font-display text-xl text-washi-raised"
        >
          無
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-1">
          {NAV.map((item) => (
            <RailLink key={item.label} item={item} active={item.href === pathname} />
          ))}
        </nav>
        <button
          type="button"
          aria-label="Impostazioni (in arrivo)"
          disabled
          className="flex size-11 items-center justify-center rounded-lg text-washi/40"
        >
          <Settings className="size-5" />
        </button>
      </aside>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border px-8 py-4">
          <div>
            <h1 className="font-display text-xl tracking-tight">MugenDojo</h1>
            <p className="text-xs text-muted-foreground">Pannello Amministrazione</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground sm:inline">{userEmail}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <LogOut className="size-4" />
              Esci
            </button>
          </div>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
