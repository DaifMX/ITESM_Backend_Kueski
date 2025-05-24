export interface IUser {
    id: number;
    phoneNumber: bigint;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'USER';
};

export type IUserNew = Omit<IUser, 'id'>;
export type IUserUpdate = Partial<IUserNew>;