import multer from 'multer';
import fs from 'fs';
import path from 'path';
import RuntimeError from '../errors/RuntimeError';
import ProductRepository from '../repositories/ProductRepository';
import ElementNotFoundError from '../errors/ElementNotFoundError';

// Check for dir
const uploadDir = path.join(__dirname, '..', '..', 'public', 'products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (_req: any, _file: any, cb) => {
        return cb(null, uploadDir);
    },
    filename: async (req: any, file: any, cb: any) => {
        try {
            if (!req.params.id) throw new RuntimeError('Nombre no recibido.');

            const repo = new ProductRepository();
            const product = await repo.getById(parseInt(req.params.id));
            if (!product) throw new ElementNotFoundError('Producto no encontrado en la base de datos.');

            const ext = path.extname(file.originalname).toLowerCase();
            return cb(null, `${product.name}${ext}`);
        } catch (err) {
            return cb(err);
        }
    }
});

// File filter: only jpeg/jpg
const fileFilter = (_req: any, file: any, cb: any) => {
    const allowedExt = /\.(?:webp)$/i;
    if (allowedExt.test(file.originalname) && /^image\/webp$/.test(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes tipo .webp'), false);
    }
};

// Optional size limit: 5MB
const limits = { fileSize: 12 * 1024 * 1024 };

const uploadProductImage = multer({ storage, fileFilter, limits });

export default uploadProductImage;