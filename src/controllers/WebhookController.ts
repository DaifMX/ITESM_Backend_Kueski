import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export default class WebhookController {
    private KUESKI_API_SECRET = process.env.KUESKI_API_SECRET;

    public webhook = async (req: Request, res: Response) => {
        const entry = req.body;
        
        if (!entry.payment_id || !entry.order_id || !entry.amount || !entry.status || !entry.status_reason || !entry.sandbox
        ) return res.sendBadRequest('Invalid request.');

        const nowSec = Math.floor(Date.now() / 1000);
        const iat = nowSec;
        const exp = nowSec + 5 * 60;

        const jti = crypto
            .createHash('sha256')
            .update(`${this.KUESKI_API_SECRET}:${iat}`)
            .digest('hex');

        const responseJwtPayload = {
            public_key: this.KUESKI_API_SECRET,
            iat,
            exp,
            jti
        };

        const resTkn = jwt.sign(
            responseJwtPayload,
            this.KUESKI_API_SECRET!,
            { algorithm: 'HS256' }
        );

        res.setHeader('Authorization', `Bearer ${resTkn}`);
        res.setHeader('kueski-authorization', `Bearer ${resTkn}`);

        if (entry.status === 'approved') return res.status(200).json({ status: 'accept' });
    };
}