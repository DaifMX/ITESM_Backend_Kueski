import BaseRouter from "./BaseRouter"

import OrderController from "../controllers/OrderController";

const controller = new OrderController();

export default class OrderRouter extends BaseRouter {
    init() {
        this.get('/getAll', ['AUTHORIZED'], controller.getAll);
        this.get('/getById/:id', ['AUTHORIZED'], controller.getById);
        this.post('/create', ['AUTHORIZED'], controller.create);
        // this.patch('/pushItem', ['AUTHORIZED'], controller.pushItem);
    };
}