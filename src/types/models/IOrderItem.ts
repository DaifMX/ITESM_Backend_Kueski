export interface IOrderItem {
    id: bigint;
    amount: number;
    subtotal: number;
    orderId: bigint;  
    productId: bigint;
};

export type IOrderItemNew = Omit<IOrderItem, 'id'>;