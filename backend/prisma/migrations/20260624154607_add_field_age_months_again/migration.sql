/*
  Warnings:

  - Added the required column `age_months` to the `stunting_results` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "stunting_results" ADD COLUMN     "age_months" SMALLINT NOT NULL;
