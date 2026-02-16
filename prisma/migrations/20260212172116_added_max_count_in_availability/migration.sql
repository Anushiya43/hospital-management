/*
  Warnings:

  - Added the required column `maxCount` to the `DoctorAvailability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoctorAvailability" ADD COLUMN     "maxCount" INTEGER NOT NULL;
