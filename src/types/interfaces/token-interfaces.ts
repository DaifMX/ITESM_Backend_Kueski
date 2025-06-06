import { Secret, SignOptions } from "jsonwebtoken";

// Tokenization & Related ----->

export interface TokenPayload { // Access & Refresh
    id: number,
    role: 'ADMIN' | 'USER',
};

export interface TokenPropsPayload { // Props
    fullName: string;
};

export interface TokenProperties {
    secret: Secret,
    expiration: SignOptions['expiresIn'],
};

export type TokenType = 'ACCESS' | 'REFRESH' | 'PROPS';

export interface LoginResponse {
    accessToken: string,
    propsToken: string,
    refreshToken: string,
};