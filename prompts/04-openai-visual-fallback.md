# Prompt 04 — Implementar fallback com OpenAI visual

Leia `CODEX.md` e os arquivos da pasta `docs` antes de alterar o projeto.

## Objetivo

Implementar fallback com OpenAI visual quando a extração textual do PDF falhar.

## Regra principal

A OpenAI não deve gerar a LD.

Ela deve apenas extrair dados estruturados do selo.

## Fluxo

Quando a leitura textual falhar:

1. Renderizar a página como imagem.
2. Recortar o canto inferior direito da página.
3. Enviar o recorte para a OpenAI API.
4. Solicitar extração dos campos:
   - PRANCHA
   - ARQUIVO
   - CONTEÚDO
5. Receber JSON estruturado.
6. Preencher tabela.
7. Marcar baixa confiança quando necessário.

## Prompt da IA

Usar instrução rígida:

```text
Leia apenas o selo da prancha técnica.

Extraia exclusivamente os campos:
- PRANCHA
- ARQUIVO
- CONTEÚDO

O campo PRANCHA sempre existe no selo.
O campo ARQUIVO sempre existe no selo.
O campo CONTEÚDO sempre existe no selo.

Não use informações fora desses campos.
Não reescreva textos.
Não corrija ortografia.
Não resuma.
Não complete informação ausente.
Copie o campo CONTEÚDO exatamente como aparece, exceto por juntar quebras de linha.

Responda apenas em JSON.
Se algum campo não for encontrado, use null.
```

## JSON esperado

```json
{
  "disciplina": "EST",
  "folha": 2,
  "total": 30,
  "numeroFolha": "02/30",
  "arquivo": "196_25_est_002_a",
  "conteudo": "TORRE RESERVATÓRIO: PLANTA DE FORMAS TÉRREO, INTERMEDIÁRIO 01, 02, 03 E BARRILETE 01",
  "confianca": "alta"
}
```

## Segurança

A chave da OpenAI deve ficar apenas no backend/API route.

Nunca expor `OPENAI_API_KEY` no frontend.
