-- AlterTable
ALTER TABLE "public"."OrderItem" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ALTER COLUMN "description" DROP NOT NULL;
