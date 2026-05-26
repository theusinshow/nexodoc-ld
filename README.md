# NexoDoc LD Lab

Protótipo isolado do módulo **Criador de LDs** do NexoDoc.

Este projeto deve ser desenvolvido separado do NexoDoc principal para validar a lógica de geração de Listas de Documentos no padrão da empresa antes da integração definitiva.

## Objetivo

Criar uma ferramenta para gerar automaticamente uma Lista de Documentos a partir da leitura dos selos das pranchas em PDF.

O sistema deve:

- receber um PDF único com várias pranchas ou vários PDFs separados;
- ler o selo no canto inferior direito de cada prancha;
- extrair os campos `PRANCHA`, `ARQUIVO` e `CONTEÚDO`;
- montar uma tabela editável com `Nº DA FOLHA`, `ARQUIVOS` e `DESCRIÇÃO`;
- sugerir divisão de tomos;
- permitir revisão manual;
- gerar uma LD em `.odt` no padrão exato da empresa;
- converter o `.odt` para `.pdf`;
- gerar `.zip` com os arquivos finais;
- gerar relatório `.md` de inconsistências quando houver alertas.

## Importante

A primeira etapa do projeto deve ser um protótipo funcional de interface e fluxo, sem implementar tudo de uma vez.

Prioridade inicial:

1. Criar estrutura do projeto.
2. Criar interface principal.
3. Criar formulário de dados da LD.
4. Criar upload visual de PDFs.
5. Criar tabela editável mockada.
6. Criar ajuste de tomos mockado.
7. Criar resumo final mockado.
8. Documentar a lógica completa futura.

A leitura real dos PDFs, OpenAI API, manipulação de ODT e conversão para PDF devem entrar em etapas posteriores.

## Como usar com Codex

1. Extraia este pacote na pasta do projeto `nexodoc-ld-lab`.
2. Abra o Codex na raiz do projeto.
3. Peça para o Codex ler `CODEX.md` e todos os arquivos da pasta `docs`.
4. Execute os prompts na ordem dentro da pasta `prompts`.

Prompt inicial recomendado:

```text
Leia o CODEX.md e todos os arquivos da pasta docs antes de implementar. Depois execute o prompt prompts/01-criar-ld-lab-base.md.
```

## Projeto implementado

Esta base contém a fase 1 do laboratório:

- Next.js App Router com TypeScript;
- Tailwind CSS;
- interface principal do Criador de LDs;
- formulário de dados manuais;
- upload visual mockado;
- tabela de revisão editável com dados simulados;
- ajuste de tomos mockado;
- resumo final mockado;
- tela final com downloads desabilitados e checklist visual.

## Rodando localmente

Instale as dependências:

```bash
npm install
```

Execute o servidor de desenvolvimento:

```bash
npm run dev
```

Valide a build de produção:

```bash
npm run build
```

Execute o lint:

```bash
npm run lint
```

## Variáveis de ambiente

Para usar o fallback visual com OpenAI, crie um arquivo `.env.local` com:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.1
```

A chave é usada apenas pela API route backend. Ela não deve ser exposta no frontend.

## Template ODT

A geração real da LD usa o template oficial em:

```text
templates/modelo_ld_empresa.odt
```

O template deve conter os marcadores:

```text
{{TITULO_SECAO}}
{{NUMERO_FOLHA}}
{{ARQUIVO}}
{{DESCRICAO}}
```

As propriedades do LibreOffice Writer são preenchidas automaticamente no `meta.xml` durante a geração.
