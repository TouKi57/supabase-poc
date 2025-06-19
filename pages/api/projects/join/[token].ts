import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../../../lib/supabaseClient';
import { withAuth } from '../../../../lib/middleware';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
    const token = req.query.token as string;
    const { data: project, error } = await supabaseClient
        .from('projects')
        .select('id')
        .eq('invite_token', token)
        .single();
    if (error || !project) return res.status(404).json({ error: 'Invalid token' });
    await supabaseClient
        .from('project_members')
        .upsert({ project_id: project.id, user_id: req.user.id });
    res.json({ success: true });
}

export default withAuth(handler);