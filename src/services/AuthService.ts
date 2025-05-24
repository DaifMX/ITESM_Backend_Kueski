import jwt from 'jsonwebtoken';
import process from 'process';

import UserModel from '../models/UserModel';
import UserService from '../repositories/UserRepository';

import { TokenPayload } from '../types/interfaces/token-interfaces';

import AuthError from '../errors/AuthError';

export default class AuthService {
    private JWT_SECRET_KEY = process.env.JWT_KEY;

    private USER_SERVICE = new UserService();

    // ===== Authentication ===== // 
    public login = async (phoneNumber: bigint, password: string): Promise<string> => {
        const user = await this.USER_SERVICE.getByPhoneNumberFull(phoneNumber);
        if (!user) throw new AuthError('Creedenciales incorrectas. Intente nuevamente.');

        const isValid = await user?.isPasswordValid(password);
        if (!isValid) throw new AuthError('Creedenciales incorrectas. Intente nuevamente.');

        const tkn = this.signToken(user);
        return tkn;
    };

    // ===== JWT ===== //
    public verifyToken = (tkn: string): TokenPayload => {
        try {
            const verified = jwt.verify(tkn, this.JWT_SECRET_KEY!);
            const { id, role } = verified as TokenPayload;
            const payload = { id, role };

            return payload;

        } catch (err: any) {
            throw new AuthError('El token no pudo ser verificado.');
        }
    };

    public parseToken = (tkn: string): TokenPayload => {
        const { id, role } = jwt.decode(tkn) as TokenPayload;
        return { id, role };
    }

    private signToken = (user: UserModel): string => {
        const { id, role } = user;
        const payload = { id, role };

        const tkn = jwt.sign(payload, this.JWT_SECRET_KEY!, { expiresIn: '1d' });
        return tkn;
    };
}