-- AlterTable
ALTER TABLE "Roteiro" ADD COLUMN     "notas" TEXT,
ADD COLUMN     "orcamento" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "Atividade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "roteiroId" TEXT NOT NULL,

    CONSTRAINT "Atividade_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Atividade" ADD CONSTRAINT "Atividade_roteiroId_fkey" FOREIGN KEY ("roteiroId") REFERENCES "Roteiro"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
