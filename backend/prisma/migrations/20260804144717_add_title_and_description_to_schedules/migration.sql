-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "description" TEXT,
ADD COLUMN     "title" VARCHAR NOT NULL DEFAULT 'Jadwal Pemeriksaan';
