import { Request, Response } from 'express';

import AuthService from '../services/AuthService';
import OrderService from "../services/OrderService";

import { getUserInfoFromReq, isUser } from '../utility/check-role';

import ElementNotFoundError from "../errors/ElementNotFoundError";
import RuntimeError from '../errors/RuntimeError';
import { TokenPayload } from '../types/interfaces/token-interfaces';
import AuthError from '../errors/AuthError';

export default class OrderController {
    private readonly SERVICE = new OrderService();
    private readonly AUTH_SERVICE = new AuthService();

    public create = async (req: Request, res: Response) => {
        try {
            const entry = req.body;
            if (!entry) throw new RuntimeError('Datos no recibidos.');

            const tkn = req.cookies.refreshToken;
            if (!tkn) throw new RuntimeError('Token no encontrado.');

            const parsedTkn = this.AUTH_SERVICE.parseToken(tkn, 'REFRESH') as TokenPayload;
            const userId = parsedTkn.id;
            if (!userId) throw new RuntimeError('Token inváldio.');

            const order = await this.SERVICE.create(entry, userId);
            return res.sendCreated(order);

        } catch (err: any) {
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    public getAll = async (req: Request, res: Response) => {
        try {
            const tkn = req.cookies.refreshToken;
            const parsedTkn = this.AUTH_SERVICE.parseToken(tkn, 'REFRESH') as TokenPayload;
            const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;

            const orders = parsedTkn.role === 'ADMIN' ?
                await this.SERVICE.getAll(userId) :
                await this.SERVICE.getAll(parsedTkn.id);

            return res.sendSuccess(orders);

        } catch (err: any) {
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            const { id: tknId, role: tknRole } = getUserInfoFromReq(req) as TokenPayload;

            const { uuid } = req.params;
            if (!uuid) throw new RuntimeError('Id no recibido.')

            const order = await this.SERVICE.getById(uuid);

            if (isUser(tknRole) && order.userId !== tknId) throw new AuthError('No tienes permiso para ver este recurso.');

            return res.sendSuccess(order);

        } catch (err: any) {
            console.error(err);
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            if (err instanceof RuntimeError) return res.sendBadRequest(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    public getAdminDashboardInfo = async (_req: Request, res: Response) => {
        try {
            const info = await this.SERVICE.getAdminDashboardInfo();
            if (!info) throw new RuntimeError('Error getting admin dashboard inforomation.');

            return res.sendSuccess(info);
        } catch (err: any) {
            console.error(err);
            if (err instanceof ElementNotFoundError) return res.sendNotFound(err.message);
            if (err instanceof RuntimeError) return res.sendBadRequest(err.message);
            return res.sendInternalServerError(err.message);
        }
    };
}