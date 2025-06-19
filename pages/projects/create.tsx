import { useState } from 'react';
import { useRouter } from 'next/router';
import { supabaseClient } from '../../lib/supabaseClient';

export default function CreateProject() {
    const [name, setName] = useState('');
    const [details, setDetails] = useState('');
    const router = useRouter();

    const handleSubmit = async e => {
        e.preventDefault();
        const { data: { session } } = await supabaseClient.auth.getSession();
        await fetch('/api/projects/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ name, details })
        });
        router.push('/dashboard');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Project name" />
            <textarea value={details} onChange={e => setDetails(e.target.value)} placeholder="Details" />
            <button type="submit">Create Project</button>
        </form>
    );
}