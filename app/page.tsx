import { createClient } from "@supabase/supabase-js";
import AvailabilityForm from "./AvailabilityForm";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

type PageProps = {
  searchParams?: { sent?: string; error?: string; name?: string };
};

function decodeName(value?: string) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function Home({ searchParams }: PageProps) {
  const { data: events } = await supabase
    .from("events")
    .select("id, title, description")
    .order("created_at", { ascending: true })
    .limit(1);

  const event = events?.[0];

  const { data: dates } = event
    ? await supabase
        .from("event_dates")
        .select("date_value")
        .eq("event_id", event.id)
        .order("date_value", { ascending: true })
    : { data: [] as { date_value: string }[] };

  if (!event) {
    return (
      <main className="min-h-screen bg-sand px-4 py-10">
        <section className="mx-auto max-w-xl rounded-3xl border border-sand-200 bg-white/80 p-8 shadow-lg">
          <h1 className="text-2xl font-semibold text-ink-900">
            Evento pendiente
          </h1>
          <p className="mt-2 text-sm text-ink-600">
            Configura el evento y sus fechas en Supabase antes de compartir este
            link.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10">
      <AvailabilityForm
        eventId={event.id}
        title={event.title}
        description={event.description ?? ""}
        dates={dates?.map((d) => d.date_value) ?? []}
        status={{
          sent: !!searchParams?.sent,
          error: !!searchParams?.error,
          name: decodeName(searchParams?.name),
        }}
      />
    </main>
  );
}
