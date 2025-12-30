"use client";

import { useState } from "react";

type CopyResultsButtonProps = {
  text: string;
};

export default function CopyResultsButton({ text }: CopyResultsButtonProps) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text || "");
      setStatus("copied");
      window.setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      window.setTimeout(() => setStatus("idle"), 2000);
    }
  };

  const label =
    status === "copied"
      ? "Copiado"
      : status === "error"
      ? "Error al copiar"
      : "Copiar resultados";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-2xl border border-neutral-700 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-neutral-200 transition hover:border-amber-300 hover:text-amber-200"
    >
      {label}
    </button>
  );
}
