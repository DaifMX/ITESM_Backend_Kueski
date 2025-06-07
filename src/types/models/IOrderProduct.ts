export interface IOrderProduct {
    id: number;
    amount: number;
    subtotal: number;
    orderId: string;  
    productId: number;
};

export type IOrderProductNew = Omit<IOrderProduct, 'id'>;