import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; email: string; permission: string };
}

export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}
