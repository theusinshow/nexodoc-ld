# Changelog

Todas as alterações relevantes deste projeto devem ser registradas aqui.

## 2026-05-26

### Alterada estratégia para IA textual com fallback visual

- A extração agora envia primeiro o texto selecionável da página ao `gpt-5.4` para identificar `PRANCHA`, `ARQUIVO` e `CONTEÚDO` em JSON estruturado.
- O recorte visual passou a ser acionado apenas quando a interpretação por texto não preenche campos obrigatórios.
- O texto enviado inclui região do selo, região ampliada e texto completo da página, limitado a 60000 caracteres.
- Ao iniciar um upload real, a tabela mockada é limpa imediatamente para não parecer resultado de uma análise que falhou.
- O resumo da leitura passou a distinguir extração por IA de texto, IA visual e falhas.
- A resposta de erro da API inclui o identificador do projeto OpenAI para diagnosticar chaves associadas ao projeto incorreto.
- Atualizada a documentação de configuração para refletir a estratégia combinada.
- Documentado que variáveis OpenAI herdadas pelo terminal podem prevalecer sobre `.env.local` durante testes.

Arquivos impactados:

- `src/app/api/extract-stamp/route.ts`
- `src/app/page.tsx`
- `README.md`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`
- Validado manualmente: rota `/api/extract-stamp` retornou extração estruturada correta via texto com a chave do projeto novo.

### Aumentada qualidade visual dentro de orçamento por prancha

- Ampliado o recorte visual enviado para até 2400 pixels por eixo, melhorando a leitura de textos pequenos no selo.
- Elevada a qualidade JPEG para `0.92`.
- Aumentado o limite de saída da resposta estruturada para 8000 tokens, mantendo margem sob o orçamento solicitado de US$ 0,50 por prancha nas tarifas atuais do `gpt-5.4`.
- Mantido `reasoning.effort: none`, pois a tarefa é extração fiel de campos e não elaboração textual.

Arquivos impactados:

- `src/app/api/extract-stamp/route.ts`
- `src/app/page.tsx`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`

### Limitado custo por extração visual individual

- A chamada ao `gpt-5.4` para leitura de selo agora limita a resposta a 500 tokens.
- Definido `reasoning.effort` como `none`, adequado à extração estruturada curta.
- O recorte enviado foi reduzido para no máximo 1200 pixels por eixo e JPEG de qualidade controlada.
- O objetivo é viabilizar o teste com saldo reduzido sem comprometer a região textual do selo.

Arquivos impactados:

- `src/app/api/extract-stamp/route.ts`
- `src/app/page.tsx`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`

### Reduzido custo da imagem enviada para leitura visual

- Confirmado por diagnóstico que a nova chave aceita chamadas textuais e visuais no projeto `NexoDoc-ld`.
- O recorte do selo enviado à OpenAI agora tem dimensão máxima limitada a 1800 pixels por eixo.
- A imagem do selo passou a ser enviada em JPEG com compressão controlada, reduzindo carga por prancha sem remover a região útil.
- A mensagem de erro diferencia falta de cota de limitação temporária de chamadas visuais.

Arquivos impactados:

- `src/app/page.tsx`
- `src/app/api/extract-stamp/route.ts`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`

### Exibido erro explícito quando a IA visual não tem cota

- A rota de extração do selo agora captura erros da OpenAI e retorna JSON legível para o frontend.
- Erros `429 insufficient_quota` passam a informar que a chave foi chamada, mas está sem cota ou billing disponível.
- O processamento de PDFs deixa de montar tabela com fallback textual ruim quando a leitura visual por IA falha e os campos textuais não são confiáveis.
- Mantido fallback textual apenas quando ele contém campos mínimos válidos.

Arquivos impactados:

- `src/app/api/extract-stamp/route.ts`
- `src/app/page.tsx`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`

### Promovida leitura visual por IA para fluxo principal

- A leitura ao anexar PDFs agora tenta extrair o selo primeiro via OpenAI visual.
- A extração textual permanece como apoio para preencher campos quando a IA falhar ou retornar valores incompletos.
- O recorte enviado ao modelo foi ampliado para incluir mais contexto do selo técnico.
- O modelo padrão da API foi atualizado para `gpt-5.4`.
- O resumo de processamento passou a indicar leitura visual por IA, em vez de fallback visual.
- Atualizados `.env.example` e `README.md` com o modelo padrão usado no laboratório.

Arquivos impactados:

- `src/app/page.tsx`
- `src/app/api/extract-stamp/route.ts`
- `.env.example`
- `README.md`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`

### Ajustada validação da extração textual do selo

- A leitura textual deixou de aceitar qualquer texto após `PRANCHA`, `ARQUIVO` ou `CONTEÚDO` como campo válido.
- O campo `PRANCHA` agora só é considerado localizado quando pode ser normalizado para `NN/TT`.
- Quando o PDF traz apenas o número da prancha, o sistema usa o total de referência informado para formar `NN/TT`.
- O campo `ARQUIVO` agora tenta localizar um código com padrão de arquivo técnico antes de aceitar o valor.
- O campo `CONTEÚDO` agora rejeita leituras que começam com outro rótulo do selo, evitando descrições preenchidas com `PRANCHA` ou `ARQUIVO`.
- Leituras suspeitas passam a acionar fallback visual ou entram como baixa confiança para revisão.

Arquivos impactados:

- `src/app/page.tsx`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`

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

### Implementadas saídas finais em PDF, ZIP e relatório MD

- Extraída a geração de ODT para `src/lib/ld-generation.ts`, permitindo reaproveitamento por múltiplas rotas.
- Criada API route `src/app/api/generate-package/route.ts` para gerar pacote final.
- Implementada conversão de `.odt` para `.pdf` usando LibreOffice headless.
- Implementada busca automática por LibreOffice em comandos comuns e no caminho Windows `C:\Program Files\LibreOffice\program\soffice.exe`.
- Adicionado suporte a `LIBREOFFICE_PATH` para configurar o binário manualmente.
- Implementada geração de relatório `.md` de inconsistências quando houver alertas.
- Implementada geração de `.zip` com ODT, PDF e relatório quando aplicável.
- Atualizada tela final para gerar e oferecer downloads reais de ODT, PDF, relatório MD e ZIP.
- Atualizado `README.md` com documentação das saídas finais e do LibreOffice headless.

Arquivos impactados:

- `src/lib/ld-generation.ts`
- `src/app/api/generate-odt/route.ts`
- `src/app/api/generate-package/route.ts`
- `src/app/page.tsx`
- `README.md`
- `changelog.md`

Validações executadas:

- `npm run build`
- `npm run lint`
