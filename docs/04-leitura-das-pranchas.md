# Leitura das Pranchas

## Entrada aceita

O sistema deve aceitar:

```text
A) Um PDF único com várias pranchas
B) Vários PDFs separados, um por prancha
```

A ordem de envio dos arquivos não importa.

## Padrão do selo

Os campos necessários ficam sempre no canto inferior direito da prancha.

Campos fixos:

```text
PRANCHA
ARQUIVO
CONTEÚDO
```

Não há variações de nome para esses campos.

## Localização dos campos

Estrutura visual esperada:

```text
Área superior esquerda:
CONTEÚDO → DESCRIÇÃO da LD

Área superior direita:
PRANCHA → Nº DA FOLHA da LD

Área inferior central:
ARQUIVO → ARQUIVOS da LD
```

O campo `ARQUIVO` fica sempre na faixa inferior, entre `DATA` e o campo da disciplina.

## Formatos de prancha

O sistema deve aceitar pranchas em:

```text
A0
A1
A3
A0 estendida
```

O selo mantém proporção parecida em todos os formatos.

## Estratégia de leitura

A estratégia recomendada:

```text
1. Renderizar ou analisar a página do PDF.
2. Recortar o canto inferior direito por proporção da página.
3. Tentar extrair texto selecionável do PDF.
4. Procurar PRANCHA, ARQUIVO e CONTEÚDO.
5. Se falhar, usar OpenAI visual como fallback.
6. Se ainda falhar, marcar como revisão manual.
```

## Recorte proporcional

Configuração inicial sugerida:

```text
Últimos 35% da largura da página
Últimos 30% da altura da página
```

Deve existir fallback com recorte maior:

```text
Tentativa 1: recorte normal
Tentativa 2: recorte ampliado
Tentativa 3: página inteira ou marcação para revisão manual
```
