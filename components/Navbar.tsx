import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { supabaseClient } from '../lib/supabaseClient';

export default function Navbar() {
    const router = useRouter();

    // We'll track a minimal “user” state just to know if a session exists.
    const [user, setUser] = useState<{ id: string; email: string } | null>(null);


    // On mount, check if there’s already a Supabase session.
    useEffect(() => {
        supabaseClient.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ? { id: session.user.id, email: session.user.email! } : null);
        });
        const { subscription } = supabaseClient.auth.onAuthStateChange((_e, s) => {
            setUser(s?.user ? { id: s.user.id, email: s.user.email! } : null);
        }).data;
        return () => subscription.unsubscribe();
    }, []);

    const handleSignOut = async () => {
        await supabaseClient.auth.signOut();
        router.replace('/auth/signin');
    };

    return (
        <header className="navbar">
            <div className="navbar-left">
                {/* Brand Link (always visible) */}
                <div className="navbar-brand">
                    Supabase POC
                </div>

                {/* Only show “Dashboard” / “Admin Panel” if there's a logged-in user */}
                {user && (
                    <>
                        <Link href="/dashboard" className="navbar-link">
                            Dashboard
                        </Link>
                    </>
                )}
            </div>

            <div className="navbar-right">
                {/* If there is a session (user ≠ null), show profile + Sign Out */}
                {user && (
                    <div className="navbar-profile">
                        <span className="username">
              {user.email}
            </span>
                        <button onClick={handleSignOut} className="btn btn-signout">
                            Sign Out
                        </button>
                    </div>
                )}
            </div>
        </header>
    );
}
