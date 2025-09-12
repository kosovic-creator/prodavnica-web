-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "email" TEXT,
ALTER COLUMN "status" DROP DEFAULT;
