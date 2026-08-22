import connectDB from './src/databases/db.js';
import express from 'express';
import authRouter from './src/routes/auth.js';
import userRouter from './src/routes/user.js';
import patientRouter from './src/routes/patient.js';
import examinationRouter from './src/routes/examination.js';
import dashboardRouter from './src/routes/dashboard.js';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import path from 'node:path';
import YAML from 'yamljs';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'https://mbgsipandu.vercel.app',
    process.env.FRONTEND_URL,
    process.env.CORS_ORIGIN,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (
            allowedOrigins.includes(origin) ||
            /^http:\/\/localhost(:\d+)?$/.test(origin) ||
            /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
        ) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
        'ngrok-skip-browser-warning'
    ],
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.set("trust proxy", 1);

const initRouter = () => {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api/auth', authRouter);
    app.use('/api/user', userRouter);
    app.use('/api/pasien', patientRouter);
    app.use('/api/pemeriksaan', examinationRouter);
    app.use('/api/dashboard', dashboardRouter);
}

const startApp = async () => {
    await connectDB();
    initRouter();
    const PORT = process.env.APP_PORT || process.env.PORT || 8000;
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startApp();
