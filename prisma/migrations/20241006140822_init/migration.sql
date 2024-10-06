-- CreateTable
CREATE TABLE "Roteiro" (
    "id" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Roteiro_pkey" PRIMARY KEY ("id")
);
