import RuntimeError from "../errors/RuntimeError";

const allowedOrigins = [
    "http://localhost:3030",
    "https://daif-201.ddns.me",
    "http://100.97.198.82:3030"
];

const corsConfig = {
    origin: (origin: any, callback: any) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new RuntimeError('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true
};

export default corsConfig;
