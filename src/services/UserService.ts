import UserRepository from "../repositories/UserRepository";

import { IUserNew } from "../types/models/IUser";
import UserModel from "../models/UserModel";

import ElementNotFoundError from "../errors/ElementNotFoundError";
import InternalError from "../errors/InternalError";
import { ValidationError } from "sequelize";

export default class UserService {
    private REPOSITORY = new UserRepository();

    public create = async (entry: IUserNew): Promise<UserModel> => {
        try {
            const user = await this.REPOSITORY.create(entry);
            return user;

        } catch (error: any) {
            if (error instanceof ValidationError) throw error;
            throw new InternalError(error.message);
        }
    };

    public getAll = async (): Promise<UserModel[]> => {
        try {
            const users = await this.REPOSITORY.getAll();
            if (!users) throw new ElementNotFoundError('Usuarios no encontrados en la base de datos.');

            return users;

        } catch (error: any) {
            if (error instanceof ValidationError) throw error;
            throw new InternalError(error.messasge);
        }
    };

    public getByPhoneNumberFull = async (phoneNumber: bigint): Promise<UserModel> => {
        try {
            const user = await this.REPOSITORY.getByPhoneNumberFull(phoneNumber);
            if (!user) throw new ElementNotFoundError(`Usuario con el número telefonico ${phoneNumber} no encontrado en la base de datos.`);

            return user;
        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public getById = async (id: number): Promise<UserModel> => {
        try {
            const user = await this.REPOSITORY.getById(id);
            if (!user) throw new ElementNotFoundError(`Usuario con el id ${id} no encontrado en la base de datos.`);

            return user;
        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public remove = async (id: number): Promise<boolean> => {
        const transaction = await this.REPOSITORY.newTransaction();
        try {
            const user = await this.REPOSITORY.getById(id, transaction);
            if (!user) throw new ElementNotFoundError(`Usuario con el id ${id} no encontrado en la base de datos.`);
            
            await user.destroy({ transaction });
            await transaction.commit();
            
            return true;
        } catch (error: any) {
            await transaction.rollback();

            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };
};