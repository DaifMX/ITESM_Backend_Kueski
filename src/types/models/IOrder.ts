import OrderItemModel from "../../models/OrderItemModel";
import UserModel from "../../models/UserModel";

export interface IOrder {
    id: bigint;
    status: string;
    total: number;
    items: OrderItemModel[];
    user: UserModel;
};

export type IOrderNew = Omit<IOrder, 'id'>;