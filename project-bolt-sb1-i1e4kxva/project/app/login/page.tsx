'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import type { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [instagram, setInstagram] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && profile) {
      if (profile.is_admin) router.replace('/admin');
      else if (profile.is_approved) router.replace('/book');
      // pending users stay here with a message below
    }
  }, [profile, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && !consent) {
      setError('Please accept the Privacy Policy to request access.');
      return;
    }
    if (mode === 'signup' && (!fullName || !phone)) {
      setError('Full name and phone number are required.');
      return;
    }

    setSubmitting(true);
    try {
      let userId: string | undefined;

      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (signUpError) throw signUpError;
        userId = data.user?.id;
        if (userId) {
          const { error: profileError } = await supabase.from('profiles').insert({
            id: userId,
            full_name: fullName,
            phone,
            instagram_handle: instagram || null,
          });
          if (profileError) {
            if (!profileError.message.includes('duplicate')) throw profileError;
          }
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        userId = data.user?.id;
      }

      // After successful auth, fetch the profile immediately and redirect.
      if (userId) {
        const { data: profileRow, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (profileErr) throw profileErr;
        const p = profileRow as Profile | null;
        if (p) {
          if (p.is_admin) {
            router.replace('/admin');
            return;
          }
          if (p.is_approved) {
            router.replace('/book');
            return;
          }
          // Pending — stay on page; the pending screen renders via context.
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && profile && !profile.is_approved && !profile.is_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 bg-stone-50">
        <div className="max-w-md w-full text-center bg-white rounded-3xl border border-border p-10 shadow-sm">
          <span className="w-12 h-12 rounded-full nail-gradient-rose grid place-items-center mx-auto mb-5">
            <Sparkles className="w-6 h-6 text-white" />
          </span>
          <h1 className="font-display text-2xl mb-3">Pending Approval</h1>
          <p className="text-stone-600 leading-relaxed">
            Thanks, {profile.full_name.split(' ')[0]}. Your access request is under review. NAILSINPIRED. ANNA is a regulars-only studio, so each request is approved manually. We&apos;ll be in touch soon.
          </p>
          <Button asChild variant="outline" className="rounded-full mt-6">
            <Link href="/"><ArrowLeft className="w-4 h-4 mr-1" /> Back to home</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Visual side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 nail-gradient-mauve" />
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full nail-gradient-rose opacity-40 blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full nail-gradient-bordeaux opacity-40 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-end p-12 text-white">
          <Sparkles className="w-8 h-8 mb-4" />
          <h2 className="font-display text-4xl leading-tight mb-3">Regulars only.<br />By invitation.</h2>
          <p className="text-white/80 max-w-sm">Existing clients sign in to book. New clients request access — we review each request personally.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <h1 className="font-display text-3xl mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Request access'}
          </h1>
          <p className="text-stone-500 text-sm mb-8">
            {mode === 'signin' ? 'Sign in to manage your bookings.' : 'Create a profile to join the client list.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="rounded-lg" placeholder="Jane Doe" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="rounded-lg" placeholder="+44 7700 900000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))} className="rounded-lg" placeholder="janedoe" />
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="rounded-lg" placeholder="you@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="rounded-lg" placeholder="••••••••" />
            </div>

            {mode === 'signup' && (
              <label className="flex items-start gap-3 pt-2 cursor-pointer">
                <Checkbox checked={consent} onCheckedChange={(v) => setConsent(v === true)} className="mt-0.5" />
                <span className="text-xs text-stone-600 leading-relaxed">
                  I have read and agree to the{' '}
                  <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>. I consent to my data being processed to review my access request and manage bookings. (Required under GDPR)
                </span>
              </label>
            )}

            {error && (
              <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" disabled={submitting} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : mode === 'signin' ? 'Sign In' : 'Request Access'}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-6">
            {mode === 'signin' ? "Don't have an account? " : 'Already a client? '}
            <button
              type="button"
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); }}
              className="text-primary font-medium hover:underline"
            >
              {mode === 'signin' ? 'Request access' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
