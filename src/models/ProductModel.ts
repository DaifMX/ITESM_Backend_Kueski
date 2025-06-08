import { AfterCreate, Table, Model, Column, DataType, BelongsToMany } from 'sequelize-typescript';

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
        unique: { name: 'unique_name', msg: 'Ya existe un producto registrado con este nombre.' },
        validate: {
            notNull: { msg: 'El nombre del producto no puede ser nulo.' }
        }
    })
    declare name: string;

    @Column({
        type: DataType.FLOAT(),
        allowNull: false,
        validate: {
            isFloat: { msg: 'El precio del producto tiene que ser un valor númerico de punto flotante.' },
            notNull: { msg: 'El precio del producto no puede ser nulo.' }
        }
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
        validate: {
            isIn: { args: [['cargadores', 'escapes', 'filtros', 'frenos', 'interiores', 'exteriores', 'rines', 'suspension']], msg: 'Categoría invalida.' },
            notNull: { msg: 'La categoría no puede ser nula.' },
        },
    })
    declare category: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            notNull: { msg: 'La descripción no puede ser nula.' }
        }
    })
    declare description: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isInt: { msg: 'El stock tiene que ser un valor númerico entero.' },
            min: { args: [0], msg: 'El stock no puede ser menor a 0' },
            notNull: { msg: 'El stock no puede ser nulo.' },
        }
    })
    declare stock: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isInt: { msg: 'El stock comprometido tiene que ser un valor númerico entero.' },
            min: { args: [0], msg: 'El stock comprometido no puede ser menor a 0' },
            notNull: { msg: 'El stock comprometido no puede ser nulo.' },
        }
    })
    declare stockCommitted: number;

    @Column({
        type: DataType.STRING,
        allowNull: true,
        unique: true,
    })
    declare imgPath: string;

    // Relationship with OrderItem
    @BelongsToMany(() => OrderModel, () => OrderProductModel)
    declare orders: OrderModel[];

    @AfterCreate
    static async updateImgPath(product: ProductModel) {
        product.imgPath = `/public/products/${product.name}.webp`;
        await product.save();
    };
}

export default ProductModel;
