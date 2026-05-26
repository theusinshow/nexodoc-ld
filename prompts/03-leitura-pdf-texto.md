# Prompt 03 — Implementar leitura textual de PDF

Leia `CODEX.md` e os arquivos da pasta `docs` antes de alterar o projeto.

## Objetivo

Implementar a primeira estratégia real de leitura das pranchas: extração de texto selecionável do PDF.

Não implemente ainda fallback com OpenAI visual.

## Entrada

Aceitar:

- PDF único com várias páginas/pranchas;
- vários PDFs separados.

## Estratégia

Para cada página/prancha:

1. Identificar a página.
2. Extrair texto do PDF, preferencialmente da região do selo no canto inferior direito.
3. Localizar os campos fixos:
   - PRANCHA
   - ARQUIVO
   - CONTEÚDO
4. Retornar dados estruturados.
5. Preencher a tabela editável.

## Regras de extração

O campo CONTEÚDO deve ser copiado exatamente, exceto por normalização mínima:

- juntar quebras de linha;
- remover espaços duplicados;
- aparar espaços no início/fim.

Não alterar:

- palavras;
- acentos;
- pontuação;
- caixa alta;
- números;
- ordem do texto.

## Resultado esperado

A tabela deve ser preenchida automaticamente com:

```text
Nº DA FOLHA | ARQUIVOS | DESCRIÇÃO | STATUS
```

Quando algum campo não for encontrado:

- preencher o que for possível;
- marcar linha como `Revisar`;
- permitir edição manual.
