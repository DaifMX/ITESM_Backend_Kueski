import { Column, DataType, Model, Table, BelongsToMany, BelongsTo, ForeignKey, } from "sequelize-typescript";
import { UUIDV4 } from "sequelize";

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
        type: DataType.UUID,
        defaultValue: UUIDV4,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare uuid: string;

    @Column({
        type: DataType.ENUM('pending', 'paid', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending',
        validate: {
            isIn: { args: [['pending', 'paid', 'expired', 'cancelled']], msg: 'Status inváldio.' },
            notNull: { msg: 'El status no puede ser nulo.' }
        }
    })
    declare status: string;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isFloat: { msg: 'El total tiene que ser un valor númerico de punto flotante.' },
            notNull: { msg: 'El total no puede ser nulo.' },
        }
    })
    declare total: number;

    // Relationship User
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    @ForeignKey(() => UserModel)
    declare userId: number;

    @BelongsTo(() => UserModel)
    declare user: UserModel;

    // Relationship OrderItem
    @BelongsToMany(() => ProductModel, () => OrderProductModel)
    declare products: ProductModel[];
}

export default OrderModel;