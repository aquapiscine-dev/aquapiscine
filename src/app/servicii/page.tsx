import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Servicii" };

const SERVICES = [
  {
    title: "Instalare echipamente",
    desc: "Montaj filtre, pompe, sisteme de căldură, automatizări. Predare cu testare completă a instalației.",
  },
  {
    title: "Construcție piscină",
    desc: "De la proiect la recepție: săpătură, armătură, turnare, finisaje. Lucrare cheie în mână.",
  },
  {
    title: "Placare și finisaje",
    desc: "Mozaic, gresie, liner. Finisaje premium cu garanție aplicată de echipa noastră.",
  },
  {
    title: "Întreținere și mentenanță",
    desc: "Contracte sezoniere: curățenie, control chimie apă, revizie pompe și filtre.",
  },
];

export default function ServiciiPage() {
  return (
    <div className="depth-bg min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">Servicii</h1>
        <p className="mt-3 text-slate max-w-xl">
          Nu vindem doar echipamente — le instalăm, le punem în funcțiune și le întreținem.
        </p>
        <div className="mt-10 grid gap-px bg-grout border border-grout sm:grid-cols-2">
          {SERVICES.map((s) => (
            <div key={s.title} className="bg-white p-8">
              <h2 className="font-display text-xl font-bold text-ink">{s.title}</h2>
              <p className="mt-3 text-sm text-slate leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10">
          <Link href="/contact" className="btn-pill btn-primary px-8 py-3.5 text-sm">
            Cere ofertă
          </Link>
        </div>
      </div>
    </div>
  );
}
