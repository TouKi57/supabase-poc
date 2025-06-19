import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../../../lib/supabaseClient';
import { withAuth } from '../../../../lib/middleware';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
    const projectId = req.query.id as string;
    const { data: project, error } = await supabaseClient
        .from('projects')
        .select('invite_token, owner_id')
        .eq('id', projectId)
        .single();
    if (error || project.owner_id !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    const link = `${process.env.NEXT_PUBLIC_APP_URL}/projects/join/${project.invite_token}`;
    res.json({ inviteLink: link });
}

export default withAuth(handler);