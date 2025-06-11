import { Response, Request } from 'express';

import AuthService from "../services/AuthService";

import tokenResolver from '../utility/token-resolver';

import AuthError from '../errors/AuthError';
import ElementNotFoundError from '../errors/ElementNotFoundError';

export default class AuthController {
    private readonly SERVICE = new AuthService();

    public login = async (req: Request, res: Response) => {
        const { phoneNumber, password } = req.body;
        try {
            if (!phoneNumber || !password) throw new AuthError('Celular o contraseña no recibido/s.');
            const { accessToken, propsToken, refreshToken } = await this.SERVICE.login(phoneNumber, password);

            tokenResolver(res, accessToken, 'ACCESS');
            tokenResolver(res, propsToken, 'PROPS');
            tokenResolver(res, refreshToken, 'REFRESH');

            return res.sendSuccess({}, 'Sesión inciada correctamente.');

        } catch (err: any) {
            if (err instanceof ElementNotFoundError || err instanceof AuthError) {
                return res.sendUnauthorized(err.message);
            }
            return res.sendInternalServerError(err.message);

        }
    };

    public logout = async (req: Request, res: Response) => {
        try {
            // Obtener token para obtener uuid del empleado
            const refreshToken = req.cookies.refreshToken;
            this.SERVICE.logout(refreshToken);

            // Remover cookies con el refresh token
            return res
                .clearCookie('refreshToken')
                .clearCookie('accessToken')
                .clearCookie('propsToken')
                .sendSuccess({}, 'Sesión terminada exitosamente.');

        } catch (err: any) {
            console.error(err);
            return res.sendInternalServerError(err.message);
        }
    };

    public isLoggedIn = (_req: Request, res: Response) => {
        try {
            return res.sendSuccess({}, 'Logeado.');
        } catch (err) {
            return res.sendForbidden('No logeado.');
        }
    };
}
