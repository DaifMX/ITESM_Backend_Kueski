import BaseRouter from "./BaseRouter"

import ProductController from "../controllers/ProductController";
import uploadProductImage from "../middlewares/upload-product-img";

const controller = new ProductController();

export default class ProductRouter extends BaseRouter { 
    init() {
        this.get('/getAll', ['PUBLIC'], controller.getAll);
        this.get('/getById/:id', ['PUBLIC'], controller.getById);
        this.post('/create', ['ADMIN'], controller.create);
        this.patch('/uploadImg/:id', ['ADMIN'], uploadProductImage.single('image'), controller.uploadImg);
        this.patch('/updateStock/:id', ['ADMIN'], controller.updateStock);
        this.delete('/remove/:id', ['ADMIN'], controller.remove);
    };
}