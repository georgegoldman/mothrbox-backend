/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, NestMiddleware } from '@nestjs/common';
import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import { MOTHRBOX_BASE_URL } from 'src/config/utils/src/util.constants';

@Injectable()
export class ApiProxyMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    if (req.path.startsWith('/file-upload/encrypt')) {
      const userId = req.body.userId || req.query.userId;
      const alias = req.body.alias || req.query.alias;

      try {
        await axios.post(
          `${MOTHRBOX_BASE_URL}/encrypt/${userId}/${alias}`,
          req.body,
          {
            headers: {
              'Content-Type':
                req.headers['content-type'] || 'application/octet-stream',
            },
            responseType: 'arraybuffer',
          },
        );
        console.log('getting here');
      } catch (error) {
        console.error('Error contacting mothrbox:', error.message);
        return res.status(500).json({
          error: 'Failed to communicate with Mothrbox',
        });
      }
    }
    next();
  }
}
