import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../../lib/supabaseClient';
import { withAuth } from '../../../lib/middleware';
import { randomUUID } from 'crypto';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
    const { name, details } = req.body;
    if (!name) return res.status(400).json({ error: 'Missing name' });
    const inviteToken = randomUUID();
    const { data: project, error: pErr } = await supabaseClient
        .from('projects')
        .insert({ name, details, owner_id: req.user.id, invite_token: inviteToken })
        .select('*')
        .single();
    if (pErr) return res.status(500).json({ error: pErr.message });
    await supabaseClient.from('project_members').insert({ project_id: project.id, user_id: req.user.id });
    res.status(201).json({ project });
}

export default withAuth(handler);