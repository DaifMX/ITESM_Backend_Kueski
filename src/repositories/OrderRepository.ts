import OrderModel from "../models/OrderModel"
import ProductModel from '../models/ProductModel'

import timestamps from "../consts/timestamps";

import { IOrderNew } from "../types/models/IOrder";
import { Transaction, fn, literal } from "sequelize";

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
                    attributes: { exclude: ['password', 'role', 'refreshToken', ...timestamps] },
                    paranoid: false,
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

    public getById = async (uuid: string, transaction?: Transaction): Promise<OrderModel | null> => {
        return await this.MODEL.findByPk(uuid, {
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

    public getAdminDashboardInfo = async (): Promise<OrderModel | null> => {
        return await this.MODEL.findOne({
            attributes: [
                // Sum only paid orders ever
                [
                    fn(
                        'SUM',
                        literal(`CASE WHEN status = 'paid' THEN total ELSE 0 END`)
                    ),
                    'totalSold'
                ],
                // Sum only paid orders in the last 7 days
                [
                    fn(
                        'SUM',
                        literal(`
                            CASE
                                WHEN status = 'paid'
                                AND "OrderModel"."createdAt" >= NOW() - INTERVAL '7 days'
                                THEN total
                                ELSE 0
                            END
                        `)
                    ),
                    'soldLast7Days'
                ],
                // Count of pending orders
                [
                    fn(
                        'COUNT',
                        literal(`
                            CASE
                                WHEN status = 'pending'
                                THEN 1
                            END
                        `)
                    ),
                    'pendingOrders'
                ],
            ],
            raw: true
        });
    };
}