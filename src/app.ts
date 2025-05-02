import './utility/common-type-imports';

import cors from 'cors';
import cookieParser from 'cookie-parser';
import express from 'express';

import corsConfig from './config/cors_config';
import db from './models';

(async function () {
    try {
        const app = express();
        const PORT = process.env.EXPRESS_PORT;

        // ========Sequelize======== \\
        console.log('Connecting to postgres...');
        await db.PostgresSequelize.sync({ alter: true, force: true });
        console.log('Connection successful!');

        // ========Middlewares======== \\
        app.use(express.json()); // Habilitar respuestas de tipo json para la aplicación.
        app.use(express.static('./src/public')); // Indicar la carptea publica de la aplicación.
        app.use(express.urlencoded({ extended: true }));

        app.use(cors(corsConfig)); // CORS
        app.use(cookieParser());

        app.listen(PORT, () => console.log(`Server listening on port ${PORT}\nDone!`));

        // ========Rutas======== \\
        // app.use("/api/auth", new AuthRouter().getRouter());
        // app.use("/api/order", new OrderRouter().getRouter());
        // app.use("/api/orderItem", new OrderItemRouter().getRouter());
        // app.use("/api/product", new ProductRouter().getRouter());
        // app.use("/api/product-category", new ProductCategoryRouter().getRouter());
        // app.use("/api/user", new UserRouter().getRouter());

    } catch (error: any) {
        console.error(error);
    }
})();