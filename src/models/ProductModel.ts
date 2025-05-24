import { AfterCreate, Table, Model, Column, DataType, BelongsToMany} from 'sequelize-typescript';

import OrderModel from './OrderModel';
import OrderProductModel from './OrderProductModel';

import { IProduct, IProductNew } from '../types/models/IProduct';

@Table({
    modelName: 'ProductModel',
    tableName: 'Products',
    timestamps: true,
})

class ProductModel extends Model<IProduct, IProductNew> implements IProduct {
    @Column({
        type: DataType.INTEGER(),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare id: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    declare name: string;

    @Column({
        type: DataType.FLOAT(),
        allowNull: false,
    })
    declare price: number;

    @Column({
        type: DataType.ENUM(
            'cargadores',
            'escapes',
            'filtros',
            'frenos',
            'interiores',
            'exteriores',
            'rines',
            'suspension'
        ),
        allowNull: false,
    })
    declare category: string;

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
        allowNull: true,
        unique: true,
    })
    declare imgPath: string;

    // Relationship with OrderItem
    @BelongsToMany(() => OrderModel, () => OrderProductModel)
    declare orderItem: OrderModel[];

    @AfterCreate
    static async updateImgPath(product: ProductModel) {
        product.imgPath = `/products/${product.id}.webp`;
        await product.save();
    };
}

export default ProductModel;