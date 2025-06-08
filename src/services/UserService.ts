import UserRepository from "../repositories/UserRepository";

import { IUserNew } from "../types/models/IUser";
import UserModel from "../models/UserModel";

import ElementNotFoundError from "../errors/ElementNotFoundError";
import InternalError from "../errors/InternalError";
import { Transaction, UniqueConstraintError, ValidationError } from "sequelize";
import RuntimeError from "../errors/RuntimeError";

export default class UserService {
    private readonly REPOSITORY = new UserRepository();

    public create = async (entry: IUserNew): Promise<UserModel> => {
        try {
            const user = await this.REPOSITORY.create(entry);
            return user;

        } catch (error: any) {
            if (error instanceof UniqueConstraintError) {
                try {
                    const restoredUser = await this.restore(entry.phoneNumber, entry.password);
                    return restoredUser;
                } catch (error: any) {
                    throw error;
                }
            }

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

    public getByPhoneNumber = async (phoneNumber: bigint): Promise<UserModel> => {
        try {
            const user = await this.REPOSITORY.getByPhoneNumber(phoneNumber);
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

            const hasPendingOrders = user.orders.some((o) => o.status === 'pending');
            if (hasPendingOrders) throw new RuntimeError('El usuario no pudo ser eliminado ya que tiene ordenes activas. Cancele sus ordenes e intente nuevamente.');

            await user.destroy({ transaction });
            await transaction.commit();

            return true;
        } catch (error: any) {
            await transaction.rollback();
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    private restore = async (phoneNumber: bigint, password: string, t?: Transaction): Promise<UserModel> => {
        const transaction = t ? t : await this.REPOSITORY.newTransaction();
        try {
            const user = await this.REPOSITORY.getByPhoneNumber(phoneNumber, transaction, false);

            if (!user) throw new ElementNotFoundError('El usuario que estas intentando restaurar no existe.');
            if (!user.deletedAt) throw new RuntimeError(`El usuario con el número telefónico ${phoneNumber} ya existe en la base de datos.`);

            const isPasswordValid = await user?.isPasswordValid(password);
            if (!isPasswordValid) throw new RuntimeError('Ya existía un usuario con el número telefónico proporcionado, sin embargo la contaseña ingresada difiere de la original. Favor de usar la misma contraseña.')

            await user.restore({ transaction });
            await user.save({ transaction });
            await transaction.commit();

            return user;

        } catch (error: any) {
            await transaction.rollback();
            if (error instanceof ElementNotFoundError) throw error;
            if (error instanceof RuntimeError) throw error;
            throw new InternalError(error.message);
        }
    };
};