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
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isFloat: { msg: 'La cantidad tiene que ser un valor númerico de punto flotante.' },
            min: { args: [1], msg: '' },
            notNull: { msg: 'La cantidad no puede ser nula.' }
        }
    })
    declare amount: number; // CANTIDAD A COMPRAR DE X PRODUCTO

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        validate: {
            isFloat: { msg: 'El subtotal tiene que ser un valor númerico de punto flotante.' },
            min: { args: [1], msg: '' },
            notNull: { msg: 'La cantidad no puede ser nula.' },
        }
    })
    declare subtotal: number; // SUBTOTAL DE LA ORDEN

    // Order Relationship
    @BelongsTo(() => OrderModel)
    declare order: OrderModel;
    @ForeignKey(() => OrderModel)
    @Column({ type: DataType.INTEGER })
    declare orderId: number;

    // Product Relationship
    @BelongsTo(() => ProductModel)
    declare product: ProductModel;
    @ForeignKey(() => ProductModel)
    @Column(({ type: DataType.INTEGER }))
    declare productId: number;
}

export default OrderProductModel;