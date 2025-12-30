"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useFormStatus } from "react-dom";
import { submitAvailability } from "./actions";

type AvailabilityFormProps = {
  eventId: string;
  title: string;
  description: string;
  dates: string[];
  status: { sent: boolean; error: boolean; name: string };
};

const weekdayFormatter = new Intl.DateTimeFormat("es-ES", {
  weekday: "short",
});
const dayFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
});

function formatDateParts(value: string) {
  const date = new Date(`${value}T12:00:00`);
  return {
    weekday: weekdayFormatter.format(date),
    day: dayFormatter.format(date),
  };
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-6 w-6 text-amber-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-amber-300"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 2.5 18a2 2 0 0 0 1.7 3h15.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5 text-amber-200"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="w-full rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
    >
      {pending ? "Enviando..." : "Enviar disponibilidad"}
    </button>
  );
}

export default function AvailabilityForm({
  eventId,
  title,
  description,
  dates,
  status,
}: AvailabilityFormProps) {
  const [step, setStep] = useState<"name" | "dates">("name");
  const [name, setName] = useState("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const sortedDates = useMemo(
    () => [...dates].sort((a, b) => a.localeCompare(b)),
    [dates]
  );

  const canContinue = name.trim().length > 1;
  const canSubmit = selectedDates.length > 0;
  const isLoadingDates = sortedDates.length === 0;

  const toggleDate = (value: string) => {
    setSelectedDates((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  return (
    <section className="mx-auto max-w-3xl">
      <div className="rounded-[32px] border border-neutral-800 bg-neutral-950/80 p-6 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur sm:p-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            Live Session
          </p>
          <h1 className="text-3xl font-semibold text-neutral-50 sm:text-4xl">
            {title}
          </h1>
          <p className="text-sm text-neutral-400">
            {description || "Sesion en cochera. Coordinemos logistica."}
          </p>
        </header>

        {status.sent && (
          <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Listo {status.name || "musico"}! Gracias por confirmar.
          </div>
        )}

        {status.error && (
          <div className="mt-6 rounded-2xl border border-rose-400/60 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            No se pudo enviar. Revisa los datos e intenta de nuevo.
          </div>
        )}

        <div className="mt-8">
          <AnimatePresence mode="wait">
            {step === "name" ? (
              <motion.div
                key="step-name"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="text-lg font-semibold text-neutral-100">
                  Live Session: Logistica
                </h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Escribe tu nombre para desbloquear las fechas.
                </p>

                <div className="mt-6 space-y-4">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Tu nombre"
                    className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/70 px-5 py-4 text-lg text-neutral-50 shadow-sm focus:border-amber-300 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setStep("dates")}
                    disabled={!canContinue}
                    className="w-full rounded-2xl bg-neutral-50 px-5 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:bg-neutral-800 disabled:text-neutral-500"
                  >
                    Ver fechas
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="step-dates"
                action={submitAvailability}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -14 }}
                transition={{ duration: 0.35 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-neutral-100">
                    Elige fechas disponibles
                  </h2>
                  <button
                    type="button"
                    onClick={() => setStep("name")}
                    className="text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-neutral-200"
                  >
                    Editar nombre
                  </button>
                </div>

                <div className="rounded-2xl border border-amber-300/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                  <div className="flex items-start gap-3">
                    <SunIcon />
                    <div className="space-y-1">
                      <p className="font-semibold">Aviso importante</p>
                      <p className="text-amber-100/90">
                        Grabamos con luz natural. Confirma disponibilidad de DIA
                        (Manana/Tarde).
                      </p>
                    </div>
                    <div className="ml-auto">
                      <AlertIcon />
                    </div>
                  </div>
                </div>

                {isLoadingDates ? (
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 text-sm text-neutral-400">
                    Cargando fechas...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {sortedDates.map((date) => {
                      const parts = formatDateParts(date);
                      const isSelected = selectedDates.includes(date);

                      return (
                        <button
                          key={date}
                          type="button"
                          onClick={() => toggleDate(date)}
                          className={`relative flex flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-5 text-center text-sm font-semibold transition ${
                            isSelected
                              ? "border-amber-300 bg-amber-400/20 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.35)]"
                              : "border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-amber-300/60 hover:text-neutral-100"
                          }`}
                        >
                          <span className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                            {parts.weekday}
                          </span>
                          <span className="text-3xl font-semibold">
                            {parts.day}
                          </span>
                          {isSelected && (
                            <span className="absolute right-3 top-3">
                              <CheckIcon />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-neutral-400">
                  <span>{selectedDates.length} fecha(s) seleccionadas</span>
                  <button
                    type="button"
                    onClick={() => setSelectedDates([])}
                    className="text-xs font-semibold uppercase tracking-wide text-neutral-500 hover:text-neutral-200"
                  >
                    Limpiar
                  </button>
                </div>

                <input type="hidden" name="event_id" value={eventId} />
                <input type="hidden" name="name" value={name} />
                {selectedDates.map((date) => (
                  <input key={date} type="hidden" name="dates" value={date} />
                ))}

                <SubmitButton disabled={!canSubmit || isLoadingDates} />
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
