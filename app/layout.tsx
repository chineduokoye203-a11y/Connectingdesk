import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Connectdesk | Customer Support Outsourcing Platform",
  description: "AI-assisted multi-tenant Customer Support Outsourcing platform for First Connect Edge.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
