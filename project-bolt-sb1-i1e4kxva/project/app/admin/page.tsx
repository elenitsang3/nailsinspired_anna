'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { SERVICE_TIERS, type Profile, type AvailableSlot, type Booking } from '@/lib/types';
import { Check, Trash2, Plus, Loader2, ShieldCheck, Users, Clock, CalendarDays, ImageIcon, ExternalLink } from 'lucide-react';

function fmt(s: string) {
  return new Date(s).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function AdminPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();
  const [ready, setReady] = useState(false);

  const [pending, setPending] = useState<Profile[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [bookings, setBookings] = useState<(Booking & { profile?: Profile; slot?: AvailableSlot })[]>([]);

  const [newStart, setNewStart] = useState('');
  const [newEnd, setNewEnd] = useState('');
  const [slotMsg, setSlotMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadAll = useCallback(async () => {
    const [pendRes, slotsRes, bookingsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('is_approved', false).order('created_at', { ascending: false }),
      supabase.from('available_slots').select('*').order('slot_start', { ascending: true }),
      supabase.from('bookings').select('*, slot:available_slots(*), profile:profiles(*)').order('created_at', { ascending: false }),
    ]);
    setPending((pendRes.data as Profile[]) || []);
    setApprovedCount(((pendRes.data as Profile[]) || []).length);
    setSlots((slotsRes.data as AvailableSlot[]) || []);
    setBookings((bookingsRes.data as (Booking & { profile?: Profile; slot?: AvailableSlot })[]) || []);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!profile) { router.replace('/login'); return; }
      if (!profile.is_admin) { router.replace('/book'); return; }
      loadAll().finally(() => setReady(true));
    }
  }, [profile, loading, router, loadAll]);

  const approveClient = async (id: string) => {
    setBusy(true);
    const { error } = await supabase.from('profiles').update({ is_approved: true }).eq('id', id);
    if (error) { setSlotMsg(error.message); setBusy(false); return; }
    await loadAll();
    setBusy(false);
  };

  const deleteClient = async (id: string) => {
    setBusy(true);
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) { setSlotMsg(error.message); setBusy(false); return; }
    await loadAll();
    setBusy(false);
  };

  const addSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setSlotMsg(null);
    if (!newStart || !newEnd) { setSlotMsg('Pick both start and end.'); return; }
    setBusy(true);
    const { error } = await supabase.from('available_slots').insert({
      slot_start: new Date(newStart).toISOString(),
      slot_end: new Date(newEnd).toISOString(),
      is_booked: false,
    });
    if (error) { setSlotMsg(error.message); setBusy(false); return; }
    setNewStart(''); setNewEnd('');
    await loadAll();
    setBusy(false);
  };

  const deleteSlot = async (id: string) => {
    setBusy(true);
    const { error } = await supabase.from('available_slots').delete().eq('id', id);
    if (error) { setSlotMsg(error.message); setBusy(false); return; }
    await loadAll();
    setBusy(false);
  };

  const cancelBooking = async (id: string) => {
    if (!confirm('Cancel this booking and reopen the time slot?')) return;
    setBusy(true);
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (error) { setSlotMsg(error.message); setBusy(false); return; }
    await loadAll();
    setBusy(false);
  };
  
  const getPhotoUrl = async (path: string) => {
    const { data } = await supabase.storage.from('reference-pics').createSignedUrl(path, 3600);
    if (data) window.open(data.signedUrl, '_blank');
  };

  if (loading || !ready) {
    return <div className="min-h-screen grid place-items-center"><Loader2 className="w-6 h-6 animate-spin text-stone-400" /></div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-5xl mx-auto px-5 py-10 w-full">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-accent" />
          <h1 className="font-display text-3xl">Admin Dashboard</h1>
        </div>
        <p className="text-stone-500 text-sm mb-8">Manage clients, availability, and bookings.</p>

        <Tabs defaultValue="clients" className="w-full">
          <TabsList className="rounded-full bg-stone-100 p-1 mb-6 flex w-full sm:w-auto">
            <TabsTrigger value="clients" className="rounded-full data-[state=active]:bg-white flex items-center gap-1.5">
              <Users className="w-4 h-4" /> Approve Clients {approvedCount > 0 && <span className="ml-1 text-xs bg-accent text-white rounded-full px-1.5">{approvedCount}</span>}
            </TabsTrigger>
            <TabsTrigger value="hours" className="rounded-full data-[state=active]:bg-white flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Manage Hours
            </TabsTrigger>
            <TabsTrigger value="bookings" className="rounded-full data-[state=active]:bg-white flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" /> Bookings
            </TabsTrigger>
          </TabsList>

          {/* Approve Clients */}
          <TabsContent value="clients">
            <h2 className="font-display text-xl mb-4">Pending Access Requests</h2>
            {pending.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="p-10 text-center text-sm text-stone-500">No pending requests. Everyone is approved.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {pending.map((p) => (
                  <Card key={p.id} className="rounded-2xl border-border/70">
                    <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-medium text-stone-800">{p.full_name}</p>
                        <p className="text-xs text-stone-500 mt-1">{p.phone}{p.instagram_handle ? ` · @${p.instagram_handle}` : ''}</p>
                        <p className="text-xs text-stone-400 mt-0.5">Requested {fmt(p.created_at)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-full bg-green-600 hover:bg-green-700 text-white" onClick={() => approveClient(p.id)} disabled={busy}>
                          <Check className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => deleteClient(p.id)} disabled={busy}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Manage Hours */}
          <TabsContent value="hours">
            <h2 className="font-display text-xl mb-4">Availability Blocks</h2>
            <Card className="rounded-2xl border-border/70 mb-6">
              <CardContent className="p-5">
                <form onSubmit={addSlot} className="flex flex-wrap items-end gap-4">
                  <div className="flex-1 min-w-[180px]">
                    <Label htmlFor="start" className="mb-1.5 block text-xs">Start</Label>
                    <Input id="start" type="datetime-local" value={newStart} onChange={(e) => setNewStart(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="flex-1 min-w-[180px]">
                    <Label htmlFor="end" className="mb-1.5 block text-xs">End</Label>
                    <Input id="end" type="datetime-local" value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="rounded-lg" />
                  </div>
                  <Button type="submit" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={busy}>
                    <Plus className="w-4 h-4 mr-1" /> Add Slot
                  </Button>
                </form>
                {slotMsg && <p className="text-sm text-destructive mt-3">{slotMsg}</p>}
              </CardContent>
            </Card>

            {slots.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="p-10 text-center text-sm text-stone-500">No slots yet. Add availability above so clients can book.</CardContent></Card>
            ) : (
              <div className="space-y-2">
                {slots.map((s) => (
                  <Card key={s.id} className="rounded-xl border-border/70">
                    <CardContent className="p-3 flex items-center justify-between gap-3">
                      <div className="text-sm">
                        <span className="text-stone-800 font-medium">{fmt(s.slot_start)}</span>
                        <span className="text-stone-400"> → {fmt(s.slot_end)}</span>
                        {s.is_booked && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Booked</span>}
                      </div>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/5 h-8 px-2" onClick={() => deleteSlot(s.id)} disabled={busy}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Bookings */}
          <TabsContent value="bookings">
            <h2 className="font-display text-xl mb-4">All Bookings</h2>
            {bookings.length === 0 ? (
              <Card className="rounded-2xl border-dashed"><CardContent className="p-10 text-center text-sm text-stone-500">No bookings yet.</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => {
                  const tierInfo = SERVICE_TIERS.find((t) => t.id === b.tier);
                  return (
                    <Card key={b.id} className="rounded-2xl border-border/70">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-stone-800">{b.profile?.full_name ?? 'Client'}</p>
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">{tierInfo?.name ?? b.tier}</span>
                            </div>
                            <p className="text-xs text-stone-500">📞 {b.profile?.phone ?? '—'}</p>
                            <p className="text-xs text-stone-500">🕒 {b.slot ? fmt(b.slot.slot_start) : 'TBD'}</p>
                            {b.design_notes && <p className="text-xs text-stone-600 mt-2 max-w-md italic">&ldquo;{b.design_notes}&rdquo;</p>}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {b.reference_photo_path ? (
                              <Button size="sm" variant="outline" className="rounded-full" onClick={() => getPhotoUrl(b.reference_photo_path!)}>
                                <ImageIcon className="w-4 h-4 mr-1" /> View Photo <ExternalLink className="w-3 h-3 ml-1" />
                              </Button>
                            ) : (
                              <span className="text-xs text-stone-400">No photo</span>
                            )}
                            <Button size="sm" variant="outline" className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => cancelBooking(b.id)} disabled={busy}>
  Cancel
</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Link href="/" className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-primary mt-8">← Back to home</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
