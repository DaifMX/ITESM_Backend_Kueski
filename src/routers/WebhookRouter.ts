import WebhookController from "../controllers/WebhookController";
import BaseRouter from "./BaseRouter";

const controller = new WebhookController();

export default class WebhookRouter extends BaseRouter {
    init() {
        this.post('/', ['PUBLIC'], controller.webhook);
    };
}