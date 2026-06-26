import connectDB from './src/databases/db.js';
import express from 'express';
import helmet from 'helmet';
import multer from 'multer';
import authRouter from './src/routes/auth.js';
import patientRouter from './src/routes/patient.js';
import examinationRouter from './src/routes/examination.js';
import dashboardRouter from './src/routes/dashboard.js';
import dotenv from 'dotenv';
import cors from 'cors';

const app = express();
const upload = multer();

const corsOptions = {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With'
    ],
    credentials: true,
}

dotenv.config();
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '5mb' }));

const initRouter = () => {
    app.use('/api/auth', authRouter);
    app.use('/api/pasien', upload.single('picture'), patientRouter);
    app.use('/api/pemeriksaan', examinationRouter);
    app.use('/api/dashboard', dashboardRouter);
}

const startApp = async () => {
    await connectDB();
    initRouter();
    app.listen(process.env.APP_PORT, () => {console.log("Server Nyala wak")})
}

startApp();
