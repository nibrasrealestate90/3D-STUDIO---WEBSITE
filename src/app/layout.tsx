import type { Metadata } from 'next';
import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsAppButton } from '@/components/ui/WhatsAppButton';
import { QuickViewModal } from '@/components/product/QuickViewModal';
import { EnquiryModal } from '@/components/product/EnquiryModal';
import { ToastContainer } from '@/components/ui/ToastContainer';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://printstudio.ae';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: '3D Studio — Custom 3D Printed Creations in Dubai',
  description:
    'Discover thoughtfully designed 3D printed home decor, personalized gifts, desk accessories, and custom 3D printing services in Dubai, UAE.',
  icons: {
    icon: '/assets/aistudio/image_2d82fc9e.png',
    apple: '/assets/aistudio/image_2d82fc9e.png',
  },
  openGraph: {
    title: '3D Studio — Custom 3D Printed Creations in Dubai',
    description:
      'Discover thoughtfully designed 3D printed home decor, personalized gifts, desk accessories, and custom 3D printing in Dubai.',
    url: siteUrl,
    siteName: '3D Studio Dubai',
    locale: 'en_AE',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window === 'undefined') return;
                function isExtensionError(err, filename) {
                  if (filename && (filename.indexOf('chrome-extension://') !== -1 || filename.indexOf('moz-extension://') !== -1)) return true;
                  var stack = (err && err.stack) ? String(err.stack) : (err ? String(err) : '');
                  return stack.indexOf('chrome-extension://') !== -1 || stack.indexOf('moz-extension://') !== -1;
                }
                window.addEventListener('error', function(e) {
                  if (isExtensionError(e.error, e.filename)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
                window.addEventListener('unhandledrejection', function(e) {
                  var reason = e.reason;
                  var filename = reason && (reason.fileName || reason.filename);
                  if (isExtensionError(reason, filename)) {
                    e.stopImmediatePropagation();
                    e.preventDefault();
                  }
                }, true);
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Outfit:wght@500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FCF2EC] text-[#0D1B35] antialiased selection:bg-[#F45A00] selection:text-white">
        <StoreProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsAppButton />
          <QuickViewModal />
          <EnquiryModal />
          <ToastContainer />
        </StoreProvider>
      </body>
    </html>
  );
}
