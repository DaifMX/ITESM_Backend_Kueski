import ProductModel from '../models/ProductModel';

import timestamps from '../consts/timestamps';

import { BulkCreateOptions, Transaction } from 'sequelize';
import { IProduct, IProductNew } from '../types/models/IProduct';

import InternalError from '../errors/InternalError';

export default class ProductRepository {
    private readonly MODEL = ProductModel;

    private getSequelize = () => {
        if (!this.MODEL.sequelize) throw new InternalError('Error en la instancia de sequelize');
        return this.MODEL.sequelize;
    };

    public newTransaction = async (): Promise<Transaction> => {
        return await this.getSequelize().transaction();
    };

    public create = async (entry: IProductNew, transaction?: Transaction): Promise<ProductModel> => {
        return await this.MODEL.create(
            entry,
            { transaction }
        );
    };

    public bulkCreate = async (entries: IProductNew[], options?: BulkCreateOptions<IProduct> | undefined): Promise<ProductModel[]> => {
        return await this.MODEL.bulkCreate(entries, { ...options });
    };

    public getAll = async (transaction?: Transaction): Promise<ProductModel[]> => {
        return await this.MODEL.findAll({
            order: [['id', 'ASC']],
            transaction
        });
    };

    public getAllByCategory = async (category: string, transaction?: Transaction): Promise<ProductModel[]> => {
        return await this.MODEL.findAll({
            where: { category },
            transaction
        });
    };

    public getById = async (id: number, transaction?: Transaction): Promise<ProductModel | null> => {
        return await this.MODEL.findByPk(id, {
            attributes: { exclude: [...timestamps, 'password'] },
            transaction
        });
    };
}