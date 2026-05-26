# Prompt 01 — Criar base do NexoDoc LD Lab

Crie um novo projeto chamado `nexodoc-ld-lab` para prototipar o módulo Criador de LDs do NexoDoc.

Este projeto é um laboratório isolado. Não deve depender do NexoDoc principal agora.

Antes de implementar, leia:

- `CODEX.md`
- todos os arquivos da pasta `docs`

## Objetivo desta etapa

Criar apenas a base visual e o fluxo mockado do Criador de LDs.

Não implemente ainda:

- leitura real de PDF;
- OpenAI API;
- geração real de ODT;
- conversão real para PDF;
- geração real de ZIP;
- banco de dados;
- login;
- histórico persistente.

## Stack

Use:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui, se disponível

## Interface obrigatória

Criar uma tela principal com etapas:

1. Dados da LD
2. Upload de pranchas
3. Tabela de revisão
4. Ajuste de tomos
5. Resumo final
6. Arquivos gerados/checklist final

## Dados da LD

Formulário com campos:

- Código do projeto
- Código formatado
- Sigla da disciplina
- Revisão
- Título da seção
- Órgão/cliente
- Nome da obra
- Fase
- Template: usar padrão ou anexar alternativo

## Upload

Criar área visual para:

- PDF único com várias pranchas
- vários PDFs separados

Nesta fase, o upload pode ser mockado. Não precisa processar arquivos reais.

## Tabela editável mockada

Criar tabela com colunas:

- Nº DA FOLHA
- ARQUIVOS
- DESCRIÇÃO
- STATUS

Incluir alguns dados mockados, por exemplo:

```text
01/30 | 196_25_est_001_a | TORRE RESERVATÓRIO: PLANTA DE LOCAÇÃO E DETALHAMENTO DAS FUNDAÇÕES | OK
02/30 | 196_25_est_002_a | TORRE RESERVATÓRIO: PLANTA DE FORMAS TÉRREO, INTERMEDIÁRIO 01, 02, 03 E BARRILETE 01 | OK
03/34 | 196_25_est_003_a | TORRE RESERVATÓRIO: PLANTA DE FORMAS INTERMEDIÁRIO 04, 05, 06, BARRILETE 02 E COBERTURA | Alerta: total divergente
```

A tabela deve permitir edição visual simples.

## Ajuste de tomos mockado

Criar área que sugere tomos:

```text
TOMO 1: 01/30 até 10/30
TOMO 2: 11/30 até 20/30
TOMO 3: 21/30 até 30/30
```

Permitir edição visual dos intervalos.

## Resumo final mockado

Mostrar resumo com:

- dados manuais;
- total de pranchas;
- quantidade de tomos;
- alertas revisados;
- arquivos que serão gerados.

## Tela final mockada

Mostrar botões:

- Baixar ODT
- Baixar PDF
- Baixar relatório MD
- Baixar ZIP

Eles podem ser botões desabilitados ou mockados nesta fase.

Mostrar checklist final visual.

## Visual

Interface técnica, limpa e profissional.

Sem emojis.

Não usar excesso de cores.

Criar componentes claros, com bom espaçamento e layout responsivo.

## Ao finalizar

Informe:

- arquivos criados;
- como rodar o projeto;
- próximos passos.
