import { Request, Response } from 'express';

import AuthService from '../services/AuthService';
import OrderService from "../services/OrderService";

import ElementNotFoundError from "../errors/ElementNotFoundError";
import RuntimeError from '../errors/RuntimeError';

export default class OrderController {
    private SERVICE = new OrderService();
    private AUTH_SERVICE = new AuthService();

    public create = async (req: Request, res: Response) => {
        try {
            const entry = req.body;
            if (!entry) throw new RuntimeError('Datos no recibidos.');

            const tkn = req.cookies.tkn;
            if(!tkn) throw new RuntimeError('Token no encontrado.');

            const parsedTkn = this.AUTH_SERVICE.parseToken(tkn);
            const userId = parsedTkn.id;
            if(!userId) throw new RuntimeError('Token invalido.');
            
            const order = await this.SERVICE.create(entry, userId);
            return res.sendCreated(order);

        } catch (err: any) {
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    public getAll = async (_req: Request, res: Response) => {
        try {
            const orders = await this.SERVICE.getAll();
            return res.sendAccepted(orders);

        } catch (err: any) {
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) throw new RuntimeError('Id no recibido.')

            const order = await this.SERVICE.getById(parseInt(id));
            return res.sendSuccess(order);

        } catch (err: any) {
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            if (err instanceof RuntimeError) return res.sendBadRequest(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    // public pushItem = async (req: Request, res: Response) => {
    //     try {
    //         const { orderId, productId, amount } = req.params;
    //         if (!orderId) throw new RuntimeError('Id de orden no recibido.');
    //         if (!productId) throw new RuntimeError('Id de producto no recibido');
    //         if (!amount) throw new RuntimeError(`Cantidad de producto ${productId} no recibido`);
            
    //         await this.SERVICE.pushItem(parseInt(orderId), parseInt(productId), parseFloat(amount));
    //         return res.sendSuccess({}, 'Articulo agregado a orden correctamente');

    //     } catch (err: any) {
    //         if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
    //         if (err instanceof RuntimeError) return res.sendBadRequest(err.message);
    //         return res.sendInternalServerError(err.message);
    //     }
    // };
}