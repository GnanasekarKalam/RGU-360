// api/test.ts
// Minimal test handler for Vercel

import { Request, Response } from 'express';

export default async (req: Request, res: Response) => {
  try {
    res.status(200).json({
      status: 'ok',
      message: 'Minimal handler test',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      path: req.path,
      method: req.method,
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
