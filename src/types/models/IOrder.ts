import OrderProductModel from "../../models/OrderProductModel";
import ProductModel from "../../models/ProductModel";
import UserModel from "../../models/UserModel";

export interface IOrder {
    id: number;
    status: string;
    total: number;
    userId: number;
    products: ProductModel[];
    user: UserModel;
};

export interface IOrderNew {
    userId: number;
};

export interface IOrderNewReq {
    products: OrderProductModel[]
};