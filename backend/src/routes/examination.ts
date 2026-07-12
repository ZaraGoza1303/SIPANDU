import { Router } from "express";
import { ExaminationController } from "../controllers/examination_controller.js";
import { ExaminationsService } from "../services/examinations_service.js";
import { ExaminationsRepository } from "../repositories/examinations_repository.js";
import { StuntingResultsRepository } from "../repositories/stunting-results_repository.js";
import { PatientsRepository } from "../repositories/patient_repository.js";
import { PrismaClient } from "../generated/prisma/client.js";
import { verifyJWTToken } from "../middleware/jwt.js";
import { verifyPosyanduAccess } from "../middleware/verifyPosyandu.js";

const examinationRouter = Router();

const db = new PrismaClient();

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
examinationRouter.post('/add', (req, res) => examinationController.addExamination(req, res));
examinationRouter.post('/schedule', (req, res) => examinationController.addSchedule(req, res));
examinationRouter.patch('/update/:exam_id', (req, res) => examinationController.updateExamination(req, res));
examinationRouter.patch('/update/schedule/:exam_id', (req, res) => examinationController.updateExamSchedule(req, res));

export default examinationRouter;
