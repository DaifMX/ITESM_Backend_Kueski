import OrderProductModel from "../models/OrderProductModel"; 

import { Transaction } from "sequelize";

import { IOrderProductNew } from "../types/models/IOrderProduct";

import InternalError from "../errors/InternalError";

export default class OrderProductRepository {
    private MODEL = OrderProductModel;

    private getSequelize = () => {
        if (!this.MODEL.sequelize) throw new InternalError('Error en la instancia de sequelize');
        return this.MODEL.sequelize;
    };

    public newTransaction = async (): Promise<Transaction> => {
        return await this.getSequelize().transaction();
    };

    public getById = async (id: number): Promise<OrderProductModel | null> => {
        return await this.MODEL.findByPk(id);
    };  

    public create = async (entry: IOrderProductNew, transaction?: Transaction): Promise<OrderProductModel> => {
        return await this.MODEL.create(entry, { transaction });
    };
}