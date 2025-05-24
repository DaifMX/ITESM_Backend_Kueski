import ProductRepository from "../repositories/ProductRepository";

const attemptSetup = async (attempt: boolean) => {
    try {
        const productRepository = new ProductRepository();
        const product = await productRepository.getById(1);
        if (!product && attempt) {
            // Hardcoded entries so I dont have to reapply them everytime I have to restart the database. I am just being lazy here.
            await productRepository.bulkCreate([
                {
                    name: "Kit Frenos Alcon 6 Pistones",
                    price: 68000,
                    category: "frenos",
                    description: "Sistema de frenado racing con discos ventilados de 380mm y pinzas monoblock para máxima potencia de frenado.",
                    stock: 12
                },
                {
                    name: "Kit Suspensión Ohlins DFV",
                    price: 38000,
                    category: "suspension",
                    description: "Suspensión deportiva ajustable con tecnología Dual Flow Valve, perfecta para track days y uso en carretera.",
                    stock: 10
                },
                {
                    name: "Asientos Recaro Sportster CS",
                    price: 42000,
                    category: "interiores",
                    description: "Asientos deportivos con ajuste eléctrico, sistema de calefacción y estructura ligera de magnesio para competición.",
                    stock: 10
                },
                {
                    name: "Filtro Aire HKS Super Hybrid",
                    price: 7500,
                    category: "filtros",
                    description: "Filtro de aire de alta circulación con malla de acero inoxidable y capacidad de lavado para mayor durabilidad.",
                    stock: 10
                },
                {
                    name: "APR Performance GTC-300 Carbon Fiber Spoiler",
                    price: 40000,
                    category: "exteriores",
                    description: "Alerón aerodinámico de fibra de carbono diseñado para ofrecer estabilidad a altas velocidades y mayor carga aerodinámica. Presenta un ángulo de ala ajustable y construcción ligera.",
                    stock: 10
                },
                {
                    name: "Turbo BorgWarner EFR 7670",
                    price: 45000,
                    category: "cargadores",
                    description: "Turbo de alta respuesta con carcasa de titanio-aluminio, ideal para motores 2.0L a 3.5L que buscan 400-700 HP.",
                    stock: 10
                },
                {
                    name: "Rines BBS LM Forged",
                    price: 5000,
                    category: "rines",
                    description: "Rines de aleación forjada ultralivianos con diseño de doble radio, mejoran la disipación de calor y el estilo deportivo.",
                    stock: 10
                },
                {
                    name: "Escape Titanio Akrapovič Evolution",
                    price: 52000,
                    category: "escapes",
                    description: "Sistema de escape completo en titanio con sonido deportivo y reducción de peso de 40%, incluye downpipe.",
                    stock: 10
                }
            ], { individualHooks: true });
        }

    } catch (error) {
        console.error(error);
    }
}

export default attemptSetup;