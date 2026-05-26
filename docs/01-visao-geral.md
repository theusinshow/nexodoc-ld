# Visão Geral — NexoDoc LD Lab

## Objetivo

O **NexoDoc LD Lab** é um projeto separado para prototipar o módulo **Criador de LDs** do NexoDoc.

A função do módulo é gerar Listas de Documentos no padrão exato da empresa, a partir da leitura automática dos selos das pranchas em PDF.

## Por que projeto separado

O Criador de LDs tem lógica diferente do Auditor documental do NexoDoc principal.

O Auditor documental é baseado em:

- chat;
- upload de PDF;
- análise textual;
- resposta técnica.

O Criador de LDs é baseado em:

- formulário;
- upload de pranchas;
- leitura de selo;
- tabela editável;
- validação de sequência;
- divisão de tomos;
- geração de ODT;
- conversão para PDF;
- ZIP;
- relatório de inconsistências.

Por isso, deve ser validado isoladamente antes de entrar no NexoDoc principal.

## Resultado esperado

Ao final, o sistema deve gerar:

```text
[código]_[disciplina]_ld_[revisão].odt
[código]_[disciplina]_ld_[revisão].pdf
[código]_[disciplina]_ld_[revisão]_inconsistencias.md, se houver alertas
[código]_[disciplina]_ld_[revisão].zip
```

Exemplo:

```text
196_25_est_ld_a.odt
196_25_est_ld_a.pdf
196_25_est_ld_a_inconsistencias.md
196_25_est_ld_a.zip
```
