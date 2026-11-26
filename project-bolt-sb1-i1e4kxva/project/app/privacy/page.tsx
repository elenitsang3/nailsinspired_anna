import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 max-w-3xl mx-auto px-5 py-16">
        <h1 className="font-display text-4xl mb-2">Privacy Policy</h1>
        <p className="text-sm text-stone-500 mb-10">Last updated: November 2026</p>

        <div className="prose prose-stone max-w-none space-y-8 text-stone-700 leading-relaxed">
          <section>
            <h2 className="font-display text-2xl mb-3">1. Who we are</h2>
            <p>NAILSINPIRED. ANNA (&ldquo;we&rdquo;, &ldquo;the studio&rdquo;) is a private nail art studio operating by appointment only. This policy explains how we collect, use, and protect your personal data in line with the GDPR.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">2. Data we collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Identity:</strong> full name, Instagram handle.</li>
              <li><strong>Contact:</strong> email address and phone number.</li>
              <li><strong>Booking data:</strong> chosen service tier, design notes, and any reference photos you upload.</li>
              <li><strong>Account credentials:</strong> managed securely by our auth provider; we never see your password.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">3. Why we use your data</h2>
            <p>We process your data only to: review and approve access requests, schedule and prepare appointments, contact you about bookings, and maintain a record of past designs. Processing is based on your consent and our legitimate interest in running the studio.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">4. Reference photos</h2>
            <p>Photos you upload are stored privately and are only visible to you and the studio admin. They are used solely to prepare your design and are not shared publicly.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">5. Data retention</h2>
            <p>We keep your profile and booking history for as long as you are an active client. You may request deletion at any time — see your rights below.</p>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">6. Your GDPR rights</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access — request a copy of the data we hold about you.</li>
              <li>Rectification — correct inaccurate information.</li>
              <li>Erasure — request that we delete your data.</li>
              <li>Restriction &amp; objection — limit or object to certain processing.</li>
              <li>Portability — receive your data in a structured format.</li>
              <li>Withdraw consent — at any time, by contacting the studio.</li>
            </ul>
          </section>
          <section>
            <h2 className="font-display text-2xl mb-3">7. Contact</h2>
            <p>To exercise any right above, email the studio. We respond within 30 days. You also have the right to lodge a complaint with your local data protection authority.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
