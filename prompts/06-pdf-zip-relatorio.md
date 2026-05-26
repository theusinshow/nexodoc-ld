# Prompt 06 — Implementar PDF, ZIP e relatório MD

Leia `CODEX.md` e os arquivos da pasta `docs` antes de alterar o projeto.

## Objetivo

Completar as saídas finais do Criador de LDs.

## Arquivos obrigatórios

Sempre gerar:

```text
[código]_[disciplina]_ld_[revisão].odt
[código]_[disciplina]_ld_[revisão].pdf
[código]_[disciplina]_ld_[revisão].zip
```

Se houver alertas:

```text
[código]_[disciplina]_ld_[revisão]_inconsistencias.md
```

## PDF

Converter o ODT para PDF.

Recomendação:

```text
LibreOffice headless
```

## ZIP

Se não houver inconsistências:

```text
196_25_est_ld_a.zip
├─ 196_25_est_ld_a.odt
└─ 196_25_est_ld_a.pdf
```

Se houver inconsistências:

```text
196_25_est_ld_a.zip
├─ 196_25_est_ld_a.odt
├─ 196_25_est_ld_a.pdf
└─ 196_25_est_ld_a_inconsistencias.md
```

## Relatório MD

Gerar apenas quando houver alertas ou inconsistências não bloqueantes.

Registrar:

- folhas faltantes;
- disciplina divergente;
- total divergente;
- leituras com baixa confiança;
- alertas revisados pelo usuário.

## Download

Oferecer:

- baixar ODT;
- baixar PDF;
- baixar relatório MD, se houver;
- baixar ZIP.
