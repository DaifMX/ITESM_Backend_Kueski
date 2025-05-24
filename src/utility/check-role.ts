import AuthService from "../services/AuthService";
import { TokenPayload } from "../types/interfaces/token-interfaces"

import { Request } from "express";

const authService = new AuthService();

export const getUserInfoFromReq = (req: Request): TokenPayload | null => req.cookies.tkn ? authService.parseToken(req.cookies.tkn) : null; 

export const isUser = (value: TokenPayload | string | undefined | null): boolean => {
    if (typeof value === 'string') return value === 'USER';
    return value ? value.role === 'USER' : false;
}

export const isAdmin = (value: TokenPayload | string | undefined | null): boolean => {
    if (typeof value === 'string') return value === 'ADMIN';
    return value ? value.role === 'ADMIN' : false;
}