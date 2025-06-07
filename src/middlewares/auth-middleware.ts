import { Request, Response, NextFunction } from "express";

import AuthService from '../services/AuthService';
import UserRepository from "../repositories/UserRepository";

import { TokenPayload } from "../types/interfaces/token-interfaces";
// import tokenResolver from "../utility/token-resolver";

const authService = new AuthService();
const USER_REPOSITORY = new UserRepository();

const tokenResponse = (msg: string) => (_req: Request, res: Response) => res
    .clearCookie('accessToken')
    .clearCookie('propsToken')
    .clearCookie('refreshToken')
    .sendForbidden(msg);

const authMiddleware = (policies: Array<string>) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            // Salta toda validación si el endpoint es publico
            if (policies.includes('PUBLIC')) return next();

            // Obtener access token del empleado
            const accessToken = req.cookies.accessToken;

            // Verificar access token del empleado
            let accessTknVerified = authService.verifyToken(accessToken, 'ACCESS') as TokenPayload;

            // Operar refresh token si access token es invalido
            if (accessTknVerified == null) {
                // Buscar refresh token en las cookies
                const refreshToken = req.cookies.refreshToken;
                if (!refreshToken) return res.sendUnauthorized('Token no recibido.');

                // Buscar empleado con el refresh token guardado en las cookies
                const user = await USER_REPOSITORY.getById((authService.parseToken(refreshToken, 'REFRESH') as TokenPayload).id);

                // Tirar error si el token en las cookies es diferente del que esta guardado en la base de datos
                if (!user || user.refreshToken !== refreshToken) return tokenResponse('Token inválido. Inicie sesión nuevamente.')(req, res);

                // Verificar refresh token
                const refreshTknVerified = authService.verifyToken(refreshToken, 'REFRESH');
                if (refreshTknVerified == null) return tokenResponse('Token expirado. Inicie sesión nuevamente.')(req, res);

                // Crear nuevo access token si el refresh token fue valido
                const newAccessToken = authService.signToken(user, 'ACCESS');
                const newPropsToken = authService.signToken(user, 'PROPS');

                // Devolver el nuevo access y props token
                const ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutes
                const PROPS_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours
                res.cookie('propsToken', newPropsToken, {
                        httpOnly: false,
                        sameSite: 'lax',
                        secure: true,
                        expires: new Date(Date.now() + PROPS_TOKEN_EXPIRATION),
                    })
                    .cookie('accessToken', accessToken, {
                        httpOnly: false,
                        sameSite: 'lax',
                        secure: true,
                        expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRATION),
                    });

                accessTknVerified = authService.parseToken(newAccessToken, 'ACCESS') as TokenPayload;
            }
            // Para este punto ya se validó que el empleado tenga un sesión valida
            if (policies.includes('AUTHORIZED')) return next();

            // Verificar que alguno de los roles del usuario este incluido en las politicas
            const userRole = accessTknVerified.role;
            const hasValidRole = policies.includes(userRole.toUpperCase());
            if (!hasValidRole) return res.sendForbidden('Departamentos invalidos.');

            return next();

        } catch (err: any) {
            console.log(err);
            return res.sendInternalServerError(err.message);
        }
    }
};

export default authMiddleware;