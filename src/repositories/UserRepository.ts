import { Transaction } from 'sequelize';

import UserModel from '../models/UserModel';

import timestamps from '../consts/timestamps';

import { IUserNew } from '../types/models/IUser';

import InternalError from '../errors/InternalError';

export default class UserRepository {
    private readonly MODEL = UserModel;

    private getSequelize = () => {
        if (!this.MODEL.sequelize) throw new InternalError('Error en la instancia de sequelize');
        return this.MODEL.sequelize;
    };

    public newTransaction = async (): Promise<Transaction> => {
        return await this.getSequelize().transaction();
    };

    public create = async (entry: IUserNew, transaction?: Transaction): Promise<UserModel> => {
        return await this.MODEL.create(entry, { transaction });
    };

    public getAll = async (transaction?: Transaction): Promise<UserModel[]> => {
        return await this.MODEL.findAll({
            attributes: { exclude: ['password'] },
            transaction
        });
    };

    public getByPhoneNumberFull = async (phoneNumber: bigint, transaction?: Transaction): Promise<UserModel | null> => {
        return await this.MODEL.findOne({
            where: { phoneNumber },
            transaction
        });
    };

    public getById = async (id: number, transaction?: Transaction): Promise<UserModel | null> => {
        return await this.MODEL.findByPk(id, {
            attributes: { exclude: [...timestamps, 'password'] },
            transaction
        });
    };
}