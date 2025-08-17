-- CreateTable
CREATE TABLE "public"."DeliveryReceipt" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeliveryReceipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DmSeen" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DmSeen_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeliveryReceipt_toUserId_idx" ON "public"."DeliveryReceipt"("toUserId");

-- CreateIndex
CREATE UNIQUE INDEX "DeliveryReceipt_messageId_toUserId_key" ON "public"."DeliveryReceipt"("messageId", "toUserId");

-- CreateIndex
CREATE INDEX "DmSeen_messageId_idx" ON "public"."DmSeen"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "DmSeen_conversationId_userId_key" ON "public"."DmSeen"("conversationId", "userId");

-- AddForeignKey
ALTER TABLE "public"."DeliveryReceipt" ADD CONSTRAINT "DeliveryReceipt_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DeliveryReceipt" ADD CONSTRAINT "DeliveryReceipt_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DmSeen" ADD CONSTRAINT "DmSeen_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DmSeen" ADD CONSTRAINT "DmSeen_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DmSeen" ADD CONSTRAINT "DmSeen_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "public"."Message"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
