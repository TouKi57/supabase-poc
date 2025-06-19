import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from '../../../lib/supabaseClient';
import { withAuth } from '../../../lib/middleware';

async function handler(req: NextApiRequest & { user: any }, res: NextApiResponse) {
    const { data: memberships, memberships_error } = await supabaseClient
        .from('project_members')
        .select('project_id')
        .eq('user_id', req.user.id);
    if ( memberships == null) {
        return res.status(500).json({ error: memberships_error.message });
    }
    const projectIds = memberships.map((m: any) => m.project_id);
    const { data: projects, projects_error } = await supabaseClient
        .from('projects')
        .select('*')
        .in('id', projectIds);
    if (projects_error) return res.status(500).json({ error: projects_error.message });
    res.json({ projects });
}

export default withAuth(handler);