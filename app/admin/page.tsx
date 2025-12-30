import { createSupabaseServerClient } from "@/lib/supabase/server";
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

export default async function Admin({ searchParams }: PageProps) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return (
      <main>
        <h1>Admin</h1>
        <p>Acceso solo por magic link.</p>

        {searchParams?.sent && (
          <div className="notice">Revisa tu correo para entrar.</div>
        )}
        {searchParams?.error && (
          <div className="notice">No se pudo enviar el link.</div>
        )}

        <form action={sendMagicLink}>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required />
          <button type="submit">Enviar link</button>
        </form>
      </main>
    );
  }

  if (!isAllowedAdmin(session.user.email)) {
    return (
      <main>
        <h1>Sin acceso</h1>
        <p>Este email no esta autorizado.</p>
        <form action={signOut}>
          <button type="submit">Salir</button>
        </form>
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
        .select("guest_name, available_dates, created_at")
        .eq("event_id", event.id)
        .order("created_at", { ascending: true })
    : { data: [] as { guest_name: string; available_dates: string[] }[] };

  const availability = (dates || []).map((d) => {
    const total = (responses || []).filter((r) =>
      r.available_dates?.includes(d.date_value)
    ).length;

    return { date: d.date_value, total };
  });

  return (
    <main>
      <h1>Admin</h1>
      <p>{event?.title ?? "Evento pendiente"}</p>

      <form action={signOut}>
        <button type="submit">Salir</button>
      </form>

      <h2>Disponibilidad por fecha</h2>
      <div className="grid">
        {availability.length ? (
          availability.map((item) => (
            <div className="card" key={item.date}>
              <strong>{item.date}</strong>
              <div>{item.total} disponible(s)</div>
            </div>
          ))
        ) : (
          <small>No hay fechas configuradas.</small>
        )}
      </div>

      <h2>Invitados</h2>
      {responses?.length ? (
        <div className="grid">
          {responses.map((r) => (
            <div className="card" key={`${r.guest_name}-${r.created_at}`}>
              <strong>{r.guest_name}</strong>
              <div>{r.available_dates.join(", ")}</div>
            </div>
          ))}
        </div>
      ) : (
        <small>Aun no hay respuestas.</small>
      )}
    </main>
  );
}
