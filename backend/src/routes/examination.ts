import { Router } from "express";
import { ExaminationController } from "../controllers/examination_controller.js";
import { ExaminationsService } from "../services/examinations_service.js";
import { ExaminationsRepository } from "../repositories/examinations_repository.js";
import { StuntingResultsRepository } from "../repositories/stunting-results_repository.js";
import { PatientsRepository } from "../repositories/patient_repository.js";
import prisma from "../databases/prisma.js";
import { verifyJWTToken, authorizeRole } from "../middleware/jwt.js";
import { verifyPosyanduAccess } from "../middleware/verifyPosyandu.js";

const examinationRouter = Router();

const db = prisma;

//Repo
const stuntingResultsRepo = new StuntingResultsRepository(db);
const examinationsRepo = new ExaminationsRepository(db);
const patientsRepo = new PatientsRepository(db);

//Service
const examinationsService = new ExaminationsService(db, patientsRepo, stuntingResultsRepo, examinationsRepo);

//Controller
const examinationController = new ExaminationController(examinationsService);

examinationRouter.use(verifyJWTToken);
examinationRouter.use(verifyPosyanduAccess);
examinationRouter.get('/all', authorizeRole('admin', 'bidan'), (req, res) => examinationController.getAllExaminations(req, res));
examinationRouter.get('/jadwal', authorizeRole('admin', 'bidan', 'kader'), (req, res) => examinationController.getAllSchedules(req, res));
examinationRouter.post('/add', authorizeRole('admin', 'bidan', 'kader'), (req, res) => examinationController.addExamination(req, res));
examinationRouter.post('/schedule', authorizeRole('admin', 'kader'), (req, res) => examinationController.addSchedule(req, res));
examinationRouter.patch('/update/:exam_id', authorizeRole('admin', 'bidan'), (req, res) => examinationController.updateExamination(req, res));
examinationRouter.patch('/update/schedule/:exam_id', authorizeRole('admin', 'kader'), (req, res) => examinationController.updateExamSchedule(req, res));
examinationRouter.patch('/jadwal/:id/selesai', authorizeRole('admin'), (req, res) => examinationController.markAsCompleted(req, res));
examinationRouter.get('/today-pending-count', authorizeRole('admin', 'bidan', 'kader'), (req, res) => examinationController.getTodayPendingCount(req, res));
examinationRouter.get('/patient/:patient_id', authorizeRole('admin', 'bidan', 'kader'), (req, res) => examinationController.getPatientExaminationLog(req, res));

export default examinationRouter;
