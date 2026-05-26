# Roadmap — NexoDoc LD Lab

## Fase 1 — Base visual e fluxo mockado

Objetivo:

Criar o projeto e validar o fluxo de usuário sem implementar leitura real nem geração de documentos.

Entregas:

```text
- Next.js + TypeScript + Tailwind
- tela principal do Criador de LDs
- formulário de dados manuais
- upload visual de PDFs
- tabela editável mockada
- ajuste de tomos mockado
- resumo final mockado
- checklist final mockado
```

## Fase 2 — Tabela editável e validações reais

Objetivo:

Implementar lógica de tabela e validações com dados simulados ou importados manualmente.

Entregas:

```text
- editar células
- adicionar linha
- excluir linha
- ordenar por Nº DA FOLHA
- detectar duplicidade
- detectar campos vazios
- detectar folhas faltantes
- marcar alertas como revisados
- bloquear geração quando necessário
```

## Fase 3 — Extração textual de PDF

Objetivo:

Ler texto selecionável do PDF antes de usar IA.

Entregas:

```text
- upload real de PDF único e múltiplos PDFs
- separar páginas
- extrair texto da região do selo
- capturar PRANCHA, ARQUIVO e CONTEÚDO
- preencher tabela automaticamente
```

## Fase 4 — Fallback com OpenAI visual

Objetivo:

Usar API visual quando a extração textual falhar.

Entregas:

```text
- renderizar página como imagem
- recortar canto inferior direito
- enviar recorte para OpenAI API
- receber JSON estruturado
- marcar baixa confiança quando necessário
```

## Fase 5 — Geração ODT

Objetivo:

Gerar a LD real a partir do template oficial.

Entregas:

```text
- manipular template .odt
- preencher propriedades
- duplicar linhas
- duplicar blocos de tomos
- inserir quebras de página
- salvar ODT final
```

## Fase 6 — PDF, ZIP e relatório MD

Objetivo:

Gerar todos os arquivos finais.

Entregas:

```text
- converter ODT para PDF com LibreOffice headless
- gerar relatório MD de inconsistências
- gerar ZIP
- oferecer downloads separados
- oferecer download ZIP
```

## Fase 7 — Integração futura com NexoDoc

Objetivo:

Mover o módulo validado para dentro do NexoDoc principal.

Entregas:

```text
- integrar menu lateral
- reaproveitar layout base
- reaproveitar autenticação futura
- reaproveitar upload/API
- manter Criador de LDs como módulo separado dentro do NexoDoc
```
