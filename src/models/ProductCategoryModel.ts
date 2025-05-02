import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";

import ProductModel from "./ProductModel";

import { IProductCategory } from "../types/models/IProductCategory";

@Table({
    modelName: 'ProductCategoryModel',
    tableName: 'ProductCategories',
    timestamps: true,
})

class ProductCategoryModel extends Model<IProductCategory> implements IProductCategory {
    @Column({
        type: DataType.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare name: string;

    @HasMany(()=> ProductModel)
    declare products: ProductModel[];
}

export default ProductCategoryModel;