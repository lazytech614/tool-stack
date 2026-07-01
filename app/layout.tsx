import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tool-stack-kappa.vercel.app/"),

  title: {
    default: "Tool Stack",
    template: "%s | Tool Stack",
  },

  description:
    "Free developer tools for formatting, debugging, generating, validating, converting and optimizing code. Built for developers, engineers and open-source contributors.",

  applicationName: "Tool Stack",

  keywords: [
    "developer tools",
    "online tools",
    "json formatter",
    "sql formatter",
    "jwt debugger",
    "regex tester",
    "commit generator",
    "markdown preview",
    "base64 encoder",
    "url encoder",
    "developer utilities",
    "frontend tools",
    "backend tools",
    "tool stack",
    "opensource tools",
  ],

  authors: [
    {
      name: "Tool Stack",
      url: "https://tool-stack-kappa.vercel.app/",
    },
  ],

  creator: "Tool Stack",
  publisher: "Tool Stack",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Tool Stack",
    description:
      "A collection of modern developer tools to boost productivity and simplify development workflows.",

    url: "https://tool-stack-kappa.vercel.app/",
    siteName: "Tool Stack",

    locale: "en_US",

    type: "website",

    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Tool Stack",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Tool Stack",
    description:
      "Free developer tools for formatting, debugging, generating, validating and optimizing code.",

    images: ["/og-image.png"],

    creator: "@yourhandle",
  },

  category: "technology",

  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },

  other: {
    "theme-color": "#9333EA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-black dark:text-white">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Navbar />

          <main className="flex-1">{children}</main>

          <Footer />

          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
