// hooks/useUserProjects.ts
import { useState, useEffect } from 'react';
import { supabaseClient } from '../lib/supabaseClient';

export type Project = {
    id: string;
    name: string;
    details: string | null;
    owner_id: string;
    invite_token: string | null;
    created_at: string;
};

/**
 * Fetches and returns the list of projects the current user belongs to.
 */
export function useUserProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchProjects() {
            setLoading(true);
            setError(null);

            try {
                // 1) Get the current session to read the access token
                const {
                    data: { session },
                    error: sessionErr,
                } = await supabaseClient.auth.getSession();
                if (sessionErr || !session?.access_token) {
                    throw new Error('No valid session. Please sign in.');
                }

                // 2) Call the protected API to list projects
                const resp = await fetch(`/api/projects/list`, {
                    headers: {
                        Authorization: `Bearer ${session.access_token}`,
                    },
                });

                // 3) Parse JSON (guard against non-JSON responses)
                const text = await resp.text();
                let payload: { projects?: Project[]; error?: string };
                try {
                    payload = JSON.parse(text);
                } catch {
                    throw new Error('Unexpected response from server.');
                }

                if (!resp.ok) {
                    throw new Error(payload.error || 'Failed to load projects.');
                }

                // 4) Update state if still mounted
                if (isMounted) {
                    setProjects(payload.projects || []);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchProjects();

        // Cleanup flag
        return () => {
            isMounted = false;
        };
    }, []);

    return { projects, loading, error };
}
