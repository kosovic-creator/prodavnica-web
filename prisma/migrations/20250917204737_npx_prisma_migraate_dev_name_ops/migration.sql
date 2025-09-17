/*
  Warnings:

  - Added the required column `description` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable

ALTER TABLE "public"."Product" ADD COLUMN     "description" TEXT NOT NULL;
