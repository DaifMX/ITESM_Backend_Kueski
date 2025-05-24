import { Column, DataType, Model, Table, BelongsToMany, BelongsTo, ForeignKey, } from "sequelize-typescript";

import OrderProductModel from "./OrderProductModel";
import ProductModel from "./ProductModel";
import UserModel from "./UserModel";

import { IOrder, IOrderNew } from "../types/models/IOrder";

@Table({
    modelName: 'OrderModel',
    tableName: 'Orders',
    timestamps: true,
})

class OrderModel extends Model<IOrder, IOrderNew> implements IOrder {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare id: number;

    @Column({
        type: DataType.ENUM('pending', 'paid', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
    })
    declare status: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0,
    })
    declare total: number;

    // Relationship User
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    @ForeignKey(() => UserModel)
    declare  userId: number;
    
    @BelongsTo(() => UserModel)
    declare user: UserModel;

    // Relationship OrderItem
    @BelongsToMany(() => ProductModel, () => OrderProductModel)
    declare products: ProductModel[];
}

export default OrderModel;