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
