'use client'

import React, { useState, useEffect } from 'react'
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useToast } from '@/hooks/use-toast'
import { ThemeToggle } from "@/components/ThemeToggle"

type Atividade = {
  id?: string;
  nome: string;
  data?: string;
};

type Roteiro = {
  id: string;
  destino: string;
  dataInicio: string;
  dataFim: string;
  orcamento?: number;
  notas?: string;
  atividades: Atividade[];
};

export default function Home() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [roteiros, setRoteiros] = useState<Roteiro[]>([])
  const [destino, setDestino] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [orcamento, setOrcamento] = useState('')
  const [notas, setNotas] = useState('')
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [novaAtividade, setNovaAtividade] = useState('')
  const [novaAtividadeData, setNovaAtividadeData] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [busca, setBusca] = useState('')

  useEffect(() => {
    if (session) {
      fetchRoteiros()
    }
  }, [session])

  const fetchRoteiros = async () => {
    try {
      const response = await fetch('/api/roteiros')
      if (!response.ok) {
        throw new Error('Erro ao buscar roteiros')
      }
      const data = await response.json()
      setRoteiros(data)
    } catch (error) {
      console.error('Erro ao buscar roteiros:', error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os roteiros.",
        variant: "destructive",
      })
    }
  }

  const criarOuAtualizarRoteiro = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editandoId ? `/api/roteiros/${editandoId}` : '/api/roteiros'
      const method = editandoId ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destino,
          dataInicio,
          dataFim,
          orcamento: orcamento ? parseFloat(orcamento) : undefined,
          notas,
          atividades: atividades,
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar roteiro')
      }

      setDestino('')
      setDataInicio('')
      setDataFim('')
      setOrcamento('')
      setNotas('')
      setAtividades([])
      setEditandoId(null)
      fetchRoteiros()
      toast({
        title: "Sucesso",
        description: editandoId ? "Roteiro atualizado com sucesso." : "Roteiro criado com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao salvar roteiro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o roteiro.",
        variant: "destructive",
      })
    }
  }

  const excluirRoteiro = async (id: string) => {
    try {
      const response = await fetch(`/api/roteiros/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir roteiro')
      }

      fetchRoteiros()
      toast({
        title: "Sucesso",
        description: "Roteiro excluído com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao excluir roteiro:', error)
      toast({
        title: "Erro",
        description: "Não foi possível excluir o roteiro.",
        variant: "destructive",
      })
    }
  }

  const editarRoteiro = (roteiro: Roteiro) => {
    setEditandoId(roteiro.id)
    setDestino(roteiro.destino)
    setDataInicio(roteiro.dataInicio)
    setDataFim(roteiro.dataFim)
    setOrcamento(roteiro.orcamento?.toString() || '')
    setNotas(roteiro.notas || '')
  }

  const roteirosFiltrados = roteiros.filter(roteiro =>
    roteiro.destino.toLowerCase().includes(busca.toLowerCase())
  )

  const adicionarAtividade = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const atividadeNome = novaAtividade.trim();
      if (atividadeNome) {
        const novaAtividadeObj: Atividade = {
          nome: atividadeNome,
          data: novaAtividadeData || undefined
        };
        
        setAtividades(prevAtividades => [...prevAtividades, novaAtividadeObj]);
        setNovaAtividade('');
        setNovaAtividadeData('');
      } else {
        toast({
          title: "Erro",
          description: "O nome da atividade não pode ser vazio.",
          variant: "destructive",
        });
      }
    }
  };

  const removerAtividade = (index: number) => {
    setAtividades(prevAtividades => prevAtividades.filter((_, i) => i !== index));
  };

  if (status === "loading") {
    return <p>Carregando...</p>
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <Button onClick={() => signIn('google')}>Entrar com Google</Button>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <div>Olá, {session.user?.name}!</div>
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Button onClick={() => signOut()}>Sair</Button>
          </div>
        </div>
        
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editandoId ? 'Editar Roteiro' : 'Criar Novo Roteiro'}</CardTitle>
          </CardHeader>
          <form onSubmit={criarOuAtualizarRoteiro}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="destino">Destino</Label>
                  <Input id="destino" value={destino} onChange={(e) => setDestino(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="dataInicio">Data de Início</Label>
                  <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="dataFim">Data de Fim</Label>
                  <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="orcamento">Orçamento</Label>
                  <Input id="orcamento" type="number" value={orcamento} onChange={(e) => setOrcamento(e.target.value)} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea id="notas" value={notas} onChange={(e) => setNotas(e.target.value)} />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label>Atividades</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={novaAtividade}
                      onChange={(e) => setNovaAtividade(e.target.value)}
                      onKeyDown={adicionarAtividade}
                      placeholder="Nova atividade (pressione Enter para adicionar)"
                    />
                    <Input
                      type="date"
                      value={novaAtividadeData}
                      onChange={(e) => setNovaAtividadeData(e.target.value)}
                    />
                  </div>
                  <ul className="mt-2 space-y-2">
                    {atividades.map((atividade, index) => (
                      <li key={index} className="flex justify-between items-center bg-secondary p-2 rounded">
                        <span>{atividade.nome} {atividade.data && `- ${new Date(atividade.data).toLocaleDateString()}`}</span>
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="sm"
                          onClick={() => removerAtividade(index)}
                        >
                          Remover
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit">{editandoId ? 'Atualizar' : 'Criar'}</Button>
              {editandoId && (
                <Button type="button" variant="outline" onClick={() => setEditandoId(null)}>Cancelar</Button>
              )}
            </CardFooter>
          </form>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Seus Roteiros</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              className="mb-4"
              placeholder="Buscar por destino"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
            <ul className="space-y-4">
              {roteirosFiltrados.map((roteiro) => (
                <li key={roteiro.id} className="border p-4 rounded">
                  <h3 className="text-lg font-semibold">{roteiro.destino}</h3>
                  <p>De: {new Date(roteiro.dataInicio).toLocaleDateString()} - Até: {new Date(roteiro.dataFim).toLocaleDateString()}</p>
                  {roteiro.orcamento && <p>Orçamento: R$ {roteiro.orcamento.toFixed(2)}</p>}
                  {roteiro.notas && <p>Notas: {roteiro.notas}</p>}
                  <div className="mt-2">
                    <Button onClick={() => editarRoteiro(roteiro)} className="mr-2">Editar</Button>
                    <Button onClick={() => excluirRoteiro(roteiro.id)} variant="destructive">Excluir</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}