import type { ReactNode } from "react";

import "./globals.css";

import AuthGuard from "./components/AuthGuard";

export const metadata = {
  title: "Mechabook — Mechanical Keyboard Community",
  description:
    "A community platform for mechanical keyboard enthusiasts.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}