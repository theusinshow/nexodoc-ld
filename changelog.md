# Changelog

Todas as alterações relevantes deste projeto devem ser registradas aqui.

## 2026-05-26

### Criada base inicial do NexoDoc LD Lab

- Criado projeto Next.js App Router com TypeScript e Tailwind CSS.
- Implementada tela principal do Criador de LDs com fluxo em seis etapas.
- Criado formulário de dados manuais da LD.
- Criadas áreas visuais de upload mockado para PDF único e múltiplos PDFs.
- Implementada tabela de revisão editável com dados simulados.
- Implementado ajuste de tomos mockado.
- Implementado resumo final e tela final com downloads mockados e checklist visual.
- Adicionados arquivos de configuração do projeto: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`.
- Atualizado `README.md` com instruções para instalar, rodar, compilar e executar lint.

Validações executadas:

- `npm run build`
- `npm run lint`

### Implementadas validações reais da tabela

- Adicionada ordenação por `Nº DA FOLHA`.
- Adicionada detecção de folha duplicada como erro bloqueante.
- Adicionada detecção de `ARQUIVOS` vazio como erro bloqueante.
- Adicionada detecção de `DESCRIÇÃO` vazia como erro bloqueante.
- Adicionada detecção de folhas faltantes como alerta revisável.
- Adicionada comparação entre disciplina informada e disciplina lida.
- Adicionada detecção de total divergente com escolha de total de referência.
- Adicionada marcação de alerta de baixa confiança.
- Bloqueado avanço para etapas finais enquanto houver erro bloqueante ou alerta não revisado.
- Atualizado resumo final para exibir alertas, bloqueios e folhas faltantes.

Validações executadas:

- `npm run build`
- `npm run lint`

### Registrada regra obrigatória de changelog

- Atualizado `CODEX.md` para exigir que toda alteração futura seja registrada em `changelog.md`.

### Implementada leitura textual de PDFs

- Adicionada dependência `pdfjs-dist` para extração de texto selecionável no navegador.
- Implementado upload real de PDF único com várias páginas e de múltiplos PDFs separados.
- Implementada leitura página a página dos PDFs enviados.
- Implementada tentativa de extração priorizando o canto inferior direito da página, com fallback textual para a página inteira.
- Implementada captura dos campos fixos `PRANCHA`, `ARQUIVO` e `CONTEÚDO`.
- Implementado preenchimento automático da tabela de revisão a partir dos dados extraídos.
- Linhas com campo ausente agora entram como baixa confiança para revisão manual.
- Mantida normalização mínima do campo `CONTEÚDO`: junção de quebras de linha, remoção de espaços duplicados e aparo de espaços.
- Atualizada área de upload para exibir estado de processamento e resumo de páginas lidas.

Arquivos impactados:

- `src/app/page.tsx`
- `package.json`
- `package-lock.json`

Validações executadas:

- `npm run build`
- `npm run lint`

### Implementado fallback visual com OpenAI

- Adicionada dependência `openai`.
- Criada API route backend `src/app/api/extract-stamp/route.ts` para extrair dados do selo via OpenAI Responses API.
- Adicionado JSON Schema rígido para retorno estruturado com `disciplina`, `folha`, `total`, `numeroFolha`, `arquivo`, `conteudo` e `confianca`.
- Mantida a chave `OPENAI_API_KEY` exclusivamente no backend.
- Criado `.env.example` com `OPENAI_API_KEY` e `OPENAI_MODEL`.
- Implementado recorte visual do canto inferior direito da página renderizada no navegador.
- Integrado fallback visual somente quando a leitura textual não encontra todos os campos necessários.
- Mesclado retorno visual com dados extraídos por texto, sem reescrever `CONTEÚDO`.
- Atualizado resumo de leitura para indicar fallback visual aplicado ou falho.
- Atualizado `README.md` com instruções de variáveis de ambiente.

Arquivos impactados:

- `src/app/page.tsx`
- `src/app/api/extract-stamp/route.ts`
- `.env.example`
- `README.md`
- `package.json`
- `package-lock.json`

Validações executadas:

- `npm run build`
- `npm run lint`

### Implementada geração real de ODT

- Adicionada dependência `jszip` para manipular arquivos `.odt` como pacotes ZIP.
- Adicionado template oficial `templates/modelo_ld_empresa.odt`.
- Criada API route `src/app/api/generate-odt/route.ts` para gerar a LD real em `.odt`.
- Implementado preenchimento de `meta.xml` com propriedades do LibreOffice Writer:
  - `Info 1`: órgão/cliente;
  - `Info 2`: código formatado;
  - `Info 3`: Lista de documentos;
  - `Info 4`: LISTA DE DOCUMENTOS;
  - `Assunto`: nome da obra;
  - `Anotações`: fase.
- Implementada substituição dos marcadores `{{TITULO_SECAO}}`, `{{NUMERO_FOLHA}}`, `{{ARQUIVO}}` e `{{DESCRICAO}}`.
- Implementada montagem de tomos com título específico por tomo e quebra de página entre tomos.
- Implementado suporte a template alternativo `.odt` selecionado na tela de dados da LD.
- Habilitado botão real de geração e download do `.odt` na tela final.
- Mantidos PDF, ZIP e relatório como fases futuras.
- Atualizado `README.md` com instruções sobre o template ODT.

Arquivos impactados:

- `src/app/api/generate-odt/route.ts`
- `src/app/page.tsx`
- `templates/modelo_ld_empresa.odt`
- `README.md`
- `package.json`
- `package-lock.json`

Validações executadas:

- `npm run build`
- `npm run lint`
