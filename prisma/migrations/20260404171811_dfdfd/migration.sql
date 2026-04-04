-- AlterTable
ALTER TABLE "AdminSetting" ADD COLUMN     "allowPartialPayment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bookingLeadTimeHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "calcellationWindowHours" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "fixedTransactionFee" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "paymentProcessingFee" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "requirePaymentUpFront" BOOLEAN NOT NULL DEFAULT false;
