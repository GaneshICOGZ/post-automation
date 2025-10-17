import { Inter, Playfair_Display, PT_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });
const ptsans = PT_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-pt-sans'
});

export const metadata = {
  title: 'Post Automation Platform',
  description: 'AI-powered content generation and multi-platform publishing',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${ptsans.variable} min-h-screen gradient-bg`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
