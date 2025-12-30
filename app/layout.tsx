import "./globals.css";

export const metadata = {
  title: "Disponibilidad de musicos",
  description: "Confirma disponibilidad para una grabacion puntual.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
