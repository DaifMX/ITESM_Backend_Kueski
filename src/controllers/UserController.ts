import { Request, Response } from 'express';

import UserService from "../services/UserService";
import AuthService from '../services/AuthService';

import { getUserInfoFromReq, isAdmin, isUser } from '../utility/check-role';

import ElementNotFoundError from "../errors/ElementNotFoundError";
import RuntimeError from '../errors/RuntimeError';
import AuthError from '../errors/AuthError';
import { TokenPayload } from '../types/interfaces/token-interfaces';

export default class UserController {
    private readonly SERVICE = new UserService();
    private readonly AUTH_SERVICE = new AuthService();

    public create = async (req: Request, res: Response) => {
        try {
            const tkn = req.cookies.tkn;
            const parsedTkn = req.cookies.tkn ? this.AUTH_SERVICE.parseToken(tkn) : null;

            const entry = req.body;
            if (!entry) throw new RuntimeError('Datos no recibidos.');

            const isUserAndIsLoggedIn = req.cookies.tkn && isUser(parsedTkn);
            if (isUserAndIsLoggedIn) throw new RuntimeError('Ya haz iniciado sesión con una cuenta.');

            const notPushingUser = (!!entry.role && entry.role !== 'USER');
            if (notPushingUser && !isAdmin(parsedTkn)) throw new AuthError('No tienes permiso para realizar esta acción.');

            const user = await this.SERVICE.create(entry);
            return res.sendCreated(user);

        } catch (error: any) {
            if (error instanceof RuntimeError) return res.sendBadRequest(error.message);
            if (error instanceof AuthError) return res.sendForbidden(error.message);
            return res.sendInternalServerError(error.message);
        }
    };

    public getAll = async (_req: Request, res: Response) => {
        try {
            const users = await this.SERVICE.getAll();
            return res.sendAccepted(users);

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            return res.sendInternalServerError(error.message);
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            const { id: requesterId, role: requesterRole } = getUserInfoFromReq(req) as TokenPayload;

            const { id: requestedId } = req.params;
            if(!requestedId) throw new RuntimeError('Id no recibida');

            const user = !isAdmin(requesterRole) ? await this.SERVICE.getById(requesterId) : await this.SERVICE.getById(parseInt(requestedId));

            return res.sendSuccess(user);

        } catch (error: any) {
            console.error(error);
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            return res.sendInternalServerError(error.message);
        }
    };
}