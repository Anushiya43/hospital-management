/*
  Warnings:

  - Added the required column `slotDuration` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.
  - Changed the column `dayOfWeek` on the `DoctorAvailability` table from a scalar field to a list field. If there are non-null values in that column, this step will fail.

*/
-- AlterTable
ALTER TABLE "DoctorAvailability" ADD COLUMN     "slotDuration" INTEGER NOT NULL,
ALTER COLUMN "dayOfWeek" SET DATA TYPE "DayOfWeek"[] USING ARRAY["dayOfWeek"]::"DayOfWeek"[];
