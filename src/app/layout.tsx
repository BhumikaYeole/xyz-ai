import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";


export const metadata: Metadata = {
  title: "XYZ AI · School ERP Assistant",
  description: "A human-like AI school assistant for students, parents, teachers, and management.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={` h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
