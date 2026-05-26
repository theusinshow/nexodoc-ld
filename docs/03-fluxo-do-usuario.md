# Fluxo do Usuário

## Fluxo principal

```text
1. Usuário acessa Criador de LDs
2. Preenche dados manuais da LD
3. Escolhe usar template padrão ou anexa template alternativo
4. Anexa PDF único com várias pranchas ou vários PDFs separados
5. Sistema processa as pranchas
6. Sistema monta tabela editável
7. Usuário revisa e corrige a tabela
8. Sistema sugere divisão de tomos
9. Usuário ajusta tomos, se necessário
10. Sistema mostra resumo final
11. Usuário confirma geração
12. Sistema gera ODT, PDF, ZIP e relatório MD se houver alertas
13. Sistema mostra checklist final visual
```

## Primeira versão

A primeira versão deve implementar o fluxo visual e mockado.

Não implementar ainda:

```text
- leitura real do PDF;
- OpenAI API;
- geração real de ODT;
- conversão real para PDF;
- ZIP real;
- relatório MD real.
```

Essas partes entram em fases posteriores.

## Tabela editável

A tabela de revisão deve ter:

```text
Nº DA FOLHA
ARQUIVOS
DESCRIÇÃO
STATUS
```

Ações necessárias:

```text
- editar célula;
- excluir linha;
- adicionar linha;
- marcar alerta como revisado.
```

Não precisa ter:

```text
- reprocessar prancha individual;
- salvar rascunho;
- prévia visual da LD.
```

Esses recursos ficam fora da primeira versão.
