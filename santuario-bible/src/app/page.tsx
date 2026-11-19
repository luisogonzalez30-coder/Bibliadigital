import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Compass,
  Flame,
  HandHeart,
  HeartHandshake,
  ImageIcon,
  Languages,
  Lock,
  ShieldCheck,
  Smartphone,
  WifiOff,
} from "lucide-react";
import { InstallAppButton } from "@/components/landing/InstallAppButton";
import { OfferingSection } from "@/components/landing/OfferingSection";
import { RoseWindow } from "@/components/landing/RoseWindow";
import { SectionHeading } from "@/components/landing/SectionHeading";
import { VerifyVerse } from "@/components/landing/VerifyVerse";
import { CANONICAL_VERSES, EMOTIONS_METADATA, TRADITIONS_METADATA } from "@/data/canonicalSeed";
import { isOfferingConfigured } from "@/services/offeringConfig";
import { CRISIS_RESOURCES } from "@/services/problemAdvisor";

export const metadata: Metadata = {
  title: "Santuario · La Palabra, íntegra y verificada",
  description:
    "Lectura bíblica diaria con versículos reales, nunca resumidos ni inventados, de la tradición que elijas. Gratis, sin cuenta y con tu privacidad primero.",
};

const NAV = [
  { href: "#camino", label: "Nuestro camino" },
  { href: "/biblia", label: "La Biblia" },
  { href: "#escrituras", label: "Escrituras" },
  { href: "#verifica", label: "Verifica" },
  { href: "#preguntas", label: "Preguntas" },
];

const STEPS = [
  { n: "1", title: "Elige tu tradición", body: "Católica, protestante, Torá y Tanaj, o universal. El canon se ajusta a ti." },
  {
    n: "2",
    title: "Recibe tu versículo del día",
    body: "Una lectura de dos minutos, en láminas, que enciende tu Racha de Luz cada día que la completas.",
  },
  {
    n: "3",
    title: "Cuéntanos lo que vives",
    body: "Escribe o dicta lo que te preocupa. Verás un versículo del catálogo y una reflexión breve, siempre rotulada como tal.",
  },
];

const FEATURES = [
  { icon: HandHeart, title: "Compañeros de Fe", body: "Figuras de fe unidas a un pasaje real y a una guía para tu oración. Sin palabras atribuidas." },
  { icon: Compass, title: "Brújula del Alma", body: "Elige cómo te sientes y recibe un pasaje en un solo toque." },
  { icon: ImageIcon, title: "Postales 9:16", body: "Convierte un versículo en una imagen lista para compartir." },
  { icon: BookOpen, title: "Describe tu problema", body: "Escribe o dicta lo que vives y recibe un versículo real con una reflexión rotulada como tal." },
  { icon: Languages, title: "Espejo bilingüe", body: "Lee en español y, si quieres, con la traducción en inglés al lado." },
  { icon: Flame, title: "Racha de Luz", body: "Un hábito sereno, sin presión: cada día que lees, tu luz sigue encendida." },
  { icon: BookOpen, title: "Biblia completa", body: "Los 66 libros, con búsqueda y verificación por capítulo, en la Reina-Valera 1909 y la KJV." },
  { icon: WifiOff, title: "Sin internet", body: "Instálala y léela donde estés; tu lectura no depende de la conexión." },
];

const PLEDGES = [
  { icon: ShieldCheck, title: "Íntegro", body: "Ningún versículo se resume, parafrasea ni genera con IA. Si un texto no pasa la verificación, no se muestra." },
  { icon: Lock, title: "Privado", body: "Sin cuenta obligatoria. Lo que escribes al describir tu problema se analiza en tu dispositivo y no se guarda." },
  { icon: HeartHandshake, title: "Libre", body: "La lectura diaria, la Brújula y las postales son gratis para todos. El aporte es siempre voluntario." },
  { icon: BookOpen, title: "Honesto", body: "Nuestras reflexiones son orientación general y se rotulan como tal: no son Escritura ni reemplazan a un profesional." },
];

const FAQ: ReadonlyArray<{ q: string; a: string }> = [
  {
    q: "¿De dónde salen los versículos?",
    a: "De ediciones de dominio público: Reina-Valera 1909 (español) y King James Version (inglés). Se copian literalmente y cada uno lleva una huella SHA-256 que la app comprueba antes de mostrarlo.",
  },
  { q: "¿Cuesta algo?", a: "No. La lectura diaria, la Brújula del Alma y las postales son gratis. Si Santuario te hace bien, puedes hacer un aporte voluntario, sin ninguna obligación." },
  { q: "¿Necesito crear una cuenta?", a: "No. Todo funciona en tu dispositivo. Iniciar sesión con tu correo es opcional y solo sirve para respaldar tu tradición, tu racha y tus favoritos." },
  { q: "¿Guardan lo que escribo cuando describo mi problema?", a: "No. El texto se analiza en tu dispositivo y no se guarda ni se envía. Si usas el dictado por voz, el audio lo procesa el servicio de voz de tu navegador." },
  { q: "¿Reemplaza a mi sacerdote, pastor o a un profesional de salud?", a: "No. Santuario ofrece compañía y orientación general. Para decisiones importantes o momentos difíciles, busca a tu guía espiritual o a un profesional." },
  { q: "¿Funciona sin internet?", a: "Sí, una vez abierta o instalada como app. El dictado por voz es la excepción: depende del servicio de tu navegador." },
  {
    q: "¿Está la Biblia completa?",
    a: `Sí: los 66 libros, en la Reina-Valera 1909 y la King James, con búsqueda y verificación por capítulo en la sección «La Biblia». Los pasajes que usa la Brújula y el versículo del día (hoy ${CANONICAL_VERSES.length}) los elegimos a mano. Los deuterocanónicos se sumarán cuando contemos con una edición en español verificable.`,
  },
];

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-full bg-sanct-accent px-8 py-4 text-sm font-medium text-sanct-bg transition hover:opacity-90";
const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-full border border-sanct-border px-7 py-4 text-sm text-sanct-text transition hover:bg-sanct-surface";

export default function LandingPage() {
  const sample = CANONICAL_VERSES.find((v) => v.id === "NUM.6.24-26") ?? CANONICAL_VERSES[0];
  const verifyVerse = CANONICAL_VERSES.find((v) => v.id === "PRO.3.5-6") ?? CANONICAL_VERSES[0];
  const offering = isOfferingConfigured();

  return (
    <div className="relative text-sanct-text">
      <a href="#contenido" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-sanct-accent focus:px-4 focus:py-2 focus:text-sanct-bg">
        Saltar al contenido
      </a>

      {/* Barra flotante */}
      <header className="sticky top-4 z-40 mx-auto mt-4 w-[calc(100%-2rem)] max-w-6xl">
        <nav aria-label="Principal" className="flex items-center justify-between gap-4 rounded-full border border-sanct-border bg-sanct-bg/85 px-5 py-3 backdrop-blur">
          <Link href="/" className="scripture text-xl">
            Santuario
          </Link>
          <ul className="hidden items-center gap-7 text-sm text-sanct-muted lg:flex">
            {NAV.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="transition hover:text-sanct-text">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <InstallAppButton className="hidden items-center gap-2 rounded-full px-4 py-2 text-sm text-sanct-muted transition hover:text-sanct-text lg:inline-flex" />
            <details className="relative lg:hidden">
              <summary className="cursor-pointer list-none rounded-full px-3 py-2 text-sm text-sanct-muted">Menú</summary>
              <ul className="absolute right-0 top-full mt-2 w-56 space-y-1 rounded-2xl border border-sanct-border bg-sanct-bg p-3 text-sm shadow-lg">
                {NAV.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} className="block rounded-xl px-3 py-2 text-sanct-muted hover:bg-sanct-surface hover:text-sanct-text">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            <Link href="/santuario" className="rounded-full bg-sanct-accent px-5 py-2.5 text-sm font-medium text-sanct-bg transition hover:opacity-90">
              Entrar
            </Link>
          </div>
        </nav>
      </header>

      <main id="contenido">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="halo" aria-hidden />
          <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 pb-24 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pt-28">
          <div className="relative z-10 space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-sanct-border px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-sanct-muted">
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-sanct-accent" /> Gratis · Sin cuenta · Funciona sin internet
            </p>
            <h1 className="scripture text-5xl font-medium leading-[1.05] sm:text-7xl">
              La Palabra, íntegra y <em className="text-sanct-accent">verificada</em>.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-sanct-muted">
              Santuario te acompaña cada día con versículos reales —nunca resumidos, nunca inventados— de la tradición que elijas. Un momento de calma, en tu bolsillo.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/santuario" className={primaryBtn}>
                Entrar al Santuario
              </Link>
              <a href="#camino" className={ghostBtn}>
                Cómo funciona
              </a>
              <InstallAppButton className={`${ghostBtn} lg:hidden`} />
            </div>
            <ul className="space-y-2 text-sm text-sanct-muted">
              <li className="flex gap-2"><ShieldCheck size={16} aria-hidden className="mt-0.5 shrink-0 text-sanct-accent" /> Texto literal de Reina-Valera 1909 y King James Version</li>
              <li className="flex gap-2"><ShieldCheck size={16} aria-hidden className="mt-0.5 shrink-0 text-sanct-accent" /> Una huella SHA-256 por versículo, comprobada antes de mostrarlo</li>
              <li className="flex gap-2"><ShieldCheck size={16} aria-hidden className="mt-0.5 shrink-0 text-sanct-accent" /> Lo que escribes no sale de tu dispositivo</li>
            </ul>
          </div>

          {/* Vitral: arco con rosetón y versículo de ejemplo */}
          <div className="relative z-10 mx-auto w-full max-w-md">
            <RoseWindow className="rose-spin absolute -top-10 left-1/2 w-[130%] max-w-none -translate-x-1/2 text-sanct-accent opacity-30" />
            <figure className="relative space-y-5 rounded-t-[999px] rounded-b-3xl border border-sanct-border bg-sanct-bg/80 px-8 pb-10 pt-28 text-center backdrop-blur">
              <p className="text-xs uppercase tracking-[0.25em] text-sanct-muted">Versículo de ejemplo</p>
              <blockquote lang="es" className="scripture text-xl leading-relaxed">
                “{sample?.textEs}”
              </blockquote>
              <figcaption className="text-sm text-sanct-accent">
                {sample?.bookNameEs} {sample?.chapter}:{sample?.verseNumber} · {sample?.versionEs}
              </figcaption>
            </figure>
          </div>
          </div>
        </section>

        {/* Cifras reales */}
        <section aria-label="Santuario en cifras" className="border-y border-sanct-border">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-6 py-10 text-center sm:grid-cols-4">
            {[
              [String(TRADITIONS_METADATA.length), "tradiciones"],
              [String(EMOTIONS_METADATA.length), "emociones en la Brújula"],
              ["66", "libros de la Biblia"],
              ["0", "cuentas obligatorias"],
            ].map(([value, label]) => (
              <div key={label} className="space-y-1">
                <dt className="scripture text-4xl text-sanct-accent">{value}</dt>
                <dd className="text-sm text-sanct-muted">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* 01 · Nuestro camino */}
        <section id="camino" aria-labelledby="camino-title" className="mx-auto max-w-6xl scroll-mt-28 space-y-14 px-6 py-24">
          <SectionHeading
            id="camino-title"
            number="01"
            label="Nuestro camino"
            title={<>Un paso a la vez, <em className="text-sanct-accent">cada día</em>.</>}
            intro="Santuario no es un chatbot que inventa respuestas: es un lugar sereno donde cada texto viene de las Escrituras y cada consejo se declara como lo que es."
          />
          <ol className="grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="space-y-4 rounded-3xl border border-sanct-border p-8">
                <span className="scripture flex h-11 w-11 items-center justify-center rounded-full border border-sanct-accent/60 text-lg text-sanct-accent">{s.n}</span>
                <h3 className="scripture text-2xl">{s.title}</h3>
                <p className="leading-relaxed text-sanct-muted">{s.body}</p>
              </li>
            ))}
          </ol>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4 rounded-2xl bg-sanct-surface p-6">
                <Icon size={22} strokeWidth={1.5} aria-hidden className="mt-0.5 shrink-0 text-sanct-accent" />
                <div className="space-y-1">
                  <h3 className="font-medium">{title}</h3>
                  <p className="text-sm leading-relaxed text-sanct-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="ornament" aria-hidden />

        {/* 02 · Escrituras */}
        <section id="escrituras" aria-labelledby="escrituras-title" className="mx-auto max-w-6xl scroll-mt-28 space-y-12 px-6 py-24">
          <SectionHeading
            id="escrituras-title"
            number="02"
            label="Las Escrituras"
            title={<>Cuatro tradiciones, <em className="text-sanct-accent">un mismo respeto</em>.</>}
            intro="Eliges tu canon y Santuario te muestra solo lo que corresponde a él. Los textos provienen de Reina-Valera 1909 (español) y King James Version (inglés)."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TRADITIONS_METADATA.map((t) => (
              <li key={t.slug} className="space-y-3 rounded-3xl border border-sanct-border p-7">
                <h3 className="scripture text-2xl">{t.labelEs}</h3>
                <p className="text-sm leading-relaxed text-sanct-muted">{t.descriptionEs}</p>
                <p className="text-xs uppercase tracking-widest text-sanct-accent">{t.bookCount} libros</p>
              </li>
            ))}
          </ul>
          <p className="max-w-3xl rounded-2xl border border-sanct-border px-6 py-4 text-sm leading-relaxed text-sanct-muted">
            <strong className="font-medium text-sanct-text">Transparencia:</strong> el catálogo es nuevo y hoy reúne {CANONICAL_VERSES.length} pasajes verificados. Preferimos menos
            versículos, todos reales, antes que muchos sin garantía.
          </p>
        </section>

        <div className="ornament" aria-hidden />

        {/* 03 · Verifica */}
        <section id="verifica" aria-labelledby="verifica-title" className="mx-auto grid max-w-6xl scroll-mt-28 items-start gap-12 px-6 py-24 lg:grid-cols-2">
          <div className="space-y-8">
            <SectionHeading
              id="verifica-title"
              number="03"
              label="Confía, pero verifica"
              title={<>No te pedimos fe en <em className="text-sanct-accent">nosotros</em>.</>}
              intro="Cada versículo guarda una huella digital (SHA-256) de su texto. Antes de mostrarlo, la app la recalcula; si una sola letra cambió, lo descarta. Pruébalo aquí, en tu propio navegador."
            />
            <p className="text-sm leading-relaxed text-sanct-muted">
              Es la misma comprobación que hace la app cada vez que la abres. Si cambias una palabra, verás cómo la huella deja de coincidir.
            </p>
          </div>
          <VerifyVerse verse={verifyVerse} />
        </section>

        <div className="ornament" aria-hidden />

        {/* 04 · Compromiso */}
        <section id="compromiso" aria-labelledby="compromiso-title" className="mx-auto max-w-6xl scroll-mt-28 space-y-12 px-6 py-24">
          <SectionHeading id="compromiso-title" number="04" label="Nuestro compromiso" title={<>Lo que <em className="text-sanct-accent">prometemos</em>.</>} />
          <ul className="grid gap-5 sm:grid-cols-2">
            {PLEDGES.map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-5 rounded-3xl bg-sanct-surface p-8">
                <Icon size={26} strokeWidth={1.4} aria-hidden className="mt-1 shrink-0 text-sanct-accent" />
                <div className="space-y-2">
                  <h3 className="scripture text-2xl">{title}</h3>
                  <p className="leading-relaxed text-sanct-muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>

          <aside role="note" className="space-y-3 rounded-3xl border border-sanct-accent/50 p-8">
            <h3 className="scripture text-xl">Importante: tu bienestar primero</h3>
            <p className="leading-relaxed text-sanct-muted">
              Santuario no reemplaza a tu sacerdote, pastor, rabino o guía espiritual, ni a un profesional de la salud mental. Si estás pasando por un momento muy difícil, busca ayuda ahora:
            </p>
            <ul className="space-y-1 text-sm text-sanct-muted">
              {CRISIS_RESOURCES.selfHarm.lines.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <p className="text-xs text-sanct-muted">Verifica siempre el número vigente de tu país.</p>
          </aside>
        </section>

        <div className="ornament" aria-hidden />

        {/* 05 · Preguntas */}
        <section id="preguntas" aria-labelledby="preguntas-title" className="mx-auto max-w-3xl scroll-mt-28 space-y-10 px-6 py-24">
          <SectionHeading id="preguntas-title" number="05" label="Preguntas frecuentes" title={<>Lo que <em className="text-sanct-accent">suelen preguntar</em>.</>} />
          <div className="divide-y divide-sanct-border border-y border-sanct-border">
            {FAQ.map(({ q, a }) => (
              <details key={q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg">
                  <span className="scripture">{q}</span>
                  <span aria-hidden className="text-sanct-accent transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 leading-relaxed text-sanct-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Instalar */}
        <section id="instalar" aria-labelledby="instalar-title" className="mx-auto max-w-6xl scroll-mt-28 px-6 pb-24">
          <div className="space-y-6 rounded-3xl bg-sanct-surface p-8 sm:p-12">
            <h2 id="instalar-title" className="scripture flex items-center gap-3 text-3xl">
              <Smartphone size={26} strokeWidth={1.4} aria-hidden className="text-sanct-accent" /> Instálala como app
            </h2>
            <p className="max-w-2xl leading-relaxed text-sanct-muted">
              No necesitas una tienda de aplicaciones. Instalada, Santuario abre a pantalla completa y funciona sin conexión.
            </p>
            <ul className="grid gap-4 text-sm text-sanct-muted sm:grid-cols-3">
              <li><strong className="block font-medium text-sanct-text">Android (Chrome)</strong> Menú ⋮ → «Instalar app» o «Añadir a pantalla de inicio».</li>
              <li><strong className="block font-medium text-sanct-text">iPhone (Safari)</strong> Botón Compartir → «Añadir a pantalla de inicio».</li>
              <li><strong className="block font-medium text-sanct-text">Computador</strong> Ícono de instalar en la barra de direcciones de Chrome o Edge.</li>
            </ul>
            <InstallAppButton className={ghostBtn} />
          </div>
        </section>

        {/* Aporte (solo si está configurado) */}
        {offering && (
          <section aria-labelledby="aporte-title" className="mx-auto max-w-3xl space-y-5 px-6 pb-24 text-center">
            <h2 id="aporte-title" className="scripture text-3xl">Ayúdanos a mantenerla viva</h2>
            <p className="leading-relaxed text-sanct-muted">
              Santuario es libre para todos. Si te acompaña, tu aporte voluntario ayuda a sostener la plataforma y a sumar más pasajes verificados. Sin presión: cualquier monto, o ninguno, es bienvenido.
            </p>
            <OfferingSection />
          </section>
        )}

        {/* Llamado final */}
        <section className="relative overflow-hidden border-t border-sanct-border px-6 py-28 text-center">
          <div className="halo" aria-hidden />
          <div className="relative z-10 mx-auto max-w-2xl space-y-8">
            <h2 className="scripture text-4xl leading-tight sm:text-5xl">
              Ven y camina <em className="text-sanct-accent">con nosotros</em>.
            </h2>
            <p className="text-lg leading-relaxed text-sanct-muted">Tu versículo de hoy te está esperando.</p>
            <Link href="/santuario" className={primaryBtn}>
              Entrar al Santuario
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-sanct-border px-6 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          <div className="space-y-3">
            <p className="scripture text-2xl">Santuario</p>
            <p className="text-sm leading-relaxed text-sanct-muted">La Palabra, íntegra y verificada. Textos de dominio público: Reina-Valera 1909 y King James Version.</p>
          </div>
          <nav aria-label="Pie de página" className="space-y-2 text-sm">
            <p className="text-xs uppercase tracking-widest text-sanct-muted">Explorar</p>
            {NAV.map((l) => (
              <a key={l.href} href={l.href} className="block text-sanct-muted hover:text-sanct-text">{l.label}</a>
            ))}
            <Link href="/planes" className="block text-sanct-muted hover:text-sanct-text">Planes de lectura</Link>
            <Link href="/historias" className="block text-sanct-muted hover:text-sanct-text">Historias en 1 minuto</Link>
            <Link href="/versiculos/ansiedad" className="block text-sanct-muted hover:text-sanct-text">Versículos para la ansiedad</Link>
            <Link href="/versiculos/duelo" className="block text-sanct-muted hover:text-sanct-text">Versículos de consuelo</Link>
            <Link href="/santuario" className="block text-sanct-muted hover:text-sanct-text">Entrar al Santuario</Link>
          </nav>
          <nav aria-label="Legal" className="space-y-2 text-sm">
            <p className="text-xs uppercase tracking-widest text-sanct-muted">Legal</p>
            <Link href="/privacidad" className="block text-sanct-muted hover:text-sanct-text">Privacidad</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
