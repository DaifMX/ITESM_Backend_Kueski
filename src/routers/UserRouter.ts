import BaseRouter from "./BaseRouter"

import UserController from "../controllers/UserController";

const controller = new UserController();

export default class UserRouter extends BaseRouter {
    init() {
        this.post('/create', ['PUBLIC'], controller.create);
        this.get('/getAll', ['ADMIN'], controller.getAll);
        this.get('/getById/:id', ['AUTHORIZED'], controller.getById);
        this.delete('/remove/:id', ['ADMIN'], controller.remove);
    };
}