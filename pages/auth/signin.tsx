// pages/auth/signin.tsx
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { supabaseClient } from '../../lib/supabaseClient';

export default function SignInPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    /**
     * Handle email/password sign-in
     */
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsLoading(true);

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                setErrorMsg(error.message);
                setIsLoading(false);
                return;
            }

            if (data.session) {
                // If signInWithPassword succeeded, redirect to dashboard
                router.replace('/dashboard');
            }
        } catch (err: any) {
            setErrorMsg(err.message || 'Unexpected error');
            setIsLoading(false);
        }
    };

    /**
     * Handle social login (OAuth) for Google, GitHub, Twitter, Microsoft
     */
    const handleSocialLogin = async (provider: 'google' | 'github' | 'twitter' | 'azure') => {
        setErrorMsg(null);

        try {
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider,
                options: {
                    // After OAuth provider completes, Supabase will redirect back to this URL:
                    redirectTo: window.location.origin + '/auth/callback',
                },
            });

            if (error) {
                // If something failed with initiating the OAuth flow
                setErrorMsg(error.message);
            }
            // On success, the browser will navigate away to the provider’s login page,
            // then back to /auth/callback, so no immediate front-end redirect happens here.
        } catch (err: any) {
            setErrorMsg(err.message || 'OAuth login error');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '480px', margin: '2rem auto' }}>
            <div className="section">
                <h2 className="mb-4">Sign In</h2>
                {errorMsg && <p className="text-error">{errorMsg}</p>}

                {/* -------------------------------
            1) Email/Password Sign In Form
         ------------------------------- */}
                <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block font-medium mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="your@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block font-medium mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-signin"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in…' : 'Sign In'}
                    </button>
                </form>

                {/* -------------------------------
            2) Link to Sign Up Page
         ------------------------------- */}
                <p className="mt-4">
                    Don’t have an account?{' '}
                    <Link href="/auth/signup" className="text-blue-600 hover:underline">
                        Create one
                    </Link>
                </p>

                {/* -------------------------------
            3) OAuth (Social) Login Buttons
         ------------------------------- */}
                <div className="mt-6">
                    <p className="mb-2 oauth-divider">— Or sign in with —</p>
                    <div className="oauth-buttons">
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('google')}
                            className="btn btn-social btn-google"
                        >
                            GOOGLE
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('github')}
                            className="btn btn-social btn-github"
                        >
                            GITHUB
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('twitter')}
                            className="btn btn-social btn-twitter"
                        >
                            TWITTER
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSocialLogin('azure')}
                            className="btn btn-social btn-azure"
                        >
                            MICROSOFT
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
