export interface IUser {
    id: number;
    phoneNumber: bigint;
    password: string;
    firstName: string;
    lastName: string;
    refreshToken: string | null;
    role: 'ADMIN' | 'USER';
};

export type IUserNew = Omit<IUser, 'id' | 'refreshToken'>;
export type IUserUpdate = Partial<IUserNew>;