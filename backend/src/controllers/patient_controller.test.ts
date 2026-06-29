import type { Request, Response } from "express";
import { PatientController } from "./patient_controller.js";
import { describe, beforeEach, vi, it, expect, type Mock, } from "vitest"
import { AppError } from "../utils/error.js";

describe('getAll', () => {
    let mockPatientService: any;
    let mockISupabase: any;
    let controller: PatientController;
    let statusMock: Mock;
    let jsonMock: Mock;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        mockISupabase = {
            uploadFile: vi.fn()
        }

        mockPatientService = {
            getAll: vi.fn()
        }


        controller = new PatientController(mockISupabase, mockPatientService)

        mockReq = {
            user: {posyandu_id: 'posyandu-123'} as any,
            query: {},
            params: {},
        }

        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({json: jsonMock})
        mockRes = {
            status: statusMock
        }
    })

    it('Return data pasien tanpa search', async () => {
            const fakePatient = [{id: 1, name: "farhan"}];
            mockPatientService.getAll.mockResolvedValue(fakePatient);

            await controller.getAll(mockReq as Request, mockRes as Response)

            expect(mockPatientService.getAll).toHaveBeenCalledWith('posyandu-123', 1, 10, null)

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: fakePatient,
                })
            )
    })

    it('Return data pasien dengan filter search', async () => {
        const fakePatient = [{id: 1, name: "farhan"}];
        mockPatientService.getAll.mockResolvedValue(fakePatient);

        mockReq.query = {search: 'far'}

        await controller.getAll(mockReq as Request, mockRes as Response)

        expect(mockPatientService.getAll).toHaveBeenCalledWith('posyandu-123', 1, 10, 'far')
        
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: fakePatient,
            })
        )
    })

    it('Return unexpected internal error', async () => {
        const err = new Error("Internal server Error");
        mockPatientService.getAll.mockRejectedValue(err);

        await controller.getAll(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
            })
        )
    })

    it('Return prisma database error', async () => {
        const err = new AppError("Data not found", 404);

        mockPatientService.getAll.mockRejectedValue(err);

        await controller.getAll(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
            })
        )
    })
})

describe('getAllTodayPatients', () => {
    let mockPatientService: any;
    let mockISupabase: any;
    let controller: PatientController;
    let statusMock: Mock;
    let jsonMock: Mock;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        mockISupabase = {
            uploadFile: vi.fn()
        }

        mockPatientService = {
            getAll: vi.fn(),
            getAllTodayPatients: vi.fn()
        }

        controller = new PatientController(mockISupabase, mockPatientService)

        mockReq = {
            user: {posyandu_id: 'posyandu-123'} as any,
            query: {},
            params: {},
        }

        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({json: jsonMock})
        mockRes = {
            status: statusMock
        }
    })

    it('Return data pemeriksaan pasien hari ini tanpa search', async () => {
            const fakePatient = [{id: 1, name: "farhan"}];
            mockPatientService.getAllTodayPatients.mockResolvedValue(fakePatient);

            await controller.getAllTodayPatients(mockReq as Request, mockRes as Response)

            expect(mockPatientService.getAllTodayPatients).toHaveBeenCalledWith('posyandu-123', 1, 10, null)

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: fakePatient,
                })
            )
    })

    it('Return data pemeriksaan pasien hari ini dengan filter search', async () => {
        const fakePatient = [{id: 1, name: "farhan"}];
        mockPatientService.getAllTodayPatients.mockResolvedValue(fakePatient);

        mockReq.query = {search: 'far'}

        await controller.getAllTodayPatients(mockReq as Request, mockRes as Response)

        expect(mockPatientService.getAllTodayPatients).toHaveBeenCalledWith('posyandu-123', 1, 10, 'far')
        
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: fakePatient,
            })
        )
    })

    it('Return unexpected internal error', async () => {
        const err = new Error("Internal server Error");
        mockPatientService.getAllTodayPatients.mockRejectedValue(err);

        await controller.getAllTodayPatients(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
            })
        )
    })

    it('Return prisma database error', async () => {
        const err = new AppError("Invalid Request", 400);

        mockPatientService.getAllTodayPatients.mockRejectedValue(err);

        await controller.getAllTodayPatients(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false,
            })
        )
    })
})

describe('getByID', () => {
    let mockPatientService: any;
    let mockISupabase: any;
    let controller: PatientController;
    let statusMock: Mock;
    let jsonMock: Mock;
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;

    beforeEach(() => {
        mockISupabase = {
            uploadFile: vi.fn()
        }

        mockPatientService = {
            getAll: vi.fn(),
            getAllTodayPatients: vi.fn(),
            getByID: vi.fn(),
        }

        controller = new PatientController(mockISupabase, mockPatientService)

        mockReq = {
            user: {posyandu_id: 'posyandu-123'} as any,
            params: {}
        }

        jsonMock = vi.fn();
        statusMock = vi.fn().mockReturnValue({json: jsonMock})
        mockRes = {
            status: statusMock
        }
    })

    it('Return data pasien dengan id 520c9474-0e76-4002-9593-cf4142282081', async () => {
        const fakePatient = {id: '520c9474-0e76-4002-9593-cf4142282081', name: 'yua'};
        mockPatientService.getByID.mockResolvedValue(fakePatient);
        mockReq.params = {id: '520c9474-0e76-4002-9593-cf4142282081'}

        await controller.getByID(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: true,
                data: fakePatient
            })
        )
    })

    it('Return not found data pasien dengan id 520c9474-0e76-4002-9593-cf4142282081', async () => {
        const err = new AppError("Patient not found", 404);
        mockPatientService.getByID.mockRejectedValue(err);
        mockReq.params = {id: '520c9474-0e76-4002-9593-cf4142282081'}

        await controller.getByID(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false
            })
        )
    })

    it('Return unexpected internal error', async () => {
        const err = new Error("Internal server Error");
        mockPatientService.getByID.mockRejectedValue(err);
        mockReq.params = {id: '520c9474-0e76-4002-9593-cf4142282081'}

        await controller.getByID(mockReq as Request, mockRes as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith(
            expect.objectContaining({
                success: false
            })
        )
    })
})