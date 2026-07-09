import type { Metadata } from "next";
import "./globals.css";
import "reactflow/dist/style.css";

export const metadata: Metadata = {
  title: "Goliath | VC research, assembled on demand",
  description:
    "Ask a VC research question and watch Goliath assemble a tailored team of AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Light mode only: no `.dark` class on <html>. `workspace-root` + `font-body`
  // match Sim's workspace typography.
  return (
    <html lang="en" className="h-full">
      <body className="workspace-root font-body antialiased h-full bg-[var(--surface-1)] text-[var(--text-primary)]">
        {children}
      </body>
    </html>
  );
}
