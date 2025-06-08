import ProductRepository from "../repositories/ProductRepository";

import ProductModel from "../models/ProductModel";
import { IProductNew } from './../types/models/IProduct';

import ElementNotFoundError from "../errors/ElementNotFoundError";
import { UniqueConstraintError, ValidationError } from "sequelize";
import InternalError from "../errors/InternalError";
import RuntimeError from "../errors/RuntimeError";

export default class ProductService {
    private readonly REPOSITORY = new ProductRepository();

    public create = async (entry: IProductNew): Promise<ProductModel> => {
        try {
            const user = await this.REPOSITORY.create(entry);
            return user;

        } catch (error: any) {
            if (error instanceof UniqueConstraintError) {
                try {
                    const restoredProduct = await this.restore(error.fields.name as string);
                    return restoredProduct;
                } catch (error: any) {
                    throw error;
                }
            }
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

            const hasCommitedStock = product.stockCommitted > 0;
            if(hasCommitedStock) throw new RuntimeError('No se pudo eliminar al producto ya que cuenta con stock comprometido en alguna orden.');

            await product.destroy({ transaction });
            await transaction.commit();

            return true;
        } catch (error: any) {
            await transaction.rollback();

            if (error instanceof ElementNotFoundError) throw error;
            throw new InternalError(error.message);
        }
    };

    public restore = async (name: string): Promise<ProductModel> => {
        const transaction = await this.REPOSITORY.newTransaction();
        try {
            const product = await this.REPOSITORY.getByName(name, transaction, false);

            if (!product) throw new ElementNotFoundError('El producto que estas intentando restaurar no existe.');
            if (!product.deletedAt) throw new RuntimeError(`El producto con el nombre ${name} ya existe en la base de datos.`);

            await product.restore({ transaction });
            await product.save({ transaction });
            await transaction.commit();

            return product;

        } catch (error: any) {
            await transaction.rollback();
            if (error instanceof ElementNotFoundError) throw error;
            if (error instanceof RuntimeError) throw error;
            throw new InternalError(error.message);
        }
    };
}