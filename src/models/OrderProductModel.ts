import { Column, DataType, Model, Table, ForeignKey } from "sequelize-typescript";

import OrderModel from "./OrderModel";
import ProductModel from "./ProductModel";

import { IOrderItem, IOrderItemNew } from "../types/models/IOrderItem";

@Table({
    modelName: 'OrderItemModel',
    tableName: 'OrderItems',
    timestamps: true,
})

class OrderProductModel extends Model<IOrderItem, IOrderItemNew> implements IOrderItem {
    // Basic Columns
    @Column({
        type: DataType.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare id: bigint;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare amount: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare subtotal: number;

    // Order Relationship
    @ForeignKey(() => OrderModel)
    @Column({type: DataType.BIGINT})
    declare orderId: bigint;

    // @BelongsTo(() => OrderModel, { as: 'order' })
    // declare order: OrderModel;

    // Product Relationship
    @ForeignKey(() => ProductModel)
    @Column(({type: DataType.BIGINT}))
    declare productId: bigint;

    // @HasOne(() => ProductModel)
    // declare product: ProductModel;
}

export default OrderProductModel;