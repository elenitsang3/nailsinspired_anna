import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SERVICE_TIERS } from '@/lib/types';
import { Clock, ArrowRight, Sparkles, Gem, Heart } from 'lucide-react';

const GALLERY = [
  { cls: 'nail-gradient-rose', label: 'Petal Whisper', tier: 'Tier 2' },
  { cls: 'nail-gradient-noir', label: 'Noir Lacquer', tier: 'Tier 1' },
  { cls: 'nail-gradient-gold', label: 'Gilded Leaf', tier: 'Tier 3' },
  { cls: 'nail-gradient-mauve', label: 'Mauve Reverie', tier: 'Tier 2' },
  { cls: 'nail-gradient-nude', label: 'Nude Minimal', tier: 'Tier 1' },
  { cls: 'nail-gradient-bordeaux', label: 'Bordeaux Velvet', tier: 'Tier 3' },
  { cls: 'nail-gradient-pearl', label: 'Pearl Drop', tier: 'Tier 2' },
  { cls: 'nail-gradient-sage', label: 'Sage Botanica', tier: 'Tier 2' },
  { cls: 'nail-gradient-ember', label: 'Ember Glaze', tier: 'Tier 3' },
  { cls: 'nail-gradient-blush', label: 'Blush Romance', tier: 'Tier 1' },
  { cls: 'nail-gradient-rose', label: 'Rosé Chrome', tier: 'Tier 2' },
  { cls: 'nail-gradient-gold', label: 'Honey 3D Charm', tier: 'Tier 3' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] rounded-full nail-gradient-rose opacity-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] rounded-full nail-gradient-mauve opacity-20 blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto px-5 pt-24 pb-20 md:pt-32 md:pb-28">
            <div className="max-w-2xl animate-fade-up">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-border text-xs tracking-widest uppercase text-stone-500 mb-6">
                <Sparkles className="w-3 h-3 text-accent" /> By appointment only
              </span>
              <h1 className="font-display text-5xl md:text-7xl leading-[1.05] text-balance text-stone-900">
                Nail art, treated like a <span className="italic text-accent">canvas.</span>
              </h1>
              <p className="mt-6 text-lg text-stone-600 leading-relaxed max-w-xl">
                A private studio for regulars who expect more than a polish change. Hand-painted detail, 3D sculpture, and finishes that last. Access is by approval — regulars only.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-7">
                  <Link href="/login">Client Login / Request Access <ArrowRight className="w-4 h-4 ml-1" /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full border-primary/30 text-primary px-7">
                  <Link href="/#tiers">View Services</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery */}
        <section id="gallery" className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl">Portfolio Gallery</h2>
              <p className="text-stone-500 mt-2">A selection of recent work. Each set is one-of-one.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {GALLERY.map((item, i) => (
              <div
                key={i}
                className={`group relative aspect-square rounded-2xl overflow-hidden shadow-sm ${item.cls} hover:shadow-md transition-shadow`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-white text-sm font-medium drop-shadow">{item.label}</p>
                  <p className="text-white/80 text-xs">{item.tier}</p>
                </div>
                {/* glossy nail sheen */}
                <div className="absolute top-0 left-0 right-0 h-1/3 bg-white/20 blur-md opacity-60" />
              </div>
            ))}
          </div>
        </section>

        {/* Service Tiers */}
        <section id="tiers" className="max-w-6xl mx-auto px-5 py-16">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl md:text-4xl">Service Tiers</h2>
            <p className="text-stone-500 mt-2">Transparent pricing and timing. Pick the level of detail that fits.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {SERVICE_TIERS.map((tier, i) => (
              <div
                key={tier.id}
                className="relative rounded-3xl bg-white border border-border/70 p-7 flex flex-col hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="w-10 h-10 rounded-full grid place-items-center text-white"
                    style={{ background: i === 0 ? '#c9a98c' : i === 1 ? '#d98ba3' : '#8a3a4a' }}>
                    {i === 0 ? <Gem className="w-5 h-5" /> : i === 1 ? <Sparkles className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                  </span>
                  <span className="text-2xl font-display">{tier.price}</span>
                </div>
                <h3 className="font-display text-xl mb-1">{tier.name}</h3>
                <p className="text-sm text-stone-500 leading-relaxed flex-1">{tier.description}</p>
                <div className="mt-5 pt-5 border-t border-border/60 flex items-center gap-2 text-sm text-stone-600">
                  <Clock className="w-4 h-4 text-accent" /> {tier.duration}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* About */}
        <section id="about" className="max-w-6xl mx-auto px-5 py-16">
          <div className="rounded-3xl bg-stone-900 text-stone-100 p-10 md:p-16 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full nail-gradient-rose opacity-30 blur-3xl" />
            <div className="relative max-w-xl">
              <h2 className="font-display text-3xl md:text-4xl mb-5">The Studio</h2>
              <p className="text-stone-300 leading-relaxed">
                NAILSINPIRED. ANNA is a single-chair studio — no walk-ins, no rush. Each appointment is booked so the artist can prepare your design in advance. That is why access is approved manually: we keep a small, dedicated clientele so every set gets the time it deserves.
              </p>
              <p className="text-stone-400 leading-relaxed mt-4 text-sm">
                After you request access, your profile is reviewed. Once approved you can book any available slot, upload reference photos, and track your upcoming appointments.
              </p>
              <Button asChild className="mt-7 rounded-full bg-white text-stone-900 hover:bg-stone-200">
                <Link href="/login">Request Access <ArrowRight className="w-4 h-4 ml-1" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
