/*
  Warnings:

  - Changed the type of `stunting_status` on the `stunting_results` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `wasting_status` on the `stunting_results` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `underweight_status` on the `stunting_results` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StuntingStatus" AS ENUM ('Normal', 'Stunted', 'SeverelyStunted', 'High');

-- CreateEnum
CREATE TYPE "WastingStatus" AS ENUM ('GiziBaikNormal', 'GiziKurangWasted', 'GiziBurukSeverelyWasted', 'BerisikoGiziLebih');

-- CreateEnum
CREATE TYPE "UnderweightStatus" AS ENUM ('BeratBadanNormal', 'BeratBadanKurang', 'BeratBadanSangatKurang');

-- AlterTable
ALTER TABLE "stunting_results" DROP COLUMN "stunting_status",
ADD COLUMN     "stunting_status" "StuntingStatus" NOT NULL,
DROP COLUMN "wasting_status",
ADD COLUMN     "wasting_status" "WastingStatus" NOT NULL,
DROP COLUMN "underweight_status",
ADD COLUMN     "underweight_status" "UnderweightStatus" NOT NULL;
