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
        primaryKey: true,
        allowNull: false,
        unique: true,
    })
    declare phoneNumber: bigint;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare password: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    declare lastName: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'USER',
        validate: {
            isIn: { msg: 'Solo se pertimen roles ADMIN y USER.', args: [['ADMIN', 'USER']] },
        }
    })
    declare role: 'ADMIN' | 'USER'; //Rol del usuario (usuario o administrador)

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