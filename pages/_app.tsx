// pages/_app.tsx
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {

    const checkSessionAndRedirect = async () => {
      const {
        data: {session},
      } = await supabaseClient.auth.getSession();

      if (session?.user) {
        router.replace('/dashboard');
      }
    }

    checkSessionAndRedirect();

    // v2 style: onAuthStateChange returns { data: { subscription } }
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (!_event) return;

      switch (_event) {
        case 'SIGNED_IN':
          router.replace('/dashboard');
          break;
        case 'SIGNED_OUT':
          router.replace('/auth/signin');
          break;
        case 'PASSWORD_RECOVERY':
          router.replace('/reset-password');
          break;
        default:
          break;
      }
    });

    // Cleanup on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return (
      <>
        <Navbar />
        <main className="container mx-auto p-4">
          <Component {...pageProps} />
        </main>
      </>
  );
}

export default MyApp;
