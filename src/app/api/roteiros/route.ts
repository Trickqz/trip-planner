import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"

type Roteiro = {
  id: string
  destino: string
  dataInicio: string
  dataFim: string
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const roteiros = await prisma.roteiro.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        atividades: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(roteiros)
  } catch (error) {
    console.error('Erro ao buscar roteiros:', error)
    return NextResponse.json({ error: 'Erro ao buscar roteiros' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { destino, dataInicio, dataFim, orcamento, notas, atividades } = body

    const novoRoteiro = await prisma.roteiro.create({
      data: {
        destino,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        orcamento: orcamento ? parseFloat(orcamento) : null,
        notas,
        atividades: {
          create: atividades.map((atividade: any) => ({
            nome: atividade.nome,
            data: atividade.data ? new Date(atividade.data) : null,
          })),
        },
        userId: session.user.id,
      },
      include: {
        atividades: true,
      },
    })

    return NextResponse.json(novoRoteiro, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar roteiro:', error)
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id, destino, dataInicio, dataFim, orcamento, notas, atividades } = body

    const roteiro = await prisma.roteiro.findUnique({
      where: { id },
      include: { atividades: true },
    })

    if (!roteiro || roteiro.userId !== session.user.id) {
      return NextResponse.json({ error: 'Roteiro não encontrado ou não autorizado' }, { status: 404 })
    }

    const roteiroAtualizado = await prisma.roteiro.update({
      where: { id },
      data: {
        destino,
        dataInicio: new Date(dataInicio),
        dataFim: new Date(dataFim),
        orcamento: orcamento ? parseFloat(orcamento) : null,
        notas,
        atividades: {
          deleteMany: {},
          create: atividades.map((atividade: any) => ({
            nome: atividade.nome,
            data: atividade.data ? new Date(atividade.data) : null,
          })),
        },
      },
      include: {
        atividades: true,
      },
    })

    return NextResponse.json(roteiroAtualizado)
  } catch (error) {
    console.error('Erro ao atualizar roteiro:', error)
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await request.json()

    const roteiro = await prisma.roteiro.findUnique({
      where: { id },
    })

    if (!roteiro || roteiro.userId !== session.user.id) {
      return NextResponse.json({ error: 'Roteiro não encontrado ou não autorizado' }, { status: 404 })
    }

    await prisma.roteiro.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Roteiro excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir roteiro:', error)
  }
}

