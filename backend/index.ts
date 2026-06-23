import connectDB from './src/databases/db.js';
import 'dotenv/config'
import express from 'express';
import multer from 'multer';
import authRouter from './src/routes/auth.js';
import patientRouter from './src/routes/patient.js';

const app = express();
const upload = multer();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(upload.none());

const initRouter = () => {
    app.use('/api/auth', authRouter);
    app.use('/api/pasien', patientRouter)
}

const startApp = async () => {
    await connectDB();
    initRouter();
    app.listen(process.env.APP_PORT, () => {console.log("Server Nyala wak")})
}

startApp();