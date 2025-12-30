import { createSupabaseServerClient } from "@/lib/supabase/server";
import CopyResultsButton from "./CopyResultsButton";
import { sendMagicLink, signOut } from "./actions";

function isAllowedAdmin(email?: string | null) {
  const list = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return !!email && list.includes(email);
}

type PageProps = {
  searchParams?: { sent?: string; error?: string };
};

type ResponseRow = {
  id: string;
  guest_name: string;
  available_dates: string[];
  created_at: string;
};

export default async function Admin({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-200">
        <section className="mx-auto max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Acceso solo por magic link.
          </p>

          {searchParams?.sent && (
            <div className="mt-4 rounded-2xl border border-amber-300/60 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Revisa tu correo para entrar.
            </div>
          )}
          {searchParams?.error && (
            <div className="mt-4 rounded-2xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              No se pudo enviar el link.
            </div>
          )}

          <form action={sendMagicLink} className="mt-6 space-y-3">
            <label className="text-sm font-semibold" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 text-base text-neutral-100 focus:border-amber-300 focus:outline-none"
            />
            <button
              type="submit"
              className="w-full rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Enviar link
            </button>
          </form>
        </section>
      </main>
    );
  }

  if (!isAllowedAdmin(session.user.email)) {
    return (
      <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-200">
        <section className="mx-auto max-w-xl rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8">
          <h1 className="text-2xl font-semibold">Sin acceso</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Este email no esta autorizado.
          </p>
          <form action={signOut} className="mt-6">
            <button
              type="submit"
              className="w-full rounded-2xl bg-neutral-50 px-4 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
            >
              Salir
            </button>
          </form>
        </section>
      </main>
    );
  }

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

  const { data: responses } = event
    ? await supabase
        .from("responses")
        .select("id, guest_name, available_dates, created_at")
        .eq("event_id", event.id)
        .order("created_at", { ascending: true })
    : { data: [] as ResponseRow[] };

  const availability = (dates || []).map((d) => {
    const guests =
      responses?.filter((r) => r.available_dates?.includes(d.date_value)) ??
      [];
    return { date: d.date_value, guests, total: guests.length };
  });

  const winner = availability.reduce(
    (current, item) => (item.total > current.total ? item : current),
    { date: "", guests: [] as ResponseRow[], total: -1 }
  );

  const resultsText = availability
    .map(
      (item) =>
        `${item.date} - ${item.total} votos - ${item.guests
          .map((guest) => guest.guest_name)
          .join(", ")}`
    )
    .join("\n");

  return (
    <main className="min-h-screen bg-neutral-950 px-4 py-10 text-neutral-200">
      <section className="mx-auto max-w-4xl space-y-8">
        <header className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
                Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-neutral-50">
                {event?.title ?? "Live Session"}
              </h1>
              <p className="mt-2 text-sm text-neutral-400">
                {event?.description ?? "Panel de disponibilidad."}
              </p>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-2xl border border-neutral-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-200 transition hover:border-amber-300 hover:text-amber-200"
              >
                Salir
              </button>
            </form>
          </div>

          {winner.total > 0 && (
            <div className="mt-6 rounded-2xl border border-amber-400/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              Dia ganador: <span className="font-semibold">{winner.date}</span>{" "}
              con {winner.total} voto(s).
            </div>
          )}
        </header>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/70 p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-neutral-100">
              Resultados por fecha
            </h2>
            <CopyResultsButton text={resultsText} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {availability.length ? (
              availability.map((item) => {
                const isWinner = item.date === winner.date;
                return (
                  <div
                    key={item.date}
                    className={`rounded-2xl border px-4 py-4 ${
                      isWinner
                        ? "border-amber-400/70 bg-amber-500/10 text-amber-100"
                        : "border-neutral-800 bg-neutral-950/40 text-neutral-200"
                    }`}
                  >
                    <div className="flex items-center justify-between text-sm font-semibold">
                      <span>{item.date}</span>
                      <span>{item.total} voto(s)</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm">
                      {item.guests.length ? (
                        item.guests.map((guest) => (
                          <div
                            key={guest.id}
                            className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2 text-neutral-200"
                          >
                            {guest.guest_name}
                          </div>
                        ))
                      ) : (
                        <p className="text-neutral-500">
                          Sin confirmaciones.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-6 text-sm text-neutral-500">
                No hay fechas configuradas.
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
