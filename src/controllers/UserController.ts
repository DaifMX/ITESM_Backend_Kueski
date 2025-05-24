import { Request, Response } from 'express';

import UserService from "../services/UserService";

import ElementNotFoundError from "../errors/ElementNotFoundError";
import RuntimeError from '../errors/RuntimeError';

export default class UserController {
    private SERVICE = new UserService();

    public create = async (req: Request, res: Response) => {
        try {
            const entry = req.body;
            if (!entry) throw new RuntimeError('Datos no recibidos.');

            const user = await this.SERVICE.create(entry);
            return res.sendCreated(user);

        } catch (error: any) {
            if (error instanceof RuntimeError) return res.sendBadRequest(error.message);
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
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
            const { id } = req.params;
            const user = await this.SERVICE.getById(parseInt(id));
            return res.sendSuccess(user);

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            return res.sendInternalServerError(error.message);
        }
    };

}