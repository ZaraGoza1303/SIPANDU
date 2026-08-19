import connectDB from './src/databases/db.js';
import express from 'express';
import helmet from 'helmet';
import authRouter from './src/routes/auth.js';
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

const app = express();

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'https://mbgsipandu.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'X-Requested-With',
        'ngrok-skip-browser-warning',
        'Origin'
    ],
    credentials: true,
}

app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.set("trust proxy", 1);

const initRouter = () => {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api/auth', authRouter);
    app.use('/api/pasien', patientRouter);
    app.use('/api/pemeriksaan', examinationRouter);
    app.use('/api/dashboard', dashboardRouter);
}

const startApp = async () => {
    await connectDB();
    initRouter();
    const PORT = process.env.PORT || process.env.APP_PORT || 8000;
    app.listen(Number(PORT), '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
}

startApp();
