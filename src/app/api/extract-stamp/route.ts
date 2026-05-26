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

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY não configurada no backend." },
      { status: 500 },
    );
  }

  const body = (await request.json()) as { imageDataUrl?: unknown };

  if (!isValidImageDataUrl(body.imageDataUrl)) {
    return NextResponse.json(
      { error: "Imagem do selo inválida ou ausente." },
      { status: 400 },
    );
  }

  const imageDataUrl = body.imageDataUrl;
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL ?? "gpt-5.4",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: systemPrompt,
          },
          {
            type: "input_image",
            image_url: imageDataUrl,
            detail: "high",
          },
        ],
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
}
