import OrderModel from "../models/OrderModel"
import ProductModel from '../models/ProductModel'

import timestamps from "../consts/timestamps";

import { IOrderNew } from "../types/models/IOrder";
import { Transaction } from "sequelize";

import InternalError from "../errors/InternalError";
import UserModel from "../models/UserModel";

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
        return await this.MODEL.findAll({
            attributes: { exclude: ['userId'] },
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: ProductModel,
                    through: { attributes: { exclude: ['orderId', 'productId', ...timestamps] } },
                    attributes: { exclude: [...timestamps, 'stock', 'category', 'description'] },
                    as: 'products'
                },
                {
                    model: UserModel,
                    attributes: { exclude: ['password', 'role', 'refreshToken', ...timestamps] }
                }
            ],
            transaction
        });
    };

    public getAllFromUser = async (userId: number, transaction?: Transaction): Promise<OrderModel[]> => {
        return await this.MODEL.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['updatedAt', 'userId'] },
            include: {
                model: ProductModel,
                through: { attributes: { exclude: ['orderId', 'productId', ...timestamps] } },
                attributes: { exclude: [...timestamps, 'stock', 'category', 'description'] },
                as: 'products'
            },
            transaction
        });
    };

    public getById = async (id: number, transaction?: Transaction) => {
        return await this.MODEL.findByPk(id, {
            attributes: { exclude: ['updatedAt'] },
            include: {
                model: ProductModel,
                through: { attributes: ['amount', 'subtotal'] },
                attributes: { exclude: [...timestamps] },
                as: 'products'
            },
            transaction
        });
    };
}