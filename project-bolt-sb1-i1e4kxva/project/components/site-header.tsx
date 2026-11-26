'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const { profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  const links = (
    <>
      <Link href="/#gallery" className="text-sm tracking-wide text-stone-600 hover:text-primary transition-colors">Gallery</Link>
      <Link href="/#tiers" className="text-sm tracking-wide text-stone-600 hover:text-primary transition-colors">Services</Link>
      <Link href="/#about" className="text-sm tracking-wide text-stone-600 hover:text-primary transition-colors">Studio</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/60">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link href="/" aria-label="NAILSINPIRED. ANNA home" className="flex items-center gap-2 group">
          <span className="relative w-10 h-9 text-stone-950 group-hover:scale-105 transition-transform" aria-hidden="true">
            <span className="absolute -top-2 left-0 font-display text-[2.35rem] leading-none">A</span>
            <span className="absolute top-0 left-4 font-display text-[2.2rem] leading-none">T</span>
          </span>
          <span className="text-[0.58rem] tracking-[0.28em] font-medium text-stone-900 whitespace-nowrap">NAILSINPIRED. ANNA</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {profile ? (
            <>
              <span className="text-sm text-stone-500">Hi, {profile.full_name.split(' ')[0]}</span>
              {profile.is_admin ? (
                <Button asChild size="sm" variant="outline" className="rounded-full border-primary/40 text-primary">
                  <Link href="/admin">Admin</Link>
                </Button>
              ) : profile.is_approved ? (
                <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <Link href="/book">Book</Link>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground px-3 py-1 rounded-full bg-muted">Pending</span>
              )}
              <Button onClick={() => signOut()} size="sm" variant="ghost" className="rounded-full">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/login">Client Login</Link>
            </Button>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border/60 glass px-5 py-4 flex flex-col gap-4">
          {links}
          <div className="pt-2 border-t border-border/40">
            {profile ? (
              <div className="flex flex-col gap-2">
                {profile.is_admin && <Link href="/admin" className="text-sm text-primary">Admin Dashboard</Link>}
                {profile.is_approved && <Link href="/book" className="text-sm text-primary">Book Appointment</Link>}
                <button onClick={() => { signOut(); setOpen(false); }} className="text-sm text-stone-600 text-left">Sign out</button>
              </div>
            ) : (
              <Link href="/login" className="text-sm text-primary">Client Login / Request Access</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
