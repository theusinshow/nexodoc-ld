# Changelog

Todas as alterações relevantes deste projeto devem ser registradas aqui.

## 2026-05-27

### Ajustada extração para modo visual-first com paralelismo

- A análise de página passou a priorizar a IA visual do selo, mantendo o texto extraído apenas como contexto auxiliar da região do selo.
- Adicionado timeout de 10 segundos por chamada visual para evitar que uma prancha trave o lote inteiro.
- A análise completa agora processa até 4 páginas em paralelo.
- Adicionado cache em memória por arquivo, tamanho, data de modificação e página, reaproveitando resultados já lidos na mesma sessão.
- A pré-análise da primeira página passou a usar o mesmo caminho de análise visual-first da análise completa.
- O texto enviado como apoio à IA foi reduzido para regiões do selo, sem incluir a página completa no caminho principal.

Arquivos impactados:

- `src/app/page.tsx`
- `changelog.md`

Validações executadas:

- `npm run test`
- `npm run lint`
- `npm run build`

### Otimizadas chamadas de IA e revisão visual do selo

- A análise de cada página agora usa primeiro o parser local e só chama IA textual quando algum campo obrigatório está ausente ou a leitura local está marcada como baixa confiança.
- A leitura visual passou a começar por um recorte menor, `selo compacto`, antes de tentar o recorte normal, o ampliado e a página inteira.
- O recorte visual usado na análise passa a guardar também a imagem maior, além da miniatura exibida na tabela.
- A tabela de revisão ganhou ação `Ampliar selo`, abrindo uma visualização grande do recorte junto dos campos extraídos: número da folha, arquivo, descrição e origem da leitura.
- A ampliação do selo usa dados já processados no navegador e não faz nova chamada para IA.

Arquivos impactados:

- `src/app/page.tsx`
- `changelog.md`

Validações executadas:

- `npm run test`
- `npm run lint`
- `npm run build`

### Alterado fluxo inicial para pré-análise dos PDFs

- A primeira etapa do fluxo passou a ser importação dos PDFs, antes do formulário de dados da LD.
- Ao anexar PDFs, o sistema analisa apenas a primeira página do primeiro arquivo para sugerir dados iniciais.
- A pré-análise sugere código do projeto, código formatado, disciplina, revisão, título da seção e total de folhas quando esses dados podem ser inferidos do selo.
- A etapa de dados da LD exibe as sugestões em campos editáveis e oferece o botão `Analisar todas as pranchas`.
- A análise completa passou a usar os PDFs já carregados e só roda após confirmação do usuário.
- Extraída uma função interna comum para análise de página, reaproveitada tanto pela pré-análise quanto pela análise completa.
- Atualizado o README para documentar o novo fluxo inicial.

Arquivos impactados:

- `src/app/page.tsx`
- `README.md`
- `changelog.md`

Validações executadas:

- `npm run test`
- `npm run lint`
- `npm run build`

### Iniciada estabilização do MVP com testes automatizados

- Criado módulo `src/lib/ld-rules.ts` para concentrar regras puras de folhas, ordenação, tomos e validações.
- Adicionado `vitest` como runner de testes automatizados.
- Criada primeira suíte em `src/lib/ld-rules.test.ts`, cobrindo:
  - parsing e formatação de folhas;
  - ordenação por número da folha;
  - distribuição balanceada de tomos;
  - redistribuição segura ao alterar quantidade de pranchas por tomo;
  - bloqueios por campos obrigatórios vazios;
  - bloqueios por folha duplicada;
  - alertas de folha faltante, total divergente, disciplina divergente e baixa confiança.
- Corrigida a formatação de folhas para manter `NN/TT` também quando o total possui apenas um dígito, por exemplo `01/03`.
- Atualizados `README.md` e `docs/09-roadmap.md` para refletir o estado atual do MVP e o novo comando de testes.

Arquivos impactados:

- `src/lib/ld-rules.ts`
- `src/lib/ld-rules.test.ts`
- `src/app/page.tsx`
- `package.json`
- `package-lock.json`
- `README.md`
- `docs/09-roadmap.md`
- `changelog.md`

Validações executadas:

- `npm run test`
- `npm run lint`
- `npm run build`

## 2026-05-26

### Tornada segura a distribuição de tomos

- Substituída a edição livre de intervalos por seleção de quantidade de tomos e número de pranchas por tomo.
- A distribuição inicial é balanceada automaticamente com base no total de folhas de referência.
- Ao alterar a quantidade de um tomo, os tomos seguintes recebem automaticamente o saldo restante.
- Os intervalos de início e fim passam a ser calculados pelo sistema, sem permitir soma superior ou inferior ao total.
- O avanço para o resumo final depende de uma distribuição completa e válida.
- A geração ODT rejeita intervalos com lacunas, sobreposições ou cobertura diferente do total declarado.
- Atualizadas as regras documentadas de tomos e o README.

Arquivos impactados:

- `src/app/page.tsx`
- `src/lib/ld-generation.ts`
- `docs/06-tomos.md`
- `README.md`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`
- Teste local da API de geração com divisão inválida `10 + 12 + 9 = 31` para 30 folhas, rejeitada corretamente.

### Adicionados progresso e reanálise individual de pranchas

- A importação passa a informar arquivo, página atual, total de páginas e etapa de processamento em andamento.
- Linhas extraídas preservam a referência ao PDF e à página originais para permitir reanálise isolada.
- Adicionado botão de reanálise por linha na tabela de revisão.
- A reanálise visual tenta sucessivamente recorte do selo, recorte ampliado e página inteira, combinando imagem com o texto extraído.
- Adicionada prévia do recorte efetivamente utilizado quando houver processamento visual.
- Falhas de cota ou limite interrompem novas tentativas visuais na mesma prancha para evitar requisições redundantes.
- A tabela identifica se os dados vieram de IA textual, IA visual ou parser local.
- A API de extração agora aceita texto e imagem na mesma solicitação para apoiar a localização dos campos difíceis.

Arquivos impactados:

- `src/app/api/extract-stamp/route.ts`
- `src/app/page.tsx`
- `README.md`
- `changelog.md`

Validações executadas:

- `npm run lint`
- `npm run build`
- Rota `/api/extract-stamp` testada com texto e imagem no mesmo payload, retornando JSON estruturado correto.
- Verificação automatizada de navegador não executada: `agent-browser` e `playwright` não estão disponíveis no ambiente atual.

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
