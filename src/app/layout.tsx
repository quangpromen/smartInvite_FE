import type { Metadata } from 'next';
import './globals.css';
import { MockStoreProvider } from '@/mocks/mock-store';

export const metadata: Metadata = {
  title: 'SmartInvite — Nền tảng thiệp cưới & sự kiện Event-first',
  description: 'Quản lý sự kiện, nhiều mẫu thiệp và khách mời cá nhân hóa',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <MockStoreProvider>{children}</MockStoreProvider>
      </body>
    </html>
  );
}
