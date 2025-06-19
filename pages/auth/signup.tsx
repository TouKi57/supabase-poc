// pages/auth/signup.tsx
import React, { useState } from 'react';
import Link from 'next/link';
import { supabaseClient } from '../../lib/supabaseClient';

export default function SignUpPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string|null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);
        setIsSubmitting(true);

        // Only call Supabase Auth — no profiles table anymore
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: {
                // include any user_metadata here if desired,
                // but no server‐side profile row is created
            }
        });

        if (error) {
            setErrorMsg(error.message);
            setIsSubmitting(false);
            return;
        }

        // Supabase has sent confirmation email; show notice
        setEmailSent(true);
        setIsSubmitting(false);
    };

    if (emailSent) {
        return (
            <div className="container mx-auto p-6 max-w-md">
                <div className="section">
                    <h2 className="text-xl font-semibold mb-4">Check Your Email</h2>
                    <p>
                        We’ve sent a confirmation link to <strong>{email}</strong>. Please
                        follow that link to activate your account.
                    </p>
                    <p className="mt-4">
                        Back to{' '}
                        <Link href="/auth/signin" className="text-blue-600 hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-md">
            <div className="section">
                <h2 className="text-xl font-semibold mb-4">Sign Up</h2>
                {errorMsg && <p className="text-red-600 mb-2">{errorMsg}</p>}
                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="block mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full p-2 border rounded"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1">Password</label>
                        <input
                            type="password"
                            className="w-full p-2 border rounded"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn btn-signin"
                    >
                        {isSubmitting ? 'Signing up…' : 'Create Account'}
                    </button>
                </form>
                <p className="mt-4">
                    Already have an account?{' '}
                    <Link href="/auth/signin" className="text-blue-600 hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
