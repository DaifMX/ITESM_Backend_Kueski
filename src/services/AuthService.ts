import jwt from 'jsonwebtoken';
import process from 'process';

import UserModel from '../models/UserModel';
import UserService from '../repositories/UserRepository';

import { TokenType, TokenPayload, TokenProperties, TokenPropsPayload, LoginResponse } from '../types/interfaces/token-interfaces';

import AuthError from '../errors/AuthError';
import InternalError from '../errors/InternalError';
import ElementNotFoundError from '../errors/ElementNotFoundError';

export default class AuthService {
    private readonly USER_SERVICE = new UserService();

    private JWT_ACCESS_KEY = process.env.JWT_ACCESS_KEY!;
    private JWT_REFRESH_KEY = process.env.JWT_REFRESH_KEY!;

    // ===== Authentication ===== // 
    public login = async (phoneNumber: bigint, password: string): Promise<LoginResponse> => {
        const transaction = await this.USER_SERVICE.newTransaction();
        try {
            const user = await this.USER_SERVICE.getByPhoneNumber(phoneNumber, transaction);
            if (!user) throw new AuthError('Creedenciales incorrectas. Intente nuevamente.');

            const isValid = await user?.isPasswordValid(password);
            if (!isValid) throw new AuthError('Creedenciales incorrectas. Intente nuevamente.');

            const accessToken = this.signToken(user, 'ACCESS');
            const refreshToken = this.signToken(user, 'REFRESH');
            const propsToken = this.signToken(user, 'PROPS');

            user.refreshToken = refreshToken;
            await user.save({ transaction });
            await transaction.commit();

            return { accessToken, refreshToken, propsToken };

        } catch (error: any) {
            await transaction.rollback();
            throw error;
        }
    };

    public logout = async (token: string): Promise<void> => {
        const transaction = await this.USER_SERVICE.newTransaction();
        try {
            const parsedToken = this.parseToken(token, 'REFRESH') as TokenPayload;

            const id = parsedToken.id;
            const user = await this.USER_SERVICE.getById(id, transaction);

            if (!user) throw new ElementNotFoundError(`No existe ningún usuario con el id ${id}.`);

            // Remover refresh token del empleado
            user.refreshToken = null;
            await user.save({transaction});
            await transaction.commit();

        } catch (err: any) {
            await transaction.rollback();
            throw err;
        }
    };


    // ===== JWT ===== //
    public verifyToken = (tkn: string, type: TokenType): TokenPayload | null => {
        try {
            const properties = this.setTokenProperties(type);
            const verified = jwt.verify(tkn, properties.secret);
            const { id, role } = verified as TokenPayload;
            const payload = { id, role };

            return payload;

        } catch (err: any) {
            return null;
        }
    };

    public parseToken = (tkn: string, type: TokenType): TokenPayload | TokenPropsPayload => {
        const decoded = jwt.decode(tkn);
        if (!decoded) throw new AuthError('Token invalido');

        if (type === 'ACCESS' || type === 'REFRESH') {
            const { id, role } = decoded as TokenPayload;
            return { id, role } as TokenPayload;

        } else if (type === 'PROPS') {
            const { fullName } = decoded as TokenPropsPayload;
            return { fullName } as TokenPropsPayload;

        } else {
            throw new InternalError('Tipo de token a parsear invalido.');
        }
    }

    public signToken = (user: UserModel, type: TokenType): string => {
        const { secret, expiration } = this.setTokenProperties(type);
        if (type !== 'PROPS') {
            return jwt.sign({
                id: user.id,
                role: user.role,
            }, secret, { expiresIn: expiration });
        }

        return jwt.sign({
            fullName: user.firstName + ' ' + user.lastName,
        }, secret, { expiresIn: expiration });
    };

    private setTokenProperties = (type: TokenType): TokenProperties => {
        const properties: Partial<TokenProperties> = {};

        switch (type) {
            case 'PROPS':
            case 'REFRESH':
                properties.secret = this.JWT_REFRESH_KEY;
                properties.expiration = '1d'; // Tiempo largo de expiración (minimo un día)
                break;

            case 'ACCESS':
                properties.secret = this.JWT_ACCESS_KEY;
                properties.expiration = '15m'; // Tiempo corto de expiración
                break;

            default:
                throw new InternalError('Error interno. Opción de token invalida.');
        };

        return properties as TokenProperties;
    };
}