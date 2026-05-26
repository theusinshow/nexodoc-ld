# Instruções para Codex — NexoDoc LD Lab

## Papel do Codex

Você está trabalhando em um projeto isolado chamado **NexoDoc LD Lab**.

Este projeto é um laboratório para prototipar o módulo **Criador de LDs** do NexoDoc. Ele deve ser desenvolvido de forma separada do NexoDoc principal e depois poderá ser integrado como um módulo interno.

## Diretriz principal

Não implemente tudo de uma vez.

Siga as fases documentadas em `/prompts`:

1. Criar base do projeto e interface mockada.
2. Implementar tabela editável e validações.
3. Implementar leitura de PDFs e extração textual.
4. Implementar fallback com OpenAI visual.
5. Implementar geração de ODT.
6. Implementar conversão para PDF, ZIP e relatório MD.

## Registro de alterações

Todas e quaisquer alterações feitas neste projeto devem ser registradas em `changelog.md`.

Antes de finalizar uma tarefa, atualize o changelog com:

- data da alteração;
- resumo objetivo do que foi alterado;
- arquivos ou áreas principais impactadas;
- validações executadas, quando houver.

Não deixe mudanças de código, documentação, configuração ou dependências sem registro no changelog.

## Stack recomendada

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- OpenAI API em etapa futura
- Bibliotecas de manipulação de ODT em etapa futura
- LibreOffice headless para conversão PDF em etapa futura

## Produto

O Criador de LDs deve gerar Listas de Documentos no padrão exato da empresa.

A LD final deve manter:

- layout do template ODT oficial;
- margens;
- fontes;
- tabela;
- cabeçalho;
- rodapé;
- propriedades do LibreOffice Writer;
- quebras de página por tomo;
- estrutura de colunas `Nº DA FOLHA`, `ARQUIVOS` e `DESCRIÇÃO`.

## Restrições importantes

- Não recriar o layout do zero se a etapa envolver geração final. Usar template `.odt`.
- Não alterar textos extraídos do campo `CONTEÚDO`.
- Não corrigir, resumir, reescrever ou padronizar a descrição.
- Não usar nome do PDF como fonte principal do campo `ARQUIVOS`.
- Não usar IA para montar a LD livremente.
- A IA, quando usada, deve apenas extrair dados estruturados.
- A montagem da LD deve ser feita por código e template.

## Primeira etapa

Na primeira etapa, não implementar:

- leitura real de PDF;
- OpenAI API;
- geração real de ODT;
- conversão real para PDF;
- banco de dados;
- login;
- histórico persistente.

Implementar apenas a interface e fluxo mockado.

## Visual

Interface técnica, limpa, profissional, sem emojis e sem excesso visual.

Deve parecer uma ferramenta interna de engenharia/documentação técnica.
