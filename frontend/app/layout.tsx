import type { Metadata } from "next";
import { Globe } from "lucide-react";
import { ThemeProvider } from "./components/ThemeProvider";
import ThemeToggle from "./components/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Réseau Social",
  description: "Posts & Commentaires - Projet CRUD Groupe B",
};

const themeInitScript = `
(function () {
  try {
    var theme = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (theme === 'dark' || (!theme && prefersDark)) {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <header className="sticky top-0 z-50 bg-primary text-white py-4 shadow-md">
            <div className="max-w-2xl mx-auto px-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 text-xl font-bold">
                <Globe className="w-6 h-6" />
                Mini Réseau Social
              </a>
              <ThemeToggle />
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-4 py-6 pb-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
