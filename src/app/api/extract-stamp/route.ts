import OpenAI from "openai";
import { NextResponse } from "next/server";

type StampExtraction = {
  disciplina: string | null;
  folha: number | null;
  total: number | null;
  numeroFolha: string | null;
  arquivo: string | null;
  conteudo: string | null;
  confianca: "alta" | "media" | "baixa";
};

const extractionSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    disciplina: {
      type: ["string", "null"],
      description: "Sigla da disciplina lida no campo PRANCHA, quando existir.",
    },
    folha: {
      type: ["number", "null"],
      description: "Número da folha lido no campo PRANCHA.",
    },
    total: {
      type: ["number", "null"],
      description: "Total de folhas lido no campo PRANCHA.",
    },
    numeroFolha: {
      type: ["string", "null"],
      description: "Valor completo de PRANCHA no formato NN/TT, se encontrado.",
    },
    arquivo: {
      type: ["string", "null"],
      description: "Valor exato do campo ARQUIVO.",
    },
    conteudo: {
      type: ["string", "null"],
      description: "Valor exato do campo CONTEÚDO, apenas com quebras de linha juntadas.",
    },
    confianca: {
      type: "string",
      enum: ["alta", "media", "baixa"],
      description: "Confiança da extração visual.",
    },
  },
  required: ["disciplina", "folha", "total", "numeroFolha", "arquivo", "conteudo", "confianca"],
} as const;

const systemPrompt = `Leia apenas o selo da prancha técnica.

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
Se algum campo não for encontrado, use null.`;

function isValidImageDataUrl(value: unknown): value is string {
  return typeof value === "string" && /^data:image\/(png|jpeg|webp);base64,/.test(value);
}

function isValidPdfText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= 60000;
}

type ProviderError = {
  status?: number;
  code?: string;
  type?: string;
  message?: string;
  headers?: Headers;
};

function buildTextPrompt(pdfText?: string) {
  if (!pdfText) {
    return systemPrompt;
  }

  return `${systemPrompt}

O conteúdo abaixo foi extraído do PDF e pode estar fora de ordem por causa da diagramação.
Identifique os valores associados aos rótulos do selo sem usar o nome do arquivo enviado.

TEXTO EXTRAÍDO:
${pdfText}`;
}

async function extractWithOpenAi(textPrompt: string, imageDataUrl?: string) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY não configurada no backend.");
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const inputContent = [
    {
      type: "input_text" as const,
      text: textPrompt,
    },
    ...(imageDataUrl
      ? [{
          type: "input_image" as const,
          image_url: imageDataUrl,
          detail: "high" as const,
        }]
      : []),
  ];

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4",
    max_output_tokens: 8000,
    reasoning: {
      effort: "none",
    },
    input: [
      {
        role: "user",
        content: inputContent,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "ld_stamp_extraction",
        strict: true,
        schema: extractionSchema,
      },
    },
  });

  return JSON.parse(response.output_text) as StampExtraction;
}

function parseMimoOutput(content: string | null | undefined) {
  const json = content?.match(/\{[\s\S]*\}/)?.[0];

  if (!json) {
    throw new Error("O fallback MiMo não retornou um JSON de extração.");
  }

  return JSON.parse(json) as StampExtraction;
}

async function extractWithMimo(textPrompt: string, imageDataUrl?: string) {
  if (!process.env.MIMO_API_KEY) {
    throw new Error("MIMO_API_KEY não configurada no backend.");
  }

  const response = await fetch("https://api.xiaomimimo.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": process.env.MIMO_API_KEY,
    },
    body: JSON.stringify({
      model: process.env.MIMO_MODEL ?? "mimo-v2.5",
      max_completion_tokens: 1024,
      thinking: { type: "disabled" },
      messages: [
        {
          role: "user",
          content: [
            ...(imageDataUrl
              ? [{
                  type: "image_url",
                  image_url: { url: imageDataUrl },
                }]
              : []),
            {
              type: "text",
              text: `${textPrompt}

Retorne estritamente um objeto JSON com as chaves disciplina, folha, total, numeroFolha, arquivo, conteudo e confianca. Para campos não encontrados use null. Para confianca use "alta", "media" ou "baixa".`,
            },
          ],
        },
      ],
    }),
  });

  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string; code?: string } | string;
    choices?: Array<{ message?: { content?: string } }>;
  } | null;

  if (!response.ok) {
    const providerMessage =
      typeof payload?.error === "string" ? payload.error : payload?.error?.message;
    const providerError = new Error(providerMessage ?? "Falha ao chamar o fallback MiMo.") as Error & ProviderError;
    providerError.status = response.status;
    providerError.code = typeof payload?.error === "object" ? payload.error.code : undefined;
    throw providerError;
  }

  return parseMimoOutput(payload?.choices?.[0]?.message?.content);
}

function describeOpenAiFailure(error: unknown) {
  const apiError = error as ProviderError;
  const status = apiError.status ?? 500;
  const isQuotaError =
    apiError.code === "insufficient_quota" ||
    apiError.type === "insufficient_quota";
  const isRateLimitError = status === 429 && !isQuotaError;
  const message = isQuotaError
    ? "A OpenAI foi chamada, mas retornou falta de cota ou billing disponível para esta extração."
    : isRateLimitError
      ? "A API da OpenAI recusou a extração com limite HTTP 429. Verifique o limite de requisições/tokens do projeto da chave ou tente novamente após a janela de limite."
      : apiError.message ?? "Falha ao chamar a OpenAI para ler o selo.";

  return { apiError, status, message };
}

export async function POST(request: Request) {
  const body = (await request.json()) as { imageDataUrl?: unknown; pdfText?: unknown };
  const imageDataUrl = isValidImageDataUrl(body.imageDataUrl) ? body.imageDataUrl : undefined;
  const pdfText = isValidPdfText(body.pdfText) ? body.pdfText : undefined;

  if (!imageDataUrl && !pdfText) {
    return NextResponse.json(
      { error: "Texto ou imagem do selo inválidos ou ausentes." },
      { status: 400 },
    );
  }

  const textPrompt = buildTextPrompt(pdfText);
  let openAiFailure: unknown;

  try {
    const parsed = await extractWithOpenAi(textPrompt, imageDataUrl);

    return NextResponse.json({ ...parsed, provider: "openai" });
  } catch (error) {
    openAiFailure = error;
  }

  if (process.env.MIMO_API_KEY) {
    try {
      const parsed = await extractWithMimo(textPrompt, imageDataUrl);

      return NextResponse.json({ ...parsed, provider: "mimo" });
    } catch (mimoError) {
      const openAi = describeOpenAiFailure(openAiFailure);
      const fallbackMessage =
        mimoError instanceof Error ? mimoError.message : "Falha ao chamar o fallback MiMo.";

      return NextResponse.json(
        {
          error: `${openAi.message} O fallback MiMo também falhou: ${fallbackMessage}`,
          code: openAi.apiError.code ?? openAi.apiError.type ?? null,
          projectId: openAi.apiError.headers?.get("openai-project") ?? null,
        },
        { status: (mimoError as ProviderError).status ?? openAi.status },
      );
    }
  }

  const openAi = describeOpenAiFailure(openAiFailure);

  return NextResponse.json(
    {
      error: `${openAi.message} Fallback MiMo não configurado.`,
      code: openAi.apiError.code ?? openAi.apiError.type ?? null,
      projectId: openAi.apiError.headers?.get("openai-project") ?? null,
    },
    { status: openAi.status },
  );
}
