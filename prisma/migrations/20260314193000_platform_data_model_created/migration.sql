-- CreateTable
CREATE TABLE "platform_data" (
    "id" TEXT NOT NULL,
    "platformFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "maximumJobRadius" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_data_pkey" PRIMARY KEY ("id")
);
