import BaseRouter from "./BaseRouter"

import ProductController from "../controllers/ProductController";

const controller = new ProductController();

export default class ProductRouter extends BaseRouter {
    init() {
        this.get('/getAll', ['PUBLIC'], controller.getAll);
        this.get('/getById/:id', ['PUBLIC'], controller.getById);
        this.post('/create', ['ADMIN'], controller.create);
        this.delete('/remove', ['ADMIN'], controller.remove);
    };
}