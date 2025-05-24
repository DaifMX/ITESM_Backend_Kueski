export interface IOrderProduct {
    id: number;
    amount: number;
    subtotal: number;
    orderId: number;  
    productId: number;
};

export type IOrderProductNew = Omit<IOrderProduct, 'id'>;