import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseClient } from './supabaseClient';

export interface AuthenticatedRequest extends NextApiRequest {
  user: { id: string; email: string };
}

export function withAuth(
    handler: (req: AuthenticatedRequest, res: NextApiResponse) => any,
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    if (authHeader == null) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const authReq = req as AuthenticatedRequest;
    authReq.user = { id: user.id, email: user.email! };
    return handler(authReq, res);
  };
}