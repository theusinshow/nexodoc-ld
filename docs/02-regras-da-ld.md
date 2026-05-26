# Regras da Lista de Documentos

## Cada LD é de uma disciplina

Cada Lista de Documentos é gerada para uma única disciplina/conjunto.

Exemplos de título manual:

```text
PROJETO ESTRUTURAL CONCRETO
PROJETO ESTRUTURAL METÁLICO
PROJETO ARQUITETÔNICO
PROJETO HIDROSSANITÁRIO
```

## Nome do arquivo final

O nome do arquivo da LD segue exatamente o padrão:

```text
[código do projeto]_[sigla da disciplina]_ld_[revisão].odt
```

Exemplos:

```text
196_25_est_ld_a.odt
196_25_met_ld_a.odt
196_25_arq_ld_b.odt
```

O PDF e o ZIP usam o mesmo nome-base:

```text
196_25_est_ld_a.pdf
196_25_est_ld_a.zip
```

## Dados manuais do usuário

O usuário deve preencher manualmente:

```text
Código do projeto: 196_25
Código formatado: 196-25
Sigla da disciplina: est
Revisão: a
Título da seção: PROJETO ESTRUTURAL CONCRETO
Órgão/cliente: PMF/SMI
Nome da obra: CENTRO DE NEURODIVERGÊNCIA
Fase: PROJETO EXECUTIVO
```

## Propriedades do LibreOffice Writer

O sistema deve preencher automaticamente as propriedades relevantes do ODT:

```text
Info 1: órgão/cliente
Info 2: código formatado do projeto
Info 3: Lista de documentos
Info 4: LISTA DE DOCUMENTOS
Assunto: nome da obra
Anotações: fase do projeto
```

Campos que podem ser ignorados:

```text
Título
Palavras-chave
```

## Estrutura da tabela

A tabela oficial da LD tem três colunas:

```text
Nº DA FOLHA | ARQUIVOS | DESCRIÇÃO
```

Mapeamento:

```text
PRANCHA  → Nº DA FOLHA
ARQUIVO  → ARQUIVOS
CONTEÚDO → DESCRIÇÃO
```

## Conteúdo da descrição

A coluna `DESCRIÇÃO` deve copiar exatamente o valor do campo `CONTEÚDO` da prancha.

Não permitido:

```text
- resumir;
- corrigir;
- reescrever;
- mudar caixa alta;
- remover acentos;
- alterar vírgulas;
- alterar dois-pontos;
- completar informação ausente.
```

Permitido apenas:

```text
- juntar quebras de linha indevidas;
- remover espaços duplicados;
- remover espaços antes/depois do texto.
```
