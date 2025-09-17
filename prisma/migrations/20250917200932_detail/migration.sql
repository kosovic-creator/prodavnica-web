-- CreateTable
CREATE TABLE "public"."ProductDetail" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "image" TEXT,

    CONSTRAINT "ProductDetail_pkey" PRIMARY KEY ("id")
);
