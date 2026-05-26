import { buildOdtFileName, generateOdtBuffer, type GeneratePayload } from "@/lib/ld-generation";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const payload = (await request.json()) as GeneratePayload;

  if (!payload.ldData || !Array.isArray(payload.rows)) {
    return NextResponse.json({ error: "Dados da LD inválidos." }, { status: 400 });
  }

  try {
    const output = await generateOdtBuffer(payload);
    const fileName = buildOdtFileName(payload.ldData);

    return new NextResponse(output, {
      headers: {
        "Content-Type": "application/vnd.oasis.opendocument.text",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Não foi possível gerar o ODT." },
      { status: 500 },
    );
  }
}
