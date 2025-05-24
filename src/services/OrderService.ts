import OrderRepository from "../repositories/OrderRepository";
import ProductRepository from "../repositories/ProductRepository";

import OrderModel from "../models/OrderModel";
import { IOrderNewReq } from "../types/models/IOrder";

import { Transaction, ValidationError, DatabaseError } from "sequelize";
import ElementNotFoundError from "../errors/ElementNotFoundError";
import InternalError from "../errors/InternalError";
import RuntimeError from "../errors/RuntimeError";

export default class OrderService {
    private readonly REPOSITORY = new OrderRepository();
    private readonly PRODUCT_REPOSITORY = new ProductRepository();

    public create = async (entry: IOrderNewReq, userId: number): Promise<OrderModel> => {
        const transaction = await this.REPOSITORY.newTransaction();

        try {
            const order = await this.REPOSITORY.create({ userId }, transaction);

            for (const product of entry.products) {
                await this.pushItem(order.id, product.productId, product.amount, transaction);
            }

            const finalOrder = await this.REPOSITORY.getById(order.id, transaction);
            await transaction.commit();
            return finalOrder!;

        } catch (error: any) {
            console.error(error);
            await transaction.rollback();
            if (error instanceof ValidationError) throw new RuntimeError(error.message);
            throw new InternalError(error.message)
        }
    };

    public getAll = async (userId?: number): Promise<OrderModel[]> => {
        try {
            const orders = userId ? await this.REPOSITORY.getAllFromUser(userId) : await this.REPOSITORY.getAll();
            if (!orders || orders.length === 0) throw new ElementNotFoundError('Ordenes no encontradas en la base de datos.');

            return orders;

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public getById = async (id: number): Promise<OrderModel> => {
        try {
            const order = await this.REPOSITORY.getById(id);
            if (!order) throw new ElementNotFoundError(`Orden con el id ${id} no encontrado en la base de datos.`);

            return order;
        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public pushItem = async (orderId: number, productId: number, amount: number, t: Transaction): Promise<void> => {
        try {
            const order = await this.REPOSITORY.getById(orderId, t);
            if (!order) throw new ElementNotFoundError(`Orden con el id ${orderId} no encontrado en la base de datos.`);

            const product = await this.PRODUCT_REPOSITORY.getById(productId, t);
            if (!product) throw new ElementNotFoundError(`Producto con el id ${productId} no encontrado en la base de datos.`);

            if (product.stock < amount) throw new RuntimeError('Stock insuficiente.');

            const subtotal = product.price * amount;

            await order.$add('products', productId, {
                through: { amount, subtotal },
                transaction: t
            });

            order.total = (order.total || 0) + subtotal;
            await order.save({ transaction: t });

            product.stock = product.stock - amount;
            await product.save({ transaction: t });

        } catch (error: any) {
            console.error(error);
            await t.rollback();
            if (error instanceof ElementNotFoundError) throw error;
            if (error instanceof DatabaseError) throw new InternalError('Ha ocurrido un error al intentar crear tu pedidio. Intenta nuevamente más tarde.')
            throw new InternalError(error.message);
        }
    };
}