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

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no backend." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { imageDataUrl?: unknown; pdfText?: unknown };
  const hasImage = isValidImageDataUrl(body.imageDataUrl);
  const hasPdfText = isValidPdfText(body.pdfText);

  if (!hasImage && !hasPdfText) {
    return NextResponse.json(
      { error: "Texto ou imagem do selo inválidos ou ausentes." },
      { status: 400 },
    );
  }

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const textPrompt = hasPdfText
    ? `${systemPrompt}

O conteúdo abaixo foi extraído do PDF e pode estar fora de ordem por causa da diagramação.
Identifique os valores associados aos rótulos do selo sem usar o nome do arquivo enviado.

TEXTO EXTRAÍDO:
${body.pdfText}`
    : systemPrompt;
  const inputContent = [
    {
      type: "input_text" as const,
      text: textPrompt,
    },
    ...(hasImage
      ? [{
          type: "input_image" as const,
          image_url: body.imageDataUrl as string,
          detail: "high" as const,
        }]
      : []),
  ];

  try {
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

    const parsed = JSON.parse(response.output_text) as StampExtraction;

    return NextResponse.json(parsed);
  } catch (error) {
    const apiError = error as {
      status?: number;
      code?: string;
      type?: string;
      message?: string;
      headers?: Headers;
    };
    const status = apiError.status ?? 500;
    const isQuotaError =
      apiError.code === "insufficient_quota" ||
      apiError.type === "insufficient_quota";
    const isRateLimitError = status === 429 && !isQuotaError;
    const message = isQuotaError
      ? "A OpenAI foi chamada, mas retornou falta de cota ou billing disponível para esta extração."
      : isRateLimitError
        ? "A OpenAI foi chamada, mas limitou temporariamente esta extração. Tente novamente com menos páginas por vez."
      : apiError.message ?? "Falha ao chamar a OpenAI para ler o selo.";

    return NextResponse.json(
      {
        error: message,
        code: apiError.code ?? apiError.type ?? null,
        projectId: apiError.headers?.get("openai-project") ?? null,
      },
      { status },
    );
  }
}
