import { Column, DataType, Model, Table, BelongsToMany, BelongsTo, ForeignKey } from "sequelize-typescript";

import OrderProductModel from "./OrderProductModel";
import ProductModel from "./ProductModel";
import UserModel from "./UserModel";

import { IOrder, IOrderNew } from "../types/models/IOrder";

@Table({
    tableName: 'OrderModel',
    modelName: 'Orders',
    timestamps: true,
})

class OrderModel extends Model<IOrder, IOrderNew> implements IOrder {
    @Column({
        type: DataType.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare id: bigint;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare status: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare total: number;

    // Relationship User
    @ForeignKey(() => UserModel)
    declare userPhoneNumber: bigint;

    @BelongsTo(() => UserModel)
    declare user: UserModel;

    // Relationship OrderItem
    @BelongsToMany(() => ProductModel, () => OrderProductModel)
    declare items: ProductModel[];
}

export default OrderModel;