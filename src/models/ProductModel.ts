import { Table, Model, Column, DataType, BelongsTo, ForeignKey, BelongsToMany } from 'sequelize-typescript';

import ProductCategoryModel from './ProductCategoryModel';
import OrderModel from './OrderModel';
import OrderProductModel from './OrderProductModel';

import { IProduct, IProductNew } from '../types/models/IProduct';

@Table({
    modelName: 'ProductModel',
    tableName: 'Products',
    timestamps: true,
    paranoid: true,
})

class ProductModel extends Model<IProduct, IProductNew> implements IProduct {
    @Column({
        type: DataType.BIGINT(),
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
    declare name: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare price: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare stock: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare imgPath: string;

    // Relationship with Category
    @ForeignKey(() => ProductCategoryModel)
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare categoryName: string;

    @BelongsTo(() => ProductCategoryModel)
    declare productCategory: ProductCategoryModel;

    // Relationship with OrderItem
    @BelongsToMany(() => OrderModel, () => OrderProductModel)
    declare orderItem: OrderModel[];
}

export default ProductModel;