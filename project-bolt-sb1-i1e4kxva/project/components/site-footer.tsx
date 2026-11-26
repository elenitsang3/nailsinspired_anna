import Link from 'next/link';
import { Instagram, Mail } from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-stone-100/50 mt-20">
      <div className="max-w-6xl mx-auto px-5 py-12 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="relative w-9 h-8 text-stone-950" aria-hidden="true">
              <span className="absolute -top-2 left-0 font-display text-[2rem] leading-none">A</span>
              <span className="absolute top-0 left-3.5 font-display text-[1.85rem] leading-none">T</span>
            </span>
            <span className="text-[0.54rem] tracking-[0.24em] font-medium">NAILSINPIRED. ANNA</span>
          </div>
          <p className="text-sm text-stone-500 leading-relaxed max-w-xs">
            A private nail art studio. By-appointment only, for regulars who treat nails as a canvas.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-1">Navigate</h4>
          <Link href="/" className="text-sm text-stone-600 hover:text-primary">Home</Link>
          <Link href="/#gallery" className="text-sm text-stone-600 hover:text-primary">Gallery</Link>
          <Link href="/#tiers" className="text-sm text-stone-600 hover:text-primary">Services</Link>
          <Link href="/login" className="text-sm text-stone-600 hover:text-primary">Client Login</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-1">Legal</h4>
          <Link href="/privacy" className="text-sm text-stone-600 hover:text-primary">Privacy Policy</Link>
          <div className="flex gap-4 mt-3">
            <a href="#" className="text-stone-400 hover:text-primary transition-colors" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
            <a href="#" className="text-stone-400 hover:text-primary transition-colors" aria-label="Email"><Mail className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-stone-400">
        © {new Date().getFullYear()} NAILSINPIRED. ANNA. All rights reserved.
      </div>
    </footer>
  );
}
