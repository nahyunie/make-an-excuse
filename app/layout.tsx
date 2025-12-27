import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI 변명 생성기',
  description: '상황에 맞는 완벽한 변명을 AI가 만들어드립니다',
};

export default function RootLayout({children}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
    <body>{children}</body>
    </html>
  );
}
