'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SERVICE_TIERS, type AvailableSlot, type Booking } from '@/lib/types';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Clock, Upload, CheckCircle2, CalendarDays, Loader2, ArrowLeft, ImageIcon } from 'lucide-react';

function formatSlot(s: string) {
  return new Date(s).toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function BookPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [tier, setTier] = useState<string>(SERVICE_TIERS[0].id);
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  const loadData = useCallback(async () => {
    setLoadingData(true);
    const [slotsRes, bookingsRes] = await Promise.all([
      supabase.from('available_slots').select('*').eq('is_booked', false).gte('slot_start', new Date().toISOString()).order('slot_start', { ascending: true }),
      supabase.from('bookings').select('*, slot:available_slots(*)').eq('user_id', profile!.id).order('created_at', { ascending: false }),
    ]);
    setSlots((slotsRes.data as AvailableSlot[]) || []);
    setUpcoming(((bookingsRes.data as Booking[]) || []).filter((b) => new Date(b.slot?.slot_start || b.created_at) >= new Date(Date.now() - 86400000)));
    setLoadingData(false);
  }, [profile]);

  useEffect(() => {
    if (!loading) {
      if (!profile) { router.replace('/login'); return; }
      if (profile.is_admin) { router.replace('/admin'); return; }
      if (!profile.is_approved) { router.replace('/login'); return; }
      loadData();
    }
  }, [profile, loading, router, loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedSlot) { setError('Please pick a time slot.'); return; }
    if (!profile) return;
    setSubmitting(true);
    try {
      let photoPath: string | null = null;
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${profile.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('reference-pics').upload(path, file, { upsert: false });
        if (upErr) throw upErr;
        photoPath = path;
      }

      const { data: booking, error: bookErr } = await supabase.from('bookings').insert({
        user_id: profile.id,
        slot_id: selectedSlot,
        tier,
        design_notes: notes || null,
        reference_photo_path: photoPath,
      }).select().single();
      if (bookErr) throw bookErr;

      const { error: slotErr } = await supabase.from('available_slots').update({ is_booked: true }).eq('id', selectedSlot);
      if (slotErr) throw slotErr;

      setSuccess(true);
      setSelectedSlot(null);
      setTier(SERVICE_TIERS[0].id);
      setNotes('');
      setFile(null);
      loadData();
      void booking;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto px-5 py-10 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl">Book an Appointment</h1>
            <p className="text-stone-500 text-sm mt-1">Welcome back, {profile?.full_name.split(' ')[0]}.</p>
          </div>
        </div>

        {success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl bg-green-50 border border-green-200 px-4 py-3 animate-fade-up">
            <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">Booking confirmed!</p>
              <p className="text-xs text-green-700">We can&apos;t wait to create your set. See it below under upcoming appointments.</p>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Booking form */}
          <Card className="rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle className="font-display text-xl">New Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Slot selection */}
                <div>
                  <Label className="mb-2 block">1. Choose a time slot</Label>
                  {loadingData ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-stone-100 animate-pulse" />)}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-sm text-stone-500 py-6 text-center rounded-xl bg-muted/50">No open slots right now. Check back soon — the studio adds availability weekly.</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto pr-1">
                      {slots.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedSlot(s.id)}
                          className={`text-left rounded-lg border px-3 py-2.5 text-sm transition-all ${selectedSlot === s.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border hover:border-primary/40 bg-white'}`}
                        >
                          <span className="block font-medium text-stone-800">{formatSlot(s.slot_start).split(',')[0]}</span>
                          <span className="block text-xs text-stone-500">{formatSlot(s.slot_start).split(', ').slice(1).join(', ')}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tier selection */}
                <div>
                  <Label className="mb-2 block">2. Select service tier</Label>
                  <RadioGroup value={tier} onValueChange={setTier} className="space-y-2">
                    {SERVICE_TIERS.map((t) => (
                      <label key={t.id} className={`flex items-start gap-3 rounded-lg border px-3 py-3 cursor-pointer transition-all ${tier === t.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                        <RadioGroupItem value={t.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-stone-800">{t.name}</span>
                            <span className="text-sm font-display">{t.price}</span>
                          </div>
                          <p className="text-xs text-stone-500 mt-0.5">{t.description}</p>
                          <span className="text-xs text-stone-400 inline-flex items-center gap-1 mt-1"><Clock className="w-3 h-3" /> {t.duration}</span>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="mb-2 block">3. Design notes</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-lg resize-none" placeholder="Describe colors, shapes, inspiration, anything we should prepare..." />
                </div>

                {/* Photo upload */}
                <div>
                  <Label className="mb-2 block">4. Reference photo (optional)</Label>
                  <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/40 px-4 py-6 cursor-pointer transition-colors bg-muted/30">
                    {file ? (
                      <span className="text-sm text-stone-700 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-accent" /> {file.name}</span>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 text-stone-400" />
                        <span className="text-sm text-stone-500">Click to upload a reference image</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>

                {error && <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">{error}</p>}

                <Button type="submit" disabled={submitting || !selectedSlot} className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90 py-2.5">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Upcoming appointments */}
          <div>
            <h2 className="font-display text-xl mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5 text-accent" /> Your Appointments</h2>
            {loadingData ? (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => <div key={i} className="h-24 rounded-2xl bg-stone-100 animate-pulse" />)}
              </div>
            ) : upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-stone-500">No upcoming appointments yet.</p>
                <p className="text-xs text-stone-400 mt-1">Pick a slot to book your first set.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((b) => {
                  const tierInfo = SERVICE_TIERS.find((t) => t.id === b.tier);
                  return (
                    <Card key={b.id} className="rounded-2xl border-border/70 overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-sm text-stone-800">{tierInfo?.name ?? b.tier}</p>
                            <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {b.slot ? formatSlot(b.slot.slot_start) : 'Time TBD'}
                            </p>
                            {b.design_notes && <p className="text-xs text-stone-400 mt-2 line-clamp-2">{b.design_notes}</p>}
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">Booked</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary mt-6">
              <ArrowLeft className="w-4 h-4" /> Back to home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
