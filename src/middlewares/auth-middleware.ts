import { Request, Response, NextFunction } from 'express';

import AuthService from '../services/AuthService';

const authService = new AuthService();

const authMiddleware = (policies: Array<String>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (policies.includes('PUBLIC')) return next();

        try {
            //Obtener token
            const token = req.cookies.tkn;
            if (!token) return res.sendUnauthorized('Token no recibido');

            //Verificar token
            const verifiedToken = authService.verifyToken(token);
            if(!verifiedToken) return res.sendUnauthorized('Token invalido');

            if(!policies.includes('AUTHORIZED')) return res.sendForbidden('No tienes suficientes permisos para realizar esta acción.');

            //Verificar rol del empleado
            const userRole = verifiedToken.role;
            if (!policies.includes(userRole)) return res.sendForbidden('No tienes suficientes permisos para realizar esta acción');

            return next();

        } catch (error: any) {
            console.error(error.message);
            return res.clearCookie('tkn').sendSuccess({}, 'Sesión terminada.');
        }
    }
};

export default authMiddleware;