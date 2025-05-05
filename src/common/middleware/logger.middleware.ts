import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('Request...');
    const { method, originalUrl } = req;
    const userAgent = req.get('user-agent') || '';
    const ip = req.ip;
    const authToken = req.headers['authorization'] || 'No token provided';
    const requestId = req.headers['x-request-id'] || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    req.headers['x-request-id'] = requestId;
    
    console.log(
      `[${new Date().toISOString()}] [${requestId}] (${authToken}) ${method} ${originalUrl} START - ${userAgent} - ${ip}`,
    );
    next();
    console.log(
      `[${new Date().toISOString()}] [${requestId}] (${authToken}) ${method} ${originalUrl} END - ${userAgent} - ${ip}`,
    );
  }
}
