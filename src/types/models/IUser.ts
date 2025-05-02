export interface IUser {
    phoneNumber: bigint;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'USER';
};