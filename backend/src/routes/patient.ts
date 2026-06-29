import { Router } from "express";
import { PatientsRepository } from "../repositories/patient_repository.js";
import { ExaminationsRepository } from "../repositories/examinations_repository.js";
import { PatientService } from "../services/patient_service.js";
import { PatientController } from "../controllers/patient_controller.js";
import { verifyJWTToken } from "../middleware/jwt.js";
import { verifyPosyanduAccess } from "../middleware/verifyPosyandu.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { Supabase } from "../services/supabase.js";

const patientRouter = Router();

const db = new PrismaClient();
const supabase = new Supabase();

//Repo
const patientsRepo = new PatientsRepository(db);
const examinationsRepo = new ExaminationsRepository(db);

//Service
const patientService = new PatientService(patientsRepo, examinationsRepo);

//Controller
const patientController = new PatientController(supabase, patientService);

patientRouter.use(verifyJWTToken);
patientRouter.use(verifyPosyanduAccess);
patientRouter.get('/all', (req, res) => patientController.getAll(req, res));
patientRouter.get('/all-today-patients', (req, res) => patientController.getAllTodayPatients(req, res));
patientRouter.get('/detail/:patient_id', (req, res) => patientController.getByID(req, res));
patientRouter.post('/add', (req, res) => patientController.addPatient(req, res));
patientRouter.patch('/update/:patient_id', (req, res) => patientController.updatePatient(req, res));
patientRouter.delete('/delete/:patient_id', (req, res) => patientController.deletePatient(req, res));

export default patientRouter;
