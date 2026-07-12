import { Router } from "express";
import { PatientsRepository } from "../repositories/patient_repository.js";
import { ExaminationsRepository } from "../repositories/examinations_repository.js";
import { PatientService } from "../services/patient_service.js";
import { PatientController } from "../controllers/patient_controller.js";
import { verifyJWTToken, authorizeRole } from "../middleware/jwt.js";
import { verifyPosyanduAccess } from "../middleware/verifyPosyandu.js";
import prisma from "../databases/prisma.js";
import { Supabase } from "../services/supabase.js";

const patientRouter = Router();

const db = prisma;
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
patientRouter.get('/all', authorizeRole('admin', 'bidan', 'kader'), (req, res) => patientController.getAll(req, res));
patientRouter.get('/all-today-patients', authorizeRole('admin', 'bidan', 'kader'), (req, res) => patientController.getAllTodayPatients(req, res));
patientRouter.get('/detail/:patient_id', authorizeRole('admin', 'bidan', 'kader'), (req, res) => patientController.getByID(req, res));
patientRouter.post('/add', authorizeRole('admin', 'kader'), (req, res) => patientController.addPatient(req, res));
patientRouter.patch('/update/:patient_id', authorizeRole('admin', 'kader'), (req, res) => patientController.updatePatient(req, res));
patientRouter.delete('/delete/:patient_id', authorizeRole('admin'), (req, res) => patientController.deletePatient(req, res));

export default patientRouter;
