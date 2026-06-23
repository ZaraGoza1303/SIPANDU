/*
  Warnings:

  - You are about to drop the column `arm_circum_reference` on the `examinations` table. All the data in the column will be lost.
  - You are about to drop the column `head_circum_reference` on the `examinations` table. All the data in the column will be lost.
  - Added the required column `arm_circumference` to the `examinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `head_circumference` to the `examinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "patients_nik_parent_key";

-- AlterTable
ALTER TABLE "examinations" DROP COLUMN "arm_circum_reference",
DROP COLUMN "head_circum_reference",
ADD COLUMN     "arm_circumference" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "head_circumference" DOUBLE PRECISION NOT NULL;
