export interface IProduct {
    id: bigint;
    name: string;
    price: number;
    description: string;
    stock: number;
    categoryName: string
    imgPath: string;
}

export type IProductNew = Omit<IProduct, 'id'>;