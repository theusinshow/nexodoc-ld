# Prompt 05 — Implementar geração ODT

Leia `CODEX.md` e os arquivos da pasta `docs` antes de alterar o projeto.

## Objetivo

Implementar geração real da LD em `.odt` usando template oficial.

## Regra principal

Não recriar layout do zero.

Usar template ODT.

## Template

Usar template padrão:

```text
templates/modelo_ld_empresa.odt
```

Permitir template alternativo apenas para a geração atual, se o usuário tiver anexado.

## Preenchimento

Preencher:

- título da seção;
- blocos de tomos;
- tabela com Nº DA FOLHA, ARQUIVOS e DESCRIÇÃO;
- propriedades do LibreOffice Writer.

## Propriedades

Preencher:

```text
Info 1: órgão/cliente
Info 2: código formatado do projeto
Info 3: Lista de documentos
Info 4: LISTA DE DOCUMENTOS
Assunto: nome da obra
Anotações: fase do projeto
```

## Tomos

Se houver apenas um tomo:

```text
PROJETO ESTRUTURAL CONCRETO
```

Se houver mais de um:

```text
PROJETO ESTRUTURAL CONCRETO (TOMO 1)
PROJETO ESTRUTURAL CONCRETO (TOMO 2)
```

Cada tomo deve começar em nova página.

A tabela de um tomo não deve quebrar entre páginas.

## Nome final

Salvar como:

```text
[código]_[disciplina]_ld_[revisão].odt
```

Exemplo:

```text
196_25_est_ld_a.odt
```
