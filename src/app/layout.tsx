import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: {
    default: 'LifeOS',
    template: '%s | LifeOS',
  },
  description: 'Tu sistema operativo personal para nutrición, fitness y productividad',
  manifest: '/manifest.json',
  
  appleWebApp: {
    capable: true,
    // Note: Next.js handles mobile-web-app-capable meta tag
    statusBarStyle: 'black-translucent',
    title: 'LifeOS',
  },
  
  formatDetection: {
    telephone: false,
  },
  
  openGraph: {
    type: 'website',
    siteName: 'LifeOS',
    title: 'LifeOS - Tu Sistema Operativo Personal',
    description: 'Organiza tu nutrición, fitness y productividad con IA',
  },
  
  icons: {
    icon: [
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icons/icon-192x192.png',
  },
  
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-background`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
