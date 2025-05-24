import OrderModel from "../models/OrderModel"
import ProductModel from '../models/ProductModel'

import timestamps from "../consts/timestamps";

import { IOrderNew } from "../types/models/IOrder";
import { Transaction } from "sequelize";

import InternalError from "../errors/InternalError";

export default class OrderRepository {
    private readonly MODEL = OrderModel;

    private getSequelize = () => {
        if (!this.MODEL.sequelize) throw new InternalError('Error en la instancia de sequelize');
        return this.MODEL.sequelize;
    };

    public newTransaction = async (): Promise<Transaction> => {
        return await this.getSequelize().transaction();
    };

    public create = async (entry: IOrderNew, transaction?: Transaction): Promise<OrderModel> => {
        return await this.MODEL.create(entry, { transaction });
    };

    public getAll = async (transaction?: Transaction): Promise<OrderModel[]> => {
        return await this.MODEL.findAll({ transaction });
    };

    public getAllFromUser = async (userId: number, transaction?: Transaction): Promise<OrderModel[]> => {
        return await this.MODEL.findAll({
            where: { userId },
            attributes: { exclude: ['updatedAt'] },
            include: {
                model: ProductModel,
                attributes: { exclude: [...timestamps] },
            },
            transaction
        });
    };

    public getById = async (id: number, transaction?: Transaction): Promise<OrderModel | null> => {
        return await this.MODEL.findByPk(id, {
            attributes: { exclude: ['updatedAt'] },
            include: {
                model: ProductModel,
                attributes: { exclude: [...timestamps] },
                as: 'products'
            },
            transaction
        });
    };
}