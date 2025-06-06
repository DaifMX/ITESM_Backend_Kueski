import { CookieOptions, Response } from 'express';

import { TokenType } from '../types/interfaces/token-interfaces';

import InternalError from '../errors/InternalError';

// Función que ayuda tanto a respuestas del controlador de autorización como a la middleware de
// autorización a lanzar los difernets tipos de cookies.

export default function tokenResolver(res: Response, token: string, tokenType: TokenType): void {
    const ACCESS_TOKEN_EXPIRATION = 15 * 60 * 1000; // 15 minutos
    const PROPS_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000; // 24 horas
    const REFRESH_TOKEN_EXPIRATION = PROPS_TOKEN_EXPIRATION; // 24 horas

    const GLOBAL_COOKIE_OPTS: CookieOptions = {
        httpOnly: false,
        sameSite: 'lax',
        secure: true,
    };

    if (!token || !tokenType) throw new InternalError('Token o tipo de token no recibido al intentar retornar por controlador/middleware.');
    switch (tokenType) {
        case 'ACCESS':
            res.cookie('accessToken', token, {
                ...GLOBAL_COOKIE_OPTS,
                expires: new Date(Date.now() + ACCESS_TOKEN_EXPIRATION),
            });
            break;
        case 'PROPS':
            res.cookie('propsToken', token, {
                ...GLOBAL_COOKIE_OPTS,
                expires: new Date(Date.now() + PROPS_TOKEN_EXPIRATION),
            });
            break;
        case 'REFRESH':
            res.cookie('refreshToken', token, {
                ...GLOBAL_COOKIE_OPTS,
                expires: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION),
            });
            break;
        default: throw new InternalError('Tipo de token invalido.')
    }
}