import { generateMetadata } from '@/lib/metadata';
export const dynamic = 'force-dynamic';
import { generateOrganizationSchema } from '@/lib/schemas';
import { Manrope, Plus_Jakarta_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import RollbarProvider from '@/components/providers/rollbar-provider';
import { AuthProvider } from '@/components/providers/auth-provider';
import { WebVitalsProvider } from '@/components/providers/web-vitals-provider';
import { BrowserLogCollectorProvider } from '@/components/providers/browser-log-collector-provider';
import { AnalyticsProvider } from '@/components/providers/analytics-provider';
import { KeyboardShortcutsProvider } from '@/components/providers/keyboard-shortcuts-provider';
import { Toaster } from 'sonner';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

export const metadata = generateMetadata({
  title: 'SafeSpace - Mental Health Support Platform',
  description: 'Connect with therapists for mental health support, life coaching, and personal growth. Find your safe space today.',
  path: '/',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const orgSchema = generateOrganizationSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://pqjwldzyogmdangllnlr.supabase.co" />
        <link rel="dns-prefetch" href="https://pqjwldzyogmdangllnlr.supabase.co" />
        <link rel="preconnect" href="https://api.razorpay.com" />
        <link rel="dns-prefetch" href="https://api.razorpay.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(orgSchema).replace(/</g, '\\u003c'),
          }}
        />
      </head>
      <body
        className={`${manrope.variable} ${plusJakarta.variable} font-primary antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <RollbarProvider>
              <WebVitalsProvider>
                <BrowserLogCollectorProvider>
                  <AnalyticsProvider>
                    <KeyboardShortcutsProvider>
                      <ErrorBoundary>
                        {children}
                        <Toaster richColors position="top-right" />
                      </ErrorBoundary>
                    </KeyboardShortcutsProvider>
                  </AnalyticsProvider>
                </BrowserLogCollectorProvider>
              </WebVitalsProvider>
            </RollbarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
