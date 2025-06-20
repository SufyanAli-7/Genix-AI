-- CreateTable
CREATE TABLE "Music" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "musicUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Music_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Music_userId_idx" ON "Music"("userId");

-- CreateIndex
CREATE INDEX "Music_createdAt_idx" ON "Music"("createdAt");
