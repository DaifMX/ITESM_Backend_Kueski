import BaseRouter from "./BaseRouter";

import AuthController from "../controllers/AuthController";

const controller = new AuthController();

export default class AuthRouter extends BaseRouter {
    init() {
        this.post('/login', ['PUBLIC'], controller.login);
        this.get('/logout', ['AUTHORIZED'], controller.logout);
        this.get('/isLoggedIn', ['PUBLIC'], controller.isLoggedIn);
    };
}
