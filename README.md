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

Esta base já contém um MVP funcional do laboratório:

- Next.js App Router com TypeScript;
- Tailwind CSS;
- interface principal do Criador de LDs;
- fluxo inicial por upload: o usuário anexa os PDFs antes de preencher a LD;
- pré-análise da primeira prancha para sugerir código, disciplina, revisão, título de seção e total;
- formulário de dados manuais preenchido com sugestões editáveis;
- análise completa sob confirmação do usuário, usando o conjunto de PDFs já carregado;
- upload real de PDF único ou múltiplos PDFs;
- leitura textual de pranchas com interpretação estruturada por IA;
- fallback visual e reanálise individual de pranchas com OpenAI;
- tabela de revisão editável com validações bloqueantes e alertas revisáveis;
- divisão segura de tomos com intervalos calculados automaticamente;
- geração real de ODT a partir do template oficial;
- conversão para PDF com LibreOffice headless;
- relatório MD de inconsistências quando houver alertas;
- ZIP final com os arquivos gerados;
- testes automatizados para regras centrais de folhas, tomos e validações.

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

Execute os testes automatizados:

```bash
npm run test
```

## Variáveis de ambiente

Para usar a extração estruturada visual do selo com OpenAI e fallback automático no Xiaomi MiMo, crie um arquivo `.env.local` com:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-5.4
MIMO_API_KEY=sk-...
MIMO_MODEL=mimo-v2.5
```

As chaves são usadas apenas pela API route backend. Elas não devem ser expostas no frontend.

Se o terminal que inicia o servidor já tiver `OPENAI_API_KEY` ou `MIMO_API_KEY` definida, essa variável pode prevalecer sobre o arquivo `.env.local`. Ao trocar de chave durante testes locais, reinicie o servidor em um terminal sem essa variável herdada.

O endpoint tenta a OpenAI primeiro. Quando a chamada falha, tenta `mimo-v2.5`, que aceita a imagem Base64 do recorte do selo pela API compatível com OpenAI da Xiaomi.

Na importação, a tela informa o arquivo e a página em processamento. Pranchas com falha ou baixa confiança podem ser reanalisadas individualmente na tabela de revisão; nessas tentativas o sistema amplia progressivamente a área visual enviada para extração.

Na divisão de tomos, o usuário escolhe quantidades e o sistema recalcula os intervalos automaticamente, sempre fechando no total de folhas de referência.

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

## Saídas finais

A tela final gera:

```text
[código]_[disciplina]_ld_[revisão].odt
[código]_[disciplina]_ld_[revisão].pdf
[código]_[disciplina]_ld_[revisão]_inconsistencias.md, quando houver alertas
[código]_[disciplina]_ld_[revisão].zip
```

A conversão para PDF usa LibreOffice em modo headless. No Windows, o app tenta encontrar automaticamente:

```text
C:\Program Files\LibreOffice\program\soffice.exe
```

Também é possível informar um caminho específico:

```bash
LIBREOFFICE_PATH=C:\Program Files\LibreOffice\program\soffice.exe
```
