// pages/projects/join/[token].tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../../../lib/supabaseClient';

export default function JoinProject() {
    const router = useRouter();
    const { token } = router.query;                // e.g. '13324b1b-23f7-46e4-81cb-9d6ba3758978'
    const [error, setError] = useState<string|null>(null);

    useEffect(() => {
        if (!token) return; // wait for token from router

        (async () => {
            try {
                // 1) Get current session to extract the access token
                const { data: { session } } = await supabaseClient.auth.getSession();
                if (!session?.access_token) throw new Error('Not signed in');

                // 2) Call the join-invite API endpoint
                const res = await fetch(`/api/projects/join/${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });

                // 3) Parse JSON and handle errors
                const text = await res.text();
                let payload: any;
                try {
                    payload = JSON.parse(text);
                } catch {
                    throw new Error('Unexpected server response');
                }
                if (!res.ok) {
                    throw new Error(payload.error || 'Failed to join project');
                }

                // 4) On success, redirect to dashboard
                router.replace('/dashboard');
            } catch (err: any) {
                setError(err.message);
            }
        })();
    }, [token, router]);

    return (
        <div className="container mx-auto p-4 text-center">
            {error ? (
                <p className="text-red-600">Error: {error}</p>
            ) : (
                <p>Joining project… please wait.</p>
            )}
        </div>
    );
}
