import crypto from 'crypto';
import { CookieOptions, Response } from 'express';
import jwt from 'jsonwebtoken';

import { TokenType } from '../types/interfaces/token-interfaces';

import InternalError from '../errors/InternalError';


const KUESKI_API_SECRET = process.env.KUESKI_API_SECRET;

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
    }
};

export function signKueskiTkn(): string {
    try {
        const nowSec = Math.floor(Date.now() / 1000);
        const iat = nowSec;
        const exp = nowSec + 5 * 60;
    
        const jti = crypto
            .createHash('sha256')
            .update(`${KUESKI_API_SECRET}:${iat}`)
            .digest('hex');
    
        const responseJwtPayload = {
            public_key: KUESKI_API_SECRET,
            iat,
            exp,
            jti
        };
    
        return jwt.sign(
            responseJwtPayload,
            KUESKI_API_SECRET!,
            { algorithm: 'HS256' }
        );
        
    } catch (_error: any) {
        throw new InternalError('An error ocurred trying to create the token.');
    }
};