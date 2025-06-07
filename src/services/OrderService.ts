import axios, { AxiosError } from "axios";
import { Transaction, ValidationError, DatabaseError } from "sequelize";

import OrderRepository from "../repositories/OrderRepository";
import ProductRepository from "../repositories/ProductRepository";

import twilioSend from "../utility/twilio-wa-sender";

import OrderModel from "../models/OrderModel";
import { IOrderNewReq } from "../types/models/IOrder";

import ElementNotFoundError from "../errors/ElementNotFoundError";
import InternalError from "../errors/InternalError";
import RuntimeError from "../errors/RuntimeError";
import { KueskiFinalOrderStatus } from "../types/kueski-types";

export default class OrderService {
    private readonly KUESKI_API_KEY = process.env.KUESKI_API_KEY;
    private readonly KUESKI_API_BASE_URL = process.env.KUESKI_API_BASE_URL;

    private readonly REPOSITORY = new OrderRepository();
    private readonly PRODUCT_REPOSITORY = new ProductRepository();

    private parseKueskiOrder = async (order: OrderModel) => {
        const user = await order.$get('user');

        const firstName = user?.firstName;
        const lastName = user?.lastName;
        const phoneNumber = user?.phoneNumber;

        const items = order.products.map((product: any) => {
            const amount = product.OrderProductModel.amount;

            return {
                name: product.name,
                description: product.description,
                quantity: amount,
                price: product.price,
                currency: 'MXN',
                sku: `P0${product.id}`
            };
        });

        const tax = Number((order.total * 0.16).toFixed(2));

        const kueskiOrderBody = {
            order_id: order.uuid,
            description: `Orden #${order.uuid} para ${firstName} ${lastName}. Total $${order.total}`,
            amount: {
                total: order.total,
                currency: "MXN",
                details: {
                    subtotal: order.total - tax,
                    shipping: 0,
                    tax
                }
            },
            items,
            shipping: {
                name: {
                    name: firstName,
                    last: lastName,
                },
                address: {
                    address: 'Av. Gral Ramón Corona No 2514',
                    neighborhood: "ITESM Campus Guadalajara",
                    city: "Guadalajara",
                    state: "Jalisco",
                    zipcode: "45201",
                    country: "MX"
                },
                phone_number: `52${phoneNumber}`,
            },
            callbacks: {
                on_success: 'https://daif-201.ddns.me/success',
                on_reject: 'https://daif-201.ddns.me/reject',
                on_canceled: 'https://daif-201.ddns.me/canceled',
                on_failed: 'https://daif-201.ddns.me/failed'
            }
        };

        return { kueskiOrderBody, phoneNumber };
    };

    public create = async (entry: IOrderNewReq, userId: number): Promise<OrderModel> => {
        let kueskiRes;
        const transaction = await this.REPOSITORY.newTransaction();
        try {
            const order = await this.REPOSITORY.create({ userId }, transaction);

            for (const product of entry.products) {
                await this.pushItem(order.uuid, product.productId, product.amount, transaction);
            }

            const orderInDb = await this.REPOSITORY.getById(order.uuid, transaction);

            const { kueskiOrderBody, phoneNumber } = await this.parseKueskiOrder(orderInDb as OrderModel);

            const composedUrl = `${this.KUESKI_API_BASE_URL}payments`;
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.KUESKI_API_KEY}`,
                'kp-name': 'euqipos2-dev',
                'kp-source': 'web',
                'kp-version': '1.0.0',
                'kp-trigger': 'api'
            };
            kueskiRes = await axios.post(composedUrl, kueskiOrderBody, { headers });

            let kueskiPaymentUrl;

            if (kueskiRes.data.status === 'success') kueskiPaymentUrl = kueskiRes.data.data.callback_url;
            else throw new RuntimeError('Ocurrio un error al crear tu orden en Kueski.');

            await transaction.commit();

            twilioSend(`¡Hola, muchas gracias por realizar tu pedidio! Aquí esta tu link de pago: ${kueskiPaymentUrl}`, phoneNumber as bigint);

            return orderInDb!;

        } catch (error: any) {
            console.error(error);
            await transaction.rollback();
            if (error instanceof ValidationError) throw new RuntimeError(error.message);
            if (error instanceof RuntimeError) throw error;
            if (error instanceof AxiosError) throw new RuntimeError('Ocurrio un error al crear tu orden en Kueski.');
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

    public getById = async (uuid: string): Promise<OrderModel> => {
        try {
            const order = await this.REPOSITORY.getById(uuid);
            if (!order) throw new ElementNotFoundError(`Orden con el id ${uuid} no encontrado en la base de datos.`);

            return order;
        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public pushItem = async (orderId: string, productId: number, amount: number, t: Transaction): Promise<void> => {
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
            product.stockCommitted = product.stockCommitted + amount;
            await product.save({ transaction: t });

        } catch (error: any) {
            console.error(error);
            await t.rollback();
            if (error instanceof ElementNotFoundError) throw error;
            if (error instanceof DatabaseError) throw new InternalError('Ha ocurrido un error al intentar crear tu pedidio. Intenta nuevamente más tarde.')
            throw new InternalError(error.message);
        }
    };

    public validate = async (id: string): Promise<KueskiFinalOrderStatus> => {
        // Resta a stock comprometido en caso de que la orden sea exitosa.
        try {
            const t = await this.REPOSITORY.newTransaction();
            const order = await this.REPOSITORY.getById(id, t);
            if (!order) throw new ElementNotFoundError(`Orden id ${id} no encontrada en la base de datos.`);

            order.products.forEach(async (p: any) => {
                const amountCommitted = p.OrderProductModel.amount;
                p.stockCommitted = p.stockCommitted - amountCommitted;
                await p.save({ transaction: t });
            });

            order.status = 'paid';
            await order.save({ transaction: t });

            await t.commit();

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }

        return 'accept';
    };

    public cancel = async (id: string): Promise<void> => {
        const t = await this.REPOSITORY.newTransaction();
        try {
            const order = await this.REPOSITORY.getById(id, t);
            if (!order) throw new ElementNotFoundError('Orden no encontrada en la base de datos.');

            order.products.forEach(async (p: any) => {
                const amountCommitted = p.OrderProductModel.amount;
                p.stockCommitted = p.stockCommitted - amountCommitted;
                p.stock = p.stock + amountCommitted;
                await p.save({ transaction: t });
            });

            order.status = 'cancelled';
            await order.save({transaction: t});
            await t.commit();

        } catch (error: any) {
            await t.rollback();
            console.error(error);
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };
}