-- CreateTable
CREATE TABLE "ServiceBundle" (
    "id" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "bundlePrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceBundle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceBundleItem" (
    "id" TEXT NOT NULL,
    "serviceBundleId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,

    CONSTRAINT "ServiceBundleItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceBundle_operatorId_idx" ON "ServiceBundle"("operatorId");

-- CreateIndex
CREATE INDEX "ServiceBundleItem_serviceBundleId_idx" ON "ServiceBundleItem"("serviceBundleId");

-- CreateIndex
CREATE INDEX "ServiceBundleItem_serviceId_idx" ON "ServiceBundleItem"("serviceId");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceBundleItem_serviceBundleId_serviceId_key" ON "ServiceBundleItem"("serviceBundleId", "serviceId");

-- AddForeignKey
ALTER TABLE "ServiceBundle" ADD CONSTRAINT "ServiceBundle_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "OperatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBundleItem" ADD CONSTRAINT "ServiceBundleItem_serviceBundleId_fkey" FOREIGN KEY ("serviceBundleId") REFERENCES "ServiceBundle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceBundleItem" ADD CONSTRAINT "ServiceBundleItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE ON UPDATE CASCADE;
