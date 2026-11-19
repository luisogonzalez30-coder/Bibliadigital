import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacidad · Santuario Bíblico",
  description: "Qué guarda Santuario Bíblico, dónde y por qué. Explicado con claridad.",
};

const SECTIONS: ReadonlyArray<{ title: string; body: string[] }> = [
  {
    title: "Lo esencial",
    body: [
      "Santuario Bíblico funciona en tu dispositivo y no te exige crear una cuenta. No usamos publicidad ni cookies de seguimiento. Medimos las visitas con estadísticas agregadas y sin cookies (Vercel Web Analytics), que no identifican a las personas ni las siguen entre sitios.",
    ],
  },
  {
    title: "Estadísticas anónimas de uso",
    body: [
      "Para saber cuánta gente usa Santuario Bíblico, la app registra tres eventos: abrir la app (una vez al día), instalarla y leer un capítulo. Cada evento lleva un código aleatorio generado en tu dispositivo, la ruta de la página y si la abriste como app instalada. Si llegaste desde un enlace con etiquetas de campaña (por ejemplo, de qué video vienes), esa etiqueta se guarda en tu dispositivo y viaja con esos eventos. No incluye tu nombre, tu correo, tu IP ni lo que escribes.",
      "Puedes desactivarlo en Ajustes («Ayudar a mejorar Santuario Bíblico») o con la opción «No rastrear» de tu navegador; al desactivarlo se borra ese código. Los eventos se guardan en Supabase.",
    ],
  },
  {
    title: "Tu fe y tu nombre",
    body: [
      "Al abrir la app te preguntamos con qué fe quieres leer, cómo te llamas y qué te trae hoy, solo para mostrarte los textos de tu tradición y saludarte. Son datos sensibles y por eso se guardan únicamente en tu dispositivo: no los enviamos a ningún servidor ni forman parte de las estadísticas anónimas.",
      "Si inicias sesión con tu correo, tu tradición se respalda junto a tu racha y tus favoritos; tu nombre y lo que elegiste que te trae hoy no. Puedes cambiar o repetir estas respuestas en Ajustes.",
    ],
  },
  {
    title: "Qué se guarda en tu dispositivo",
    body: [
      "Tu tradición, el idioma espejo, el modo día o noche, tu Racha de Luz, tus versículos favoritos y, si haces un aporte, el último monto que elegiste. Se guarda en el almacenamiento local de tu navegador y puedes borrarlo en cualquier momento desde los ajustes del sitio de tu navegador.",
      "La app instalada guarda además una copia de sus archivos para funcionar sin conexión.",
    ],
  },
  {
    title: "Respaldo opcional con tu correo",
    body: [
      "Si decides iniciar sesión con un enlace enviado a tu correo, guardamos en un servicio de base de datos (Supabase) tu correo, tu tradición, tu racha y tus favoritos, para que no los pierdas al cambiar de dispositivo. Es totalmente opcional. Quien administra Santuario Bíblico puede ver, en un panel protegido, el correo, la fecha de registro y la racha de las cuentas para entender cuánta gente lee cada día.",
      "Cerrar sesión no borra esos datos de la nube. Aún no hay un botón para eliminar tu cuenta desde la app; está pendiente en nuestra lista de trabajo.",
    ],
  },
  {
    title: "«Describe tu problema»",
    body: [
      "El texto que escribes se analiza en tu dispositivo y no se guarda ni se envía a ningún servidor nuestro.",
      "Si usas el dictado por voz, el audio lo procesa el servicio de reconocimiento de voz de tu navegador (en Chrome, por ejemplo, lo realiza un servicio de Google). Santuario Bíblico no recibe ni almacena ese audio.",
    ],
  },
  {
    title: "Búsqueda en la Biblia",
    body: [
      "Para encontrar resultados, la palabra o frase que buscas se envía a nuestro servidor, que responde y no la guarda. Leer los capítulos no requiere enviar nada.",
    ],
  },
  {
    title: "Aporte voluntario",
    body: [
      "El botón de aporte te lleva a un medio de pago externo en una pestaña nueva. Santuario Bíblico no procesa pagos ni ve ni guarda datos de tu tarjeta.",
    ],
  },
  {
    title: "Alojamiento",
    body: [
      "La página se sirve desde un proveedor de alojamiento (Vercel), que puede registrar datos técnicos de las solicitudes, como la dirección IP, por razones de seguridad y funcionamiento.",
    ],
  },
  {
    title: "Planes de lectura y recordatorio",
    body: [
      "El progreso de tus planes se guarda solo en tu dispositivo. El recordatorio diario es un evento de calendario que descargas: lo gestiona tu propio calendario y Santuario Bíblico no recibe ni guarda tu hora.",
    ],
  },
  {
    title: "Esto es informativo",
    body: [
      "Esta página describe cómo funciona Santuario Bíblico hoy. No constituye asesoría legal y puede actualizarse cuando la app cambie.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl space-y-12 px-6 py-16 text-sanct-text">
      <header className="space-y-4">
        <Link href="/" className="text-sm text-sanct-muted hover:text-sanct-text">
          ← Volver al inicio
        </Link>
        <h1 className="scripture text-5xl leading-tight">Privacidad</h1>
        <p className="text-sm text-sanct-muted">Última actualización: 19 de noviembre de 2026</p>
      </header>
      {SECTIONS.map((s) => (
        <section key={s.title} className="space-y-3">
          <h2 className="scripture text-2xl">{s.title}</h2>
          {s.body.map((p) => (
            <p key={p} className="leading-relaxed text-sanct-muted">
              {p}
            </p>
          ))}
        </section>
      ))}
    </main>
  );
}
