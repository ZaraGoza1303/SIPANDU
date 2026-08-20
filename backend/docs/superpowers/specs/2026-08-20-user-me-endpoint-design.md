# Design: User Profile Endpoint `/api/user/me`

## Overview
Create a new User module with endpoints for authenticated users to get and update their profile, including profile photo upload. Consolidates profile management from `/api/auth/profile` into a dedicated `/api/user` resource.

## Database Changes

### Prisma Schema (`prisma/schema.prisma`)
Add `photo` field to User model:
```prisma
model User {
  id            String   @id @default(uuid()) @db.Uuid
  posyandu_id   String   @db.Uuid
  name          String   @db.VarChar()
  email         String   @db.VarChar()
  password      String   @db.VarChar()
  role          String   @db.VarChar()
  phone         String   @db.VarChar()
  photo         String?  @db.VarChar()  // NEW
  created_at    DateTime @default(now()) @db.Timestamp()

  schedule      Schedule[]
  examination   Examination[]
  posyandu      Posyandu @relation(fields: [posyandu_id], references: [id], onDelete: Cascade)

  @@map("users")
}
```

Run migration: `npx prisma migrate dev --name add_user_photo`

## New Files

### 1. User Repository (`src/repositories/user_repository.ts`)
```typescript
import { AuthRepository } from "./auth_repository.js";
import type { IAuthRepository } from "./auth_repository.interface.js";
import { PrismaClient } from "../generated/prisma/client.js";
import type { Prisma } from "../generated/prisma/client.js";

export class UserRepository extends AuthRepository {
  constructor(db: PrismaClient) {
    super(db);
  }

  // Inherits findByID (with photo) and updateProfile from AuthRepository
  // No additional methods needed
}

export interface IUserRepository extends IAuthRepository {}
```

### 2. User Service (`src/services/user_service.ts`)
```typescript
import type { UpdateProfileReq } from "../dto/auth.js";
import type { IUserRepository } from "../repositories/user_repository.interface.js";
import { AppError } from "../utils/error.js";
import bcrypt from 'bcrypt';
import { Supabase } from "./supabase.js";

export interface IUserService {
  getProfile(user_id: string): Promise<UserProfile>;
  updateProfile(user_id: string, req: UpdateProfileReq, photoFile?: Express.Multer.File): Promise<UserProfile>;
}

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  posyandu_id: string;
  photo: string | null;
  created_at: Date;
};

export class UserService implements IUserService {
  private userRepo: IUserRepository;
  private supabase: Supabase;

  constructor(userRepo: IUserRepository, supabase: Supabase) {
    this.userRepo = userRepo;
    this.supabase = supabase;
  }

  async getProfile(user_id: string): Promise<UserProfile> {
    const user = await this.userRepo.findByID(user_id);
    if (!user) throw new AppError("User tidak ditemukan", 404);
    return this.toUserProfile(user);
  }

  async updateProfile(user_id: string, req: UpdateProfileReq, photoFile?: Express.Multer.File): Promise<UserProfile> {
    const userData = await this.userRepo.findByID(user_id);
    if (!userData) throw new AppError("User tidak ditemukan", 404);

    const updateData: Record<string, string> = {};

    if (req.name !== undefined) updateData.name = req.name;
    if (req.email !== undefined) updateData.email = req.email;
    if (req.phone !== undefined) updateData.phone = req.phone;

    if (req.password && req.old_password) {
      const isOldPasswordValid = await bcrypt.compare(req.old_password, userData.password);
      if (!isOldPasswordValid) throw new AppError("Password lama salah", 400);
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(req.password, salt);
    }

    if (photoFile) {
      const photoUrl = await this.supabase.uploadFile(photoFile, `users/${user_id}`);
      updateData.photo = photoUrl;
    }

    await this.userRepo.updateProfile(user_id, updateData);
    const updatedUser = await this.userRepo.findByID(user_id);
    return this.toUserProfile(updatedUser!);
  }

  private toUserProfile(user: any): UserProfile {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      posyandu_id: user.posyandu_id,
      photo: user.photo,
      created_at: user.created_at,
    };
  }
}
```

### 3. User Controller (`src/controllers/user_controller.ts`)
```typescript
import type { Request, Response } from "express";
import type { IUserService } from "../services/user_service.js";
import { UpdateProfileSchema } from "../dto/auth.js";
import { sendErrorResponse, sendSuccessfullResponse } from "../utils/response.js";
import { AppError } from "../utils/error.js";

export class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
    this.userService = userService;
  }

  async getProfile(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json(sendErrorResponse("Unauthorized"));
      }

      const profile = await this.userService.getProfile(user_id);
      return res.status(200).json(sendSuccessfullResponse("Profile berhasil didapatkan", profile));
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json(sendErrorResponse(err.message));
      }
      return res.status(500).json(sendErrorResponse("Gagal mendapatkan profile", (err as Error).message));
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const user_id = req.user?.id;
      if (!user_id) {
        return res.status(401).json(sendErrorResponse("Unauthorized"));
      }

      // Parse JSON fields from multipart form data
      const body = req.body;
      const validate = UpdateProfileSchema.safeParse({
        name: body.name,
        email: body.email,
        phone: body.phone,
        password: body.password,
        old_password: body.old_password,
      });

      if (!validate.success) {
        const formattedErr = validate.error.flatten().fieldErrors;
        return res.status(400).json(sendErrorResponse("Validation Failed", formattedErr));
      }

      const profile = await this.userService.updateProfile(user_id, validate.data, req.file);
      return res.status(200).json(sendSuccessfullResponse("Profile berhasil diupdate", profile));
    } catch (err: unknown) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json(sendErrorResponse(err.message));
      }
      return res.status(500).json(sendErrorResponse("Gagal mengupdate profile", (err as Error).message));
    }
  }
}
```

### 4. User Routes (`src/routes/user.ts`)
```typescript
import { Router } from "express";
import multer from "multer";
import prisma from "../databases/prisma.js";
import { UserRepository } from "../repositories/user_repository.js";
import { UserService } from "../services/user_service.js";
import { UserController } from "../controllers/user_controller.js";
import { verifyJWTToken } from "../middleware/jwt.js";
import { Supabase } from "../services/supabase.js";

const userRouter = Router();
const upload = multer({ limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB

const db = prisma;
const supabase = new Supabase();
const userRepo = new UserRepository(db);
const userService = new UserService(userRepo, supabase);
const userController = new UserController(userService);

userRouter.use(verifyJWTToken);
userRouter.get('/me', (req, res) => userController.getProfile(req, res));
userRouter.patch('/me', upload.single('photo'), (req, res) => userController.updateProfile(req, res));

export default userRouter;
```

## Modified Files

### 1. Auth Routes (`src/routes/auth.ts`) - REMOVE profile endpoint
```typescript
// Remove this line:
// authRouter.patch('/profile', verifyJWTToken, (req, res) => authController.updateProfile(req, res));
```

### 2. Main Index (`src/index.ts`) - Register user router
```typescript
import userRouter from './src/routes/user.js';
// ...
const initRouter = () => {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    app.use('/api/auth', authRouter);
    app.use('/api/user', userRouter);  // NEW
    app.use('/api/pasien', patientRouter);
    app.use('/api/pemeriksaan', examinationRouter);
    app.use('/api/dashboard', dashboardRouter);
}
```

## Swagger Documentation Updates (`swagger.yaml`)

### Add Schemas
```yaml
components:
  schemas:
    UserProfile:
      type: object
      properties:
        id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
        role:
          type: string
        phone:
          type: string
        posyandu_id:
          type: string
          format: uuid
        photo:
          type: string
          nullable: true
        created_at:
          type: string
          format: date-time

    UpdateProfileRequest:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
        phone:
          type: string
        password:
          type: string
          format: password
        old_password:
          type: string
          format: password
        photo:
          type: string
          format: binary
          description: Profile photo (max 5MB)
```

### Add Paths
```yaml
paths:
  /api/user/me:
    get:
      tags: [User]
      summary: Get current user profile
      description: "**Akses:** Semua role yang sudah login (admin, bidan, kader)\n\nMengembalikan profil user yang sedang login."
      security:
        - BearerAuth: []
      responses:
        '200':
          description: Berhasil mendapatkan profile
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, example: true }
                  message: { type: string }
                  data: { $ref: '#/components/schemas/UserProfile' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '500': { $ref: '#/components/responses/InternalServerError' }

    patch:
      tags: [User]
      summary: Update current user profile
      description: "**Akses:** Semua role yang sudah login (admin, bidan, kader)\n\nUpdate profil user yang sedang login. Semua field opsional. Untuk mengganti password, wajib mengirim `old_password`. Foto dikirim sebagai `multipart/form-data` dengan field `photo`."
      security:
        - BearerAuth: []
      requestBody:
        required: false
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/UpdateProfileRequest'
      responses:
        '200':
          description: Profile berhasil diupdate
          content:
            application/json:
              schema:
                type: object
                properties:
                  success: { type: boolean, example: true }
                  message: { type: string }
                  data: { $ref: '#/components/schemas/UserProfile' }
        '400': { $ref: '#/components/responses/ValidationError' }
        '401': { $ref: '#/components/responses/Unauthorized' }
        '404': { $ref: '#/components/responses/NotFound' }
        '500': { $ref: '#/components/responses/InternalServerError' }
```

### Remove from Swagger
- Remove `/api/auth/profile` PATCH endpoint

## Response Format
```json
// GET /api/user/me - Success
{
  "success": true,
  "message": "Profile berhasil didapatkan",
  "data": {
    "id": "uuid",
    "name": "Andi Pratama",
    "email": "andi@example.com",
    "role": "bidan",
    "phone": "081234567890",
    "posyandu_id": "uuid",
    "photo": "https://supabase-url/.../photo.jpg",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}

// PATCH /api/user/me - Success
{
  "success": true,
  "message": "Profile berhasil diupdate",
  "data": { ...same as above... }
}
```

## Testing Checklist
- [ ] GET /api/user/me returns profile without password
- [ ] PATCH /api/user/me updates name, email, phone
- [ ] PATCH /api/user/me updates password with old_password validation
- [ ] PATCH /api/user/me uploads photo to Supabase
- [ ] PATCH /api/user/me updates all fields together
- [ ] Invalid old_password returns 400
- [ ] Unauthorized returns 401
- [ ] File size > 5MB rejected
- [ ] Swagger docs render correctly