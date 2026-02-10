/*
  Warnings:

  - You are about to drop the column `consultationFee` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNumber` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `Doctor` table. All the data in the column will be lost.
  - You are about to drop the column `rating` on the `Doctor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Doctor_licenseNumber_key";

-- AlterTable
ALTER TABLE "Doctor" DROP COLUMN "consultationFee",
DROP COLUMN "licenseNumber",
DROP COLUMN "phoneNumber",
DROP COLUMN "rating";
