-- CreateTable
CREATE TABLE "puskesmas" (
    "id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,
    "area" VARCHAR NOT NULL,

    CONSTRAINT "puskesmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posyandu" (
    "id" UUID NOT NULL,
    "puskesmas_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "area" VARCHAR NOT NULL,
    "address" VARCHAR NOT NULL,

    CONSTRAINT "posyandu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "posyandu_id" UUID NOT NULL,
    "name" VARCHAR NOT NULL,
    "email" VARCHAR NOT NULL,
    "password" VARCHAR NOT NULL,
    "role" VARCHAR NOT NULL,
    "phone" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "posyandu_id" UUID NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "nik_parent" VARCHAR(16),
    "name" VARCHAR NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" VARCHAR NOT NULL,
    "mother_name" VARCHAR NOT NULL,
    "father_name" VARCHAR,
    "address" VARCHAR NOT NULL,
    "phone_parent" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examinations" (
    "id" UUID NOT NULL,
    "patient_id" UUID NOT NULL,
    "kader_id" UUID NOT NULL,
    "exam_date" DATE NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "head_circum_reference" DOUBLE PRECISION NOT NULL,
    "arm_circum_reference" DOUBLE PRECISION NOT NULL,
    "notes" TEXT NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examinations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stunting_results" (
    "id" UUID NOT NULL,
    "examination_id" UUID NOT NULL,
    "age_months" SMALLINT NOT NULL,
    "weight_for_age_zscore" DOUBLE PRECISION NOT NULL,
    "height_for_age_zscore" DOUBLE PRECISION NOT NULL,
    "weight_for_height_zscore" DOUBLE PRECISION NOT NULL,
    "stunting_status" VARCHAR NOT NULL,
    "wasting_status" VARCHAR NOT NULL,
    "underweight_status" VARCHAR NOT NULL,

    CONSTRAINT "stunting_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedules" (
    "id" UUID NOT NULL,
    "posyandu_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "scheduled_date" DATE NOT NULL,
    "time_start" TIMESTAMP NOT NULL,
    "time_end" TIMESTAMP NOT NULL,
    "status" VARCHAR NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL,

    CONSTRAINT "schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "patients"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_parent_key" ON "patients"("nik_parent");

-- CreateIndex
CREATE UNIQUE INDEX "stunting_results_examination_id_key" ON "stunting_results"("examination_id");

-- AddForeignKey
ALTER TABLE "posyandu" ADD CONSTRAINT "posyandu_puskesmas_id_fkey" FOREIGN KEY ("puskesmas_id") REFERENCES "puskesmas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_kader_id_fkey" FOREIGN KEY ("kader_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stunting_results" ADD CONSTRAINT "stunting_results_examination_id_fkey" FOREIGN KEY ("examination_id") REFERENCES "examinations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_posyandu_id_fkey" FOREIGN KEY ("posyandu_id") REFERENCES "posyandu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedules" ADD CONSTRAINT "schedules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
