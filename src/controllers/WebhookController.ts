import { Request, Response } from 'express';

export default class WebhookController {
    public webhook = async (req: Request, res: Response) => {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

        const chunks = [];
        for await (const chunk of req) {
            chunks.push(chunk);
        }

        const rawBody = Buffer.concat(chunks).toString('utf8');
        console.log('Webhook recibido:', rawBody);

        let payload;
        try {
            payload = JSON.parse(rawBody);
        } catch (err) {
            console.error('JSON inválido:', err);
            return res.status(400).json({ error: 'Invalid JSON' });
        }

        const { status } = payload;
        if (status === 'approved') return res.status(200).json({ status: 'accept' });

        return res.status(200).json({ status: 'ok' });
    };
}