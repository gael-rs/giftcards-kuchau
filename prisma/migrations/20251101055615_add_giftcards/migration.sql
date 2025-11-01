-- CreateTable
CREATE TABLE "Giftcard" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Giftcard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Giftcard_userId_idx" ON "Giftcard"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Giftcard_userId_number_key" ON "Giftcard"("userId", "number");

-- AddForeignKey
ALTER TABLE "Giftcard" ADD CONSTRAINT "Giftcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
