import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Contact</h1>
        <p className="mt-3 text-slate">Scrie-ne și îți răspundem în maxim o zi lucrătoare.</p>

        <form className="mt-10 tile p-6 sm:p-8 space-y-5" action="/api/contact" method="POST">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-ink mb-1.5">Nume</label>
              <input id="name" name="name" required className="w-full h-11 rounded-lg border border-grout px-3 text-sm focus:outline-none focus:border-primary" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input id="email" name="email" type="email" required className="w-full h-11 rounded-lg border border-grout px-3 text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-ink mb-1.5">Telefon</label>
            <input id="phone" name="phone" type="tel" className="w-full h-11 rounded-lg border border-grout px-3 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-ink mb-1.5">Mesaj</label>
            <textarea id="message" name="message" rows={5} required className="w-full rounded-lg border border-grout px-3 py-2.5 text-sm focus:outline-none focus:border-primary" />
          </div>
          <button type="submit" className="btn-pill btn-primary px-8 py-3.5 text-sm">Trimite mesajul</button>
        </form>

        <div className="mt-10 grid gap-px bg-grout border border-grout sm:grid-cols-3">
          {[
            ["Email", "contact@aquapiscine.ro"],
            ["Program", "Luni–Vineri, 09:00–18:00"],
            ["Livrare", "Toată România"],
          ].map(([t, d]) => (
            <div key={t} className="bg-white p-5">
              <div className="tile-legend">{t}</div>
              <div className="mt-1 font-cta text-sm font-medium text-ink">{d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
