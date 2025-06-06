import { Table, Model, Column, DataType, HasMany, BeforeCreate, BeforeUpdate } from "sequelize-typescript";

import bcrypt from 'bcrypt';

import OrderModel from "./OrderModel";

import { IUser, IUserNew } from '../types/models/IUser';

@Table({
    modelName: "UserModel",
    tableName: "Users",
    timestamps: true,
})

class UserModel extends Model<IUser, IUserNew> implements IUser {
    @Column({
        type: DataType.INTEGER(),
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true,
    })
    declare id: number;

    @Column({
        type: DataType.BIGINT(),
        allowNull: false,
        unique: { name: 'unique_phoneNumber', msg: 'Ya existe un usuario registrado con este número telefónico.' },
        validate: {
            is: { args: [/^\d{10}$/], msg: 'El número telefónico debe tener exactamente 10 dígitos numéricos.' },
            notNull: { msg: 'El número telefónico no puede ser nulo.' },
        }
    })
    declare phoneNumber: bigint;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            min: { args: [6], msg: 'La contraseña tiene que ser mínimo de 6 carácteres.' },
            notNull: { msg: 'La contraseña no puede ser nula.' },
        }
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            is: {
                args: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/,
                msg: 'El nombre ingresado cuenta con carácteres inválidos.'
            },
            notNull: { msg: 'El nombre no puede ser nulo' },
        }
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        validate: {
            is: {
                args: /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+(?: [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)*$/,
                msg: 'El nombre ingresado cuenta con carácteres inválidos.'
            },
            notNull: { msg: 'El apellido no puede ser nulo' },
        }
    })
    declare lastName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'USER',
        validate: {
            isIn: { msg: 'Solo se pertimen roles ADMIN y USER.', args: [['ADMIN', 'USER']] },
            notNull: { msg: 'El rol no puede ser nulo' }
        }
    })
    declare role: 'ADMIN' | 'USER'; //Rol del usuario (usuario o administrador)

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare refreshToken: string | null;

    // Relationship Order
    @HasMany(() => OrderModel)
    declare orders: OrderModel[];

    @BeforeCreate
    @BeforeUpdate
    static encrypt = async (m: UserModel) => {
        if (m.password && m.changed('password')) {
            const salt = await bcrypt.genSalt(12);
            m.password = await bcrypt.hash(m.password, salt);
        }
    };

    public isPasswordValid = async (password: string) => {
        return await bcrypt.compare(password, this.password);
    };
}

export default UserModel;