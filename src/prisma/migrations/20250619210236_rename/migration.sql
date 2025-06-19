/*
  Warnings:

  - You are about to drop the column `backgroundImage` on the `Partage` table. All the data in the column will be lost.
  - Added the required column `bgImage` to the `Partage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Partage" DROP COLUMN "backgroundImage",
ADD COLUMN     "bgImage" TEXT NOT NULL;
