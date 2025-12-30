"use server";

import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function submitAvailability(formData: FormData) {
  const eventId = String(formData.get("event_id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const dates = formData.getAll("dates").map(String);

  if (!eventId || !name || dates.length === 0) {
    redirect("/?error=1");
  }

  const { error } = await supabase.from("responses").insert({
    event_id: eventId,
    guest_name: name,
    available_dates: dates,
  });

  if (error) {
    redirect("/?error=1");
  }

  redirect(`/?sent=1&name=${encodeURIComponent(name)}`);
}
