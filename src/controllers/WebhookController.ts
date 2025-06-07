import { Request, Response } from 'express';


import OrderService from '../services/OrderService';
import { signKueskiTkn } from '../utility/token-resolver';

export default class WebhookController {
    private readonly ORDER_SERVICE = new OrderService();

    public getKueskiResponse = async (req: Request, res: Response) => {
        const entry = req.body;

        if (!entry.payment_id || !entry.order_id || !entry.amount || !entry.status || !entry.status_reason || !entry.sandbox)
            return res.sendBadRequest('Invalid request.');

        const resTkn = signKueskiTkn();

        res.setHeader('Authorization', `Bearer ${resTkn}`);
        res.setHeader('kueski-authorization', `Bearer ${resTkn}`);

        if (entry.status === 'approved') {
            let orderStatus;
            try {
                orderStatus = await this.ORDER_SERVICE.validate(entry.order_id);
                return res.status(200).json({ status: orderStatus });
            } catch (err: any) {
                console.error(err);
                return res.status(200).json({ status: 'ok' })
            }
        }

        if (entry.status === 'canceled' || entry.status === 'denied') {
            try {
                await this.ORDER_SERVICE.cancel(entry.order_id);
                
            } catch (error: any) {
                console.error(error);    
            }
            return res.status(200).json({ status: 'ok' });
        }
    };
}