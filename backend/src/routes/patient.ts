import { Router } from "express";
import { PatientsRepository } from "../repositories/patient_repository.js";
import { PatientService } from "../services/patient_service.js";
import { PatientController } from "../controllers/patient_controller.js";
import { verifyJWTToken } from "../middleware/jwt.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { Supabase } from "../services/supabase.js";
import { ExaminationsRepository } from "../repositories/examinations_repository.js";
import { ExaminationsService } from "../services/examinations_service.js";
import { StuntingResultsRepository } from "../repositories/stunting-results_repository.js";

const patientRouter = Router();

const db = new PrismaClient();
const supabase = new Supabase();

//Repo
const stuntingResultsRepo = new StuntingResultsRepository(db);
const examinationsRepo = new ExaminationsRepository(db);
const patientsRepo = new PatientsRepository(db); 

//Service
const examinationsService = new ExaminationsService(db, patientsRepo, stuntingResultsRepo, examinationsRepo);
const patientService = new PatientService(patientsRepo, examinationsRepo);

//Controller
const patientController = new PatientController(supabase, patientService, examinationsService);

patientRouter.use(verifyJWTToken);
patientRouter.get('/all', (req, res) => patientController.getAll(req, res));
patientRouter.get('/all-today-patients', (req, res) => patientController.getAllTodayPatients(req, res));
patientRouter.get('/detail', (req, res) => patientController.getByID(req, res));
patientRouter.post('/add', (req, res) => patientController.addPatient(req, res));
patientRouter.post('/add-examination', (req, res) => patientController.addPatientExamination(req, res));
patientRouter.patch('/update', (req, res) => patientController.updatePatient(req, res));
patientRouter.patch('/update-examination', (req, res) => patientController.updatePatientExamination(req, res));
patientRouter.delete('/delete', (req, res) => patientController.deletePatient(req, res));

export default patientRouter;