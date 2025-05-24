export interface IProduct {
    id: number;
    name: string;
    price: number;
    category: string
    description: string;
    stock: number;
    imgPath: string;
};

export type IProductNew = Omit<IProduct, 'id' | 'imgPath'>;