import ProductRepository from "../repositories/ProductRepository";

import ProductModel from "../models/ProductModel";
import { IProductNew } from './../types/models/IProduct';

import ElementNotFoundError from "../errors/ElementNotFoundError";
import { ValidationError } from "sequelize";
import InternalError from "../errors/InternalError";

export default class ProductService {
    private readonly REPOSITORY = new ProductRepository();

    public create = async (entry: IProductNew): Promise<ProductModel> => {
        try {
            const user = await this.REPOSITORY.create(entry);
            return user;

        } catch (error: any) {
            if (error instanceof ValidationError) throw error;
            throw new InternalError(error.message);
        }
    };

    public getAll = async (category?: string): Promise<ProductModel[]> => {
        try {
            const orders = category ? await this.REPOSITORY.getAllByCategory(category) : await this.REPOSITORY.getAll();
            if (!orders) throw new ElementNotFoundError('Productos no encontrados en la base de datos.');

            return orders;

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public getById = async (id: number): Promise<ProductModel> => {
        try {
            const order = await this.REPOSITORY.getById(id);
            if (!order) throw new ElementNotFoundError(`Producto con el id ${id} no encontrado en la base de datos.`);

            return order;
        } catch (error: any) {
            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public remove = async (id: number): Promise<boolean> => {
        const transaction = await this.REPOSITORY.newTransaction();
        try {
            const product = await this.REPOSITORY.getById(id, transaction);
            if (!product) throw new ElementNotFoundError(`Producto con el id ${id} no encontrado en la base de datos.`);

            await product.destroy({ transaction });
            await transaction.commit();

            return true;
        } catch (error: any) {
            await transaction.rollback();

            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };
}