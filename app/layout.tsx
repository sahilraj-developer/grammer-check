import type React from "react"
import type { Metadata } from "next"
import { Inter, Work_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth/auth-provider"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
})

export const metadata: Metadata = {
  title: "GrammarPro - Advanced AI Grammar Correction Assistant",
  description:
    "Professional grammar correction tool powered by AI. Fix grammar, spelling, punctuation, and improve your writing instantly. Free online grammar checker similar to Grammarly.",
  keywords:
    "grammar checker, spelling checker, writing assistant, AI grammar correction, punctuation checker, writing improvement, proofreading tool",
  authors: [{ name: "GrammarPro Team" }],
  creator: "GrammarPro",
  publisher: "GrammarPro",
  robots: "index, follow",
  openGraph: {
    title: "GrammarPro - Advanced AI Grammar Correction Assistant",
    description:
      "Professional grammar correction tool powered by AI. Fix grammar, spelling, punctuation, and improve your writing instantly.",
    type: "website",
    locale: "en_US",
    siteName: "GrammarPro",
  },
  twitter: {
    card: "summary_large_image",
    title: "GrammarPro - Advanced AI Grammar Correction Assistant",
    description:
      "Professional grammar correction tool powered by AI. Fix grammar, spelling, punctuation, and improve your writing instantly.",
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#15803d",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${workSans.variable} antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href="https://your-domain.com" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>{children}</AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
