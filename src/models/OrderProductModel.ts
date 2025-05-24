import { BelongsTo, Column, DataType, Model, Table, ForeignKey } from "sequelize-typescript";

import OrderModel from "./OrderModel";
import ProductModel from "./ProductModel";

import { IOrderProduct, IOrderProductNew } from "../types/models/IOrderProduct";

@Table({
    modelName: 'OrderProductModel',
    tableName: 'OrderProducts',
    timestamps: true,
})

class OrderProductModel extends Model<IOrderProduct, IOrderProductNew> implements IOrderProduct {
    // Basic Columns
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare id: number;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
    })
    declare amount: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare subtotal: number;

    // Order Relationship
    @BelongsTo(() => OrderModel)
    declare order: OrderModel;
    @ForeignKey(() => OrderModel)
    @Column({type: DataType.INTEGER})
    declare orderId: number;

    // Product Relationship
    @BelongsTo(() => ProductModel)
    declare product: ProductModel;
    @ForeignKey(() => ProductModel)
    @Column(({type: DataType.INTEGER}))
    declare productId: number;

    // @BeforeCreate
    // @BeforeUpdate
    // static async calcSubtotal (entry: OrderProductModel) {
    //     entry.subtotal = entry.amount * entry.product.price;
    //     await entry.save();
    // };
}

export default OrderProductModel;