/*
  Warnings:

  - You are about to drop the column `kader_id` on the `examinations` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `examinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "examinations" DROP CONSTRAINT "examinations_kader_id_fkey";

-- AlterTable
ALTER TABLE "examinations" DROP COLUMN "kader_id",
ADD COLUMN     "user_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "examinations" ADD CONSTRAINT "examinations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
