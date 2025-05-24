import { Request, Response } from 'express';

import ProductService from '../services/ProductService';

import ElementNotFoundError from '../errors/ElementNotFoundError';
import RuntimeError from '../errors/RuntimeError';

export default class ProductController {
    private SERVICE = new ProductService();

    public create = async (req: Request, res: Response) => {
        try {
            const entry = req.body;
            if (!entry) throw new RuntimeError('Datos no recibidos.');

            const products = await this.SERVICE.create(entry);
            return res.sendSuccess(products);

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            if (error instanceof RuntimeError) return res.sendBadRequest(error.message);
            return res.sendInternalServerError(error.message);
        }
    };

    public getAll = async (req: Request, res: Response) => {
        try {
            const category = req.query.category;
            
            let products; 
            if (!category) products = await this.SERVICE.getAll();
            else products = await this.SERVICE.getAllByCategory(category as string);
            
            return res.sendSuccess(products);

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            if (error instanceof RuntimeError) return res.sendBadRequest(error.message);
            return res.sendInternalServerError(error.message);
        }
    };

    public getById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) throw new RuntimeError('Id no recibido.');

            const product = await this.SERVICE.getById(parseInt(id));
            return res.sendSuccess(product);

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            if (error instanceof RuntimeError) return res.sendBadRequest(error.message);
            return res.sendInternalServerError(error.message);
        }
    };

    public remove = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id) throw new RuntimeError('Id no recibido.');

            const isDeleted = await this.SERVICE.remove(parseInt(id));
            return res.sendSuccess({ isDeleted: isDeleted }, 'Producto removido correctamente.');

        } catch (error: any) {
            if (error instanceof ElementNotFoundError) return res.sendNotFound(error.message);
            if (error instanceof RuntimeError) return res.sendBadRequest(error.message);
            return res.sendInternalServerError(error.message);
        }
    };
};