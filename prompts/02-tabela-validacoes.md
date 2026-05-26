# Prompt 02 — Implementar tabela editável e validações

Leia `CODEX.md` e os arquivos da pasta `docs` antes de alterar o projeto.

## Objetivo

Implementar a lógica real da tabela editável e validações, ainda sem leitura real de PDF e sem geração real de ODT/PDF.

## Requisitos da tabela

A tabela deve permitir:

- editar Nº DA FOLHA;
- editar ARQUIVOS;
- editar DESCRIÇÃO;
- adicionar linha;
- excluir linha;
- ordenar por Nº DA FOLHA;
- marcar alerta como revisado.

## Validações obrigatórias

Bloquear geração quando houver:

- folha duplicada;
- campo ARQUIVOS vazio;
- campo DESCRIÇÃO vazio.

Alertar, mas permitir gerar com confirmação/revisão:

- folha faltando;
- disciplina divergente;
- total divergente;
- leitura com baixa confiança.

## Folha faltando

Quando houver folha faltando:

- manter o buraco;
- não renumerar;
- informar o usuário;
- preparar dados para relatório MD futuro.

## Disciplina divergente

Comparar sigla informada pelo usuário com sigla lida no campo PRANCHA.

Ignorar apenas maiúsculas/minúsculas.

## Total divergente

Se houver totais diferentes:

- perguntar ao usuário qual total é referência;
- usar esse total apenas para validação;
- não corrigir automaticamente a tabela;
- deixar o usuário corrigir manualmente.

## Geração mockada

O botão de gerar deve ficar bloqueado se houver erros bloqueantes.

Se houver alertas não revisados, pedir revisão antes.

Se tudo estiver ok ou revisado, permitir avançar para resumo final.
