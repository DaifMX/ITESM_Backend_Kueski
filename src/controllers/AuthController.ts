import { Response, Request } from 'express';

import AuthService from "../services/AuthService";

import RuntimeError from '../errors/RuntimeError';

export default class AuthController {
    private readonly SERVICE = new AuthService();

    public login = async (req: Request, res: Response) => {
        try {
            const { phoneNumber, password } = req.body;
            if (!phoneNumber || !password) throw new RuntimeError('Creedenciales no recibidas.');

            const tkn = await this.SERVICE.login(phoneNumber, password);

            return res.cookie('tkn', tkn, {
                httpOnly: true,
                sameSite: 'strict',
                secure: true,
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000)
            }).sendSuccess({}, 'Sesión iniciada correctamente.');

        } catch (err: any) {
            if (err instanceof RuntimeError) return res.sendBadRequest(err.message);
            return res.sendInternalServerError(err.message);
        }
    };

    public logout = async (_req: Request, res: Response) => {
        try {
            return res.clearCookie('tkn');
        } catch (err: any) {
            return res.sendInternalServerError(err.message);
        }
    };

    public isLoggedIn = async (_req: Request, _res: Response) => {
        
    };
}
