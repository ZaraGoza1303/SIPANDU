import connectDB from './src/databases/db.js';
import express from 'express';
import multer from 'multer';
import authRouter from './src/routes/auth.js';
import patientRouter from './src/routes/patient.js';
import dotenv from 'dotenv';

const app = express();
const upload = multer();
dotenv.config();

app.use(express.json());

const initRouter = () => {
    app.use('/api/auth', authRouter);
    app.use('/api/pasien', upload.single('picture'), patientRouter)
}

const startApp = async () => {
    await connectDB();
    initRouter();
    app.listen(process.env.APP_PORT, () => {console.log("Server Nyala wak")})
}

startApp();