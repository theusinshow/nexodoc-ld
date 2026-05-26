"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleX,
  Download,
  FileArchive,
  FileSearch,
  FileText,
  Loader2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";

type LdData = {
  projectCode: string;
  formattedCode: string;
  discipline: string;
  revision: string;
  sectionTitle: string;
  client: string;
  workName: string;
  phase: string;
  templateMode: "padrao" | "alternativo";
};

type ReviewRow = {
  id: number;
  sheet: string;
  file: string;
  description: string;
  readDiscipline: string;
  lowConfidence: boolean;
  reviewedAlertKeys: string[];
};

type PdfReadResult = {
  fileName: string;
  pageNumber: number;
  row: ReviewRow;
  foundFields: {
    sheet: boolean;
    file: boolean;
    description: boolean;
  };
  visualFallback: "not-needed" | "success" | "failed";
  visualError?: string;
};

type Tomo = {
  id: number;
  title: string;
  start: string;
  end: string;
};

type GeneratedOdt = {
  fileName: string;
  url: string;
};

const steps = [
  "Dados da LD",
  "Upload de pranchas",
  "Tabela de revisão",
  "Ajuste de tomos",
  "Resumo final",
  "Arquivos gerados",
];

const initialLdData: LdData = {
  projectCode: "196_25",
  formattedCode: "196-25",
  discipline: "est",
  revision: "a",
  sectionTitle: "PROJETO ESTRUTURAL CONCRETO",
  client: "PMF/SMI",
  workName: "CENTRO DE NEURODIVERGÊNCIA",
  phase: "PROJETO EXECUTIVO",
  templateMode: "padrao",
};

const initialRows: ReviewRow[] = [
  {
    id: 1,
    sheet: "01/30",
    file: "196_25_est_001_a",
    description: "TORRE RESERVATÓRIO: PLANTA DE LOCAÇÃO E DETALHAMENTO DAS FUNDAÇÕES",
    readDiscipline: "est",
    lowConfidence: false,
    reviewedAlertKeys: [],
  },
  {
    id: 2,
    sheet: "02/30",
    file: "196_25_est_002_a",
    description: "TORRE RESERVATÓRIO: PLANTA DE FORMAS TÉRREO, INTERMEDIÁRIO 01, 02, 03 E BARRILETE 01",
    readDiscipline: "est",
    lowConfidence: false,
    reviewedAlertKeys: [],
  },
  {
    id: 3,
    sheet: "03/34",
    file: "196_25_est_003_a",
    description: "TORRE RESERVATÓRIO: PLANTA DE FORMAS INTERMEDIÁRIO 04, 05, 06, BARRILETE 02 E COBERTURA",
    readDiscipline: "est",
    lowConfidence: false,
    reviewedAlertKeys: [],
  },
  {
    id: 4,
    sheet: "05/30",
    file: "196_25_fnd_005_a",
    description: "TORRE RESERVATÓRIO: DETALHAMENTO DE ARMADURAS DAS FUNDAÇÕES",
    readDiscipline: "fnd",
    lowConfidence: true,
    reviewedAlertKeys: [],
  },
];

const initialTomos: Tomo[] = [
  { id: 1, title: "TOMO 1", start: "01/30", end: "10/30" },
  { id: 2, title: "TOMO 2", start: "11/30", end: "20/30" },
  { id: 3, title: "TOMO 3", start: "21/30", end: "30/30" },
];

const checklist = [
  "Abrir o arquivo .odt no LibreOffice Writer",
  "Conferir se o rodapé está atualizado",
  "Conferir se as propriedades do Writer foram preenchidas corretamente",
  "Conferir se o nome do arquivo está correto",
  "Conferir se o PDF abriu corretamente",
  "Conferir se cada tomo começa em uma nova página",
  "Conferir se nenhuma tabela de tomo quebrou entre páginas",
  "Conferir se a coluna Nº DA FOLHA está correta",
  "Conferir se a coluna ARQUIVOS está correta",
  "Conferir se a coluna DESCRIÇÃO copiou exatamente o campo CONTEÚDO das pranchas",
  "Conferir o relatório .md de inconsistências, se houver",
];

type ParsedSheet = {
  number: number;
  total: number;
};

type RowIssue = {
  key: string;
  label: string;
  severity: "blocker" | "warning";
};

type GlobalWarning = {
  key: string;
  label: string;
};

type ValidationResult = {
  rowIssues: Record<number, RowIssue[]>;
  blockingIssues: string[];
  globalWarnings: GlobalWarning[];
  totals: number[];
  missingSheets: number[];
};

type PdfTextItem = {
  str: string;
  transform: number[];
};

type PdfTextLine = {
  x: number;
  y: number;
  text: string;
};

type VisualStampExtraction = {
  disciplina: string | null;
  folha: number | null;
  total: number | null;
  numeroFolha: string | null;
  arquivo: string | null;
  conteudo: string | null;
  confianca: "alta" | "media" | "baixa";
};

function parseSheet(value: string): ParsedSheet | null {
  const match = value.trim().match(/(\d+)\s*\/\s*(\d+)/);

  if (!match) {
    return null;
  }

  return {
    number: Number(match[1]),
    total: Number(match[2]),
  };
}

function formatSheet(number: number, total: number) {
  const width = Math.max(2, String(total).length);
  return `${String(number).padStart(width, "0")}/${total}`;
}

function normalizeExtractedValue(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractField(text: string, field: "PRANCHA" | "ARQUIVO" | "CONTEÚDO") {
  const fieldAlternatives = ["PRANCHA", "ARQUIVO", "CONTEÚDO"].filter((name) => name !== field);
  const stopPattern = fieldAlternatives.map(escapeRegex).join("|");
  const pattern = new RegExp(`${field}\\s*[:\\-]?\\s*([\\s\\S]*?)(?=\\s+(?:${stopPattern})\\s*[:\\-]?|$)`, "i");
  const match = text.match(pattern);

  return match ? normalizeExtractedValue(match[1]) : "";
}

function extractDisciplineFromPrancha(value: string) {
  const match = value.match(/[A-Za-z]{2,}(?:-[A-Za-z]{2,})?/);

  return match ? match[0] : "";
}

function groupTextLines(items: PdfTextLine[]) {
  const sortedItems = [...items].sort((a, b) => {
    if (Math.abs(a.y - b.y) > 4) {
      return a.y - b.y;
    }

    return a.x - b.x;
  });
  const lines: PdfTextLine[] = [];

  for (const item of sortedItems) {
    const currentLine = lines[lines.length - 1];

    if (currentLine && Math.abs(currentLine.y - item.y) <= 4) {
      currentLine.text = `${currentLine.text} ${item.text}`;
      currentLine.x = Math.min(currentLine.x, item.x);
      continue;
    }

    lines.push({ ...item });
  }

  return lines.map((line) => normalizeExtractedValue(line.text)).filter(Boolean);
}

function parsePdfTextToRow(
  candidateText: string,
  fullText: string,
  fileName: string,
  pageNumber: number,
  id: number,
): PdfReadResult {
  const sourceText = ["PRANCHA", "ARQUIVO", "CONTEÚDO"].every((field) =>
    candidateText.toLocaleUpperCase("pt-BR").includes(field),
  )
    ? candidateText
    : fullText;
  const sheet = extractField(sourceText, "PRANCHA");
  const file = extractField(sourceText, "ARQUIVO");
  const description = extractField(sourceText, "CONTEÚDO");
  const foundFields = {
    sheet: Boolean(sheet),
    file: Boolean(file),
    description: Boolean(description),
  };

  return {
    fileName,
    pageNumber,
    foundFields,
    row: {
      id,
      sheet,
      file,
      description,
      readDiscipline: extractDisciplineFromPrancha(sheet),
      lowConfidence: !foundFields.sheet || !foundFields.file || !foundFields.description,
      reviewedAlertKeys: [],
    },
    visualFallback: "not-needed",
  };
}

function buildSheetFromVisualExtraction(extraction: VisualStampExtraction) {
  if (extraction.numeroFolha) {
    return normalizeExtractedValue(extraction.numeroFolha);
  }

  if (extraction.folha && extraction.total) {
    return formatSheet(extraction.folha, extraction.total);
  }

  return "";
}

function hasMissingStampFields(result: PdfReadResult) {
  return !result.foundFields.sheet || !result.foundFields.file || !result.foundFields.description;
}

async function renderStampCropToDataUrl(pageProxy: unknown) {
  const page = pageProxy as {
  getViewport: (options: { scale: number }) => { width: number; height: number };
  render: (options: {
    canvasContext: CanvasRenderingContext2D;
    canvas: HTMLCanvasElement;
    viewport: { width: number; height: number };
  }) => { promise: Promise<void> };
  };
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Não foi possível criar o canvas para renderizar o selo.");
  }

  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);

  await page.render({ canvasContext: context, canvas, viewport }).promise;

  const cropX = Math.floor(canvas.width * 0.55);
  const cropY = Math.floor(canvas.height * 0.55);
  const cropWidth = canvas.width - cropX;
  const cropHeight = canvas.height - cropY;
  const cropCanvas = document.createElement("canvas");
  const cropContext = cropCanvas.getContext("2d");

  if (!cropContext) {
    throw new Error("Não foi possível criar o recorte do selo.");
  }

  cropCanvas.width = cropWidth;
  cropCanvas.height = cropHeight;
  cropContext.drawImage(
    canvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  );

  return cropCanvas.toDataURL("image/png");
}

async function requestVisualStampExtraction(imageDataUrl: string) {
  const response = await fetch("/api/extract-stamp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageDataUrl }),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Fallback visual indisponível.");
  }

  return (await response.json()) as VisualStampExtraction;
}

function mergeVisualExtraction(result: PdfReadResult, extraction: VisualStampExtraction): PdfReadResult {
  const sheet = buildSheetFromVisualExtraction(extraction) || result.row.sheet;
  const file = normalizeExtractedValue(extraction.arquivo ?? "") || result.row.file;
  const description = normalizeExtractedValue(extraction.conteudo ?? "") || result.row.description;
  const readDiscipline =
    normalizeExtractedValue(extraction.disciplina ?? "") ||
    extractDisciplineFromPrancha(sheet) ||
    result.row.readDiscipline;
  const foundFields = {
    sheet: Boolean(sheet),
    file: Boolean(file),
    description: Boolean(description),
  };

  return {
    ...result,
    foundFields,
    visualFallback: "success",
    row: {
      ...result.row,
      sheet,
      file,
      description,
      readDiscipline,
      lowConfidence:
        extraction.confianca !== "alta" ||
        !foundFields.sheet ||
        !foundFields.file ||
        !foundFields.description,
    },
  };
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler o template alternativo."));
    reader.readAsDataURL(file);
  });
}

function compareBySheet(a: ReviewRow, b: ReviewRow) {
  const parsedA = parseSheet(a.sheet);
  const parsedB = parseSheet(b.sheet);

  if (parsedA && parsedB) {
    return parsedA.number - parsedB.number;
  }

  if (parsedA) {
    return -1;
  }

  if (parsedB) {
    return 1;
  }

  return a.sheet.localeCompare(b.sheet, "pt-BR");
}

function validateRows(
  rows: ReviewRow[],
  discipline: string,
  referenceTotal: number | null,
): ValidationResult {
  const rowIssues: Record<number, RowIssue[]> = {};
  const blockingIssues: string[] = [];
  const sheetOccurrences = new Map<number, number[]>();
  const totals = new Set<number>();
  const parsedRows = rows
    .map((row) => ({ row, parsed: parseSheet(row.sheet) }))
    .filter((item): item is { row: ReviewRow; parsed: ParsedSheet } => Boolean(item.parsed));

  for (const { row, parsed } of parsedRows) {
    totals.add(parsed.total);
    sheetOccurrences.set(parsed.number, [...(sheetOccurrences.get(parsed.number) ?? []), row.id]);
  }

  for (const row of rows) {
    const issues: RowIssue[] = [];
    const parsed = parseSheet(row.sheet);
    const normalizedDiscipline = discipline.trim().toLocaleLowerCase("pt-BR");
    const normalizedReadDiscipline = row.readDiscipline.trim().toLocaleLowerCase("pt-BR");

    if (!row.file.trim()) {
      issues.push({
        key: "empty-file",
        label: "Erro: ARQUIVOS vazio",
        severity: "blocker",
      });
      blockingIssues.push(`Linha ${row.id}: ARQUIVOS vazio.`);
    }

    if (!row.description.trim()) {
      issues.push({
        key: "empty-description",
        label: "Erro: DESCRIÇÃO vazia",
        severity: "blocker",
      });
      blockingIssues.push(`Linha ${row.id}: DESCRIÇÃO vazia.`);
    }

    if (parsed && (sheetOccurrences.get(parsed.number)?.length ?? 0) > 1) {
      issues.push({
        key: `duplicate-${parsed.number}`,
        label: `Erro: folha ${formatSheet(parsed.number, parsed.total)} duplicada`,
        severity: "blocker",
      });
      blockingIssues.push(`Folha ${formatSheet(parsed.number, parsed.total)} duplicada.`);
    }

    if (
      normalizedDiscipline &&
      normalizedReadDiscipline &&
      normalizedDiscipline !== normalizedReadDiscipline
    ) {
      issues.push({
        key: `discipline-${row.readDiscipline}`,
        label: `Alerta: disciplina lida ${row.readDiscipline.toUpperCase()}`,
        severity: "warning",
      });
    }

    if (row.lowConfidence) {
      issues.push({
        key: "low-confidence",
        label: "Alerta: leitura com baixa confiança",
        severity: "warning",
      });
    }

    if (parsed && referenceTotal && parsed.total !== referenceTotal) {
      issues.push({
        key: `total-${parsed.total}`,
        label: `Alerta: total ${parsed.total}, referência ${referenceTotal}`,
        severity: "warning",
      });
    }

    rowIssues[row.id] = issues;
  }

  const totalReference = referenceTotal ?? (totals.size === 1 ? [...totals][0] : null);
  const existingNumbers = new Set(parsedRows.map(({ parsed }) => parsed.number));
  const missingSheets =
    totalReference && totalReference > 0
      ? Array.from({ length: totalReference }, (_, index) => index + 1).filter(
          (number) => !existingNumbers.has(number),
        )
      : [];

  const globalWarnings: GlobalWarning[] =
    missingSheets.length > 0 && totalReference
      ? [
          {
            key: "missing-sheets",
            label: `Folhas não localizadas: ${missingSheets
              .map((number) => formatSheet(number, totalReference))
              .join(", ")}.`,
          },
        ]
      : [];

  if (totals.size > 1) {
    globalWarnings.unshift({
      key: "total-reference",
      label: "Há totais diferentes na tabela. Defina o total de referência para validar as folhas.",
    });
  }

  return {
    rowIssues,
    blockingIssues: [...new Set(blockingIssues)],
    globalWarnings,
    totals: [...totals].sort((a, b) => a - b),
    missingSheets,
  };
}

export default function Home() {
  const [activeStep, setActiveStep] = useState(0);
  const [ldData, setLdData] = useState<LdData>(initialLdData);
  const [rows, setRows] = useState<ReviewRow[]>(initialRows);
  const [tomos, setTomos] = useState<Tomo[]>(initialTomos);
  const [referenceTotal, setReferenceTotal] = useState<number | null>(30);
  const [manualTotal, setManualTotal] = useState("30");
  const [reviewedGlobalWarnings, setReviewedGlobalWarnings] = useState<string[]>([]);
  const [pdfReadResults, setPdfReadResults] = useState<PdfReadResult[]>([]);
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [pdfReadError, setPdfReadError] = useState("");
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [generatedOdt, setGeneratedOdt] = useState<GeneratedOdt | null>(null);
  const [odtGenerating, setOdtGenerating] = useState(false);
  const [odtError, setOdtError] = useState("");

  const baseName = `${ldData.projectCode}_${ldData.discipline}_ld_${ldData.revision}`;
  const validation = useMemo(
    () => validateRows(rows, ldData.discipline, referenceTotal),
    [ldData.discipline, referenceTotal, rows],
  );
  const rowWarningIssues = rows.flatMap((row) =>
    (validation.rowIssues[row.id] ?? []).filter((issue) => issue.severity === "warning"),
  );
  const warningCount = rowWarningIssues.length + validation.globalWarnings.length;
  const reviewedRowWarnings = rows.reduce((total, row) => {
    const issues = (validation.rowIssues[row.id] ?? []).filter((issue) => issue.severity === "warning");
    return total + issues.filter((issue) => row.reviewedAlertKeys.includes(issue.key)).length;
  }, 0);
  const reviewedGlobalWarningCount = validation.globalWarnings.filter((warning) =>
    reviewedGlobalWarnings.includes(warning.key),
  ).length;
  const reviewedWarnings = reviewedRowWarnings + reviewedGlobalWarningCount;
  const hasBlockingIssues = validation.blockingIssues.length > 0;
  const hasUnreviewedWarnings = reviewedWarnings < warningCount;
  const canAdvancePastReview = !hasBlockingIssues && !hasUnreviewedWarnings;

  const generatedFiles = useMemo(
    () => [
      `${baseName}.odt`,
      `${baseName}.pdf`,
      `${baseName}_inconsistencias.md`,
      `${baseName}.zip`,
    ],
    [baseName],
  );

  function updateLdData(key: keyof LdData, value: string) {
    setLdData((current) => ({ ...current, [key]: value }));
  }

  function updateTemplateFile(file: File | null) {
    setTemplateFile(file);
  }

  function updateRow(id: number, key: keyof ReviewRow, value: string | boolean) {
    setRows((current) =>
      current.map((row) =>
        row.id === id
          ? {
              ...row,
              [key]: value,
              reviewedAlertKeys:
                key === "sheet" || key === "file" || key === "description" || key === "readDiscipline"
                  ? []
                  : row.reviewedAlertKeys,
            }
          : row,
      ),
    );
  }

  function addRow() {
    const nextId = Math.max(...rows.map((row) => row.id), 0) + 1;
    setRows((current) => [
      ...current,
      {
        id: nextId,
        sheet: "",
        file: "",
        description: "",
        readDiscipline: ldData.discipline,
        lowConfidence: true,
        reviewedAlertKeys: [],
      },
    ]);
  }

  function removeRow(id: number) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  async function processPdfFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"));

    if (files.length === 0) {
      setPdfReadError("Selecione ao menos um arquivo PDF.");
      return;
    }

    setPdfProcessing(true);
    setPdfReadError("");

    try {
      const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.mjs",
        import.meta.url,
      ).toString();

      const nextResults: PdfReadResult[] = [];
      let nextId = 1;

      for (const file of files) {
        const data = await file.arrayBuffer();
        const documentTask = pdfjs.getDocument({ data });
        const pdf = await documentTask.promise;

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1 });
          const textContent = await page.getTextContent();
          const textItems = textContent.items.filter((item) => "str" in item && "transform" in item);
          const positionedItems = textItems.map((item) => {
            const textItem = item as PdfTextItem;
            const [x, y] = viewport.convertToViewportPoint(textItem.transform[4], textItem.transform[5]);

            return {
              x,
              y,
              text: textItem.str,
            };
          });
          const stampItems = positionedItems.filter(
            (item) => item.x >= viewport.width * 0.55 && item.y >= viewport.height * 0.55,
          );
          const expandedStampItems = positionedItems.filter(
            (item) => item.x >= viewport.width * 0.45 && item.y >= viewport.height * 0.45,
          );
          const fullText = groupTextLines(positionedItems).join(" ");
          const stampText = groupTextLines(stampItems).join(" ");
          const expandedStampText = groupTextLines(expandedStampItems).join(" ");
          const candidateText = stampText || expandedStampText || fullText;

          let pageResult = parsePdfTextToRow(candidateText, fullText, file.name, pageNumber, nextId);

          if (hasMissingStampFields(pageResult)) {
            try {
              const imageDataUrl = await renderStampCropToDataUrl(page);
              const visualExtraction = await requestVisualStampExtraction(imageDataUrl);
              pageResult = mergeVisualExtraction(pageResult, visualExtraction);
            } catch (fallbackError) {
              pageResult = {
                ...pageResult,
                visualFallback: "failed",
                visualError:
                  fallbackError instanceof Error
                    ? fallbackError.message
                    : "Fallback visual falhou.",
              };
            }
          }

          nextResults.push(pageResult);
          nextId += 1;
        }
      }

      setPdfReadResults(nextResults);
      setRows(nextResults.map((result) => result.row).sort(compareBySheet));
      setReviewedGlobalWarnings([]);

      const totals = new Set(
        nextResults
          .map((result) => parseSheet(result.row.sheet)?.total)
          .filter((total): total is number => typeof total === "number"),
      );

      if (totals.size === 1) {
        const [total] = [...totals];
        setReferenceTotal(total);
        setManualTotal(String(total));
      }
    } catch (error) {
      setPdfReadError(error instanceof Error ? error.message : "Não foi possível ler o PDF selecionado.");
    } finally {
      setPdfProcessing(false);
    }
  }

  function sortRowsBySheet() {
    setRows((current) => [...current].sort(compareBySheet));
  }

  function resetRows() {
    setRows(initialRows);
    setReferenceTotal(30);
    setManualTotal("30");
    setReviewedGlobalWarnings([]);
  }

  function toggleReviewedAlert(rowId: number, key: string, checked: boolean) {
    setRows((current) =>
      current.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const nextKeys = checked
          ? [...new Set([...row.reviewedAlertKeys, key])]
          : row.reviewedAlertKeys.filter((currentKey) => currentKey !== key);

        return {
          ...row,
          reviewedAlertKeys: nextKeys,
        };
      }),
    );
  }

  function toggleGlobalWarning(key: string, checked: boolean) {
    setReviewedGlobalWarnings((current) =>
      checked ? [...new Set([...current, key])] : current.filter((currentKey) => currentKey !== key),
    );
  }

  function goToStep(step: number) {
    if (step > 2 && !canAdvancePastReview) {
      setActiveStep(2);
      return;
    }

    setActiveStep(step);
  }

  function goNext() {
    if (activeStep === 2 && !canAdvancePastReview) {
      return;
    }

    setActiveStep((step) => Math.min(steps.length - 1, step + 1));
  }

  function updateTomo(id: number, key: keyof Tomo, value: string) {
    setTomos((current) =>
      current.map((tomo) => (tomo.id === id ? { ...tomo, [key]: value } : tomo)),
    );
  }

  async function generateOdt() {
    setOdtGenerating(true);
    setOdtError("");

    try {
      const templateBase64 =
        ldData.templateMode === "alternativo" && templateFile
          ? await fileToDataUrl(templateFile)
          : null;
      const response = await fetch("/api/generate-odt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ldData,
          rows: rows.map((row) => ({
            sheet: row.sheet,
            file: row.file,
            description: row.description,
          })),
          tomos,
          templateBase64,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(payload?.error ?? "Não foi possível gerar o ODT.");
      }

      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") ?? "";
      const fileNameMatch = disposition.match(/filename="([^"]+)"/);
      const fileName = fileNameMatch?.[1] ?? `${baseName}.odt`;

      if (generatedOdt) {
        URL.revokeObjectURL(generatedOdt.url);
      }

      setGeneratedOdt({
        fileName,
        url: URL.createObjectURL(blob),
      });
    } catch (error) {
      setOdtError(error instanceof Error ? error.message : "Não foi possível gerar o ODT.");
    } finally {
      setOdtGenerating(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              NexoDoc LD Lab
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-foreground">
              Criador de Listas de Documentos
            </h1>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Metric label="Projeto" value={ldData.projectCode} />
            <Metric label="Disciplina" value={ldData.discipline.toUpperCase()} />
            <Metric label="Pranchas" value={String(rows.length)} />
            <Metric label="Tomos" value={String(tomos.length)} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-6 lg:grid-cols-[260px_1fr]">
        <aside className="h-fit border border-border bg-surface p-3">
          <nav className="space-y-1" aria-label="Etapas">
            {steps.map((step, index) => (
              <button
                key={step}
                type="button"
                onClick={() => goToStep(index)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition ${
                  activeStep === index
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-semibold">
                  {index + 1}
                </span>
                {step}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <p className="text-sm text-muted-foreground">Etapa {activeStep + 1} de 6</p>
            <h2 className="mt-1 text-xl font-semibold">{steps[activeStep]}</h2>
          </div>

          <div className="p-5">
            {activeStep === 0 && (
              <LdForm
                data={ldData}
                templateFile={templateFile}
                onChange={updateLdData}
                onTemplateFileChange={updateTemplateFile}
              />
            )}
            {activeStep === 1 && (
              <UploadStep onFilesSelected={processPdfFiles} processing={pdfProcessing} />
            )}
            {activeStep === 1 && (
              <PdfReadSummary
                results={pdfReadResults}
                processing={pdfProcessing}
                error={pdfReadError}
              />
            )}
            {activeStep === 2 && (
              <ReviewTable
                rows={rows}
                referenceTotal={referenceTotal}
                manualTotal={manualTotal}
                validation={validation}
                reviewedGlobalWarnings={reviewedGlobalWarnings}
                onAdd={addRow}
                onRemove={removeRow}
                onUpdate={updateRow}
                onSort={sortRowsBySheet}
                onReset={resetRows}
                onReferenceTotalChange={setReferenceTotal}
                onManualTotalChange={setManualTotal}
                onToggleReviewedAlert={toggleReviewedAlert}
                onToggleGlobalWarning={toggleGlobalWarning}
              />
            )}
            {activeStep === 3 && (
              <TomosStep tomos={tomos} onUpdate={updateTomo} sectionTitle={ldData.sectionTitle} />
            )}
            {activeStep === 4 && (
              <SummaryStep
                data={ldData}
                totalRows={rows.length}
                tomoCount={tomos.length}
                reviewedWarnings={reviewedWarnings}
                warningCount={warningCount}
                blockingCount={validation.blockingIssues.length}
                missingSheets={validation.missingSheets}
                files={generatedFiles}
              />
            )}
            {activeStep === 5 && (
              <FinalStep
                files={generatedFiles}
                generatedOdt={generatedOdt}
                generating={odtGenerating}
                error={odtError}
                onGenerateOdt={generateOdt}
              />
            )}
          </div>

          <footer className="flex items-center justify-between border-t border-border px-5 py-4">
            <button
              type="button"
              onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
              disabled={activeStep === 0}
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              Voltar
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={activeStep === steps.length - 1 || (activeStep === 2 && !canAdvancePastReview)}
              className="inline-flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {activeStep === 2 ? "Validar e avançar" : "Avançar"}
              <ChevronRight size={16} />
            </button>
          </footer>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background px-3 py-2">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function LdForm({
  data,
  templateFile,
  onChange,
  onTemplateFileChange,
}: {
  data: LdData;
  templateFile: File | null;
  onChange: (key: keyof LdData, value: string) => void;
  onTemplateFileChange: (file: File | null) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Field label="Código do projeto" value={data.projectCode} onChange={(value) => onChange("projectCode", value)} />
      <Field label="Código formatado" value={data.formattedCode} onChange={(value) => onChange("formattedCode", value)} />
      <Field label="Sigla da disciplina" value={data.discipline} onChange={(value) => onChange("discipline", value)} />
      <Field label="Revisão" value={data.revision} onChange={(value) => onChange("revision", value)} />
      <Field className="md:col-span-2" label="Título da seção" value={data.sectionTitle} onChange={(value) => onChange("sectionTitle", value)} />
      <Field label="Órgão/cliente" value={data.client} onChange={(value) => onChange("client", value)} />
      <Field label="Nome da obra" value={data.workName} onChange={(value) => onChange("workName", value)} />
      <Field label="Fase" value={data.phase} onChange={(value) => onChange("phase", value)} />
      <label className="grid gap-1.5">
        <span className="text-sm font-medium">Template</span>
        <select
          value={data.templateMode}
          onChange={(event) => onChange("templateMode", event.target.value)}
          className="h-10 rounded-md border border-border bg-background px-3 text-sm"
        >
          <option value="padrao">Usar template padrão</option>
          <option value="alternativo">Anexar template alternativo</option>
        </select>
      </label>
      {data.templateMode === "alternativo" && (
        <label className="grid gap-1.5 md:col-span-2">
          <span className="text-sm font-medium">Template alternativo (.odt)</span>
          <input
            type="file"
            accept=".odt,application/vnd.oasis.opendocument.text"
            onChange={(event) => onTemplateFileChange(event.target.files?.[0] ?? null)}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
          {templateFile && (
            <span className="text-xs text-muted-foreground">
              Template selecionado: {templateFile.name}
            </span>
          )}
        </label>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-border bg-background px-3 text-sm"
      />
    </label>
  );
}

function UploadStep({
  onFilesSelected,
  processing,
}: {
  onFilesSelected: (files: FileList) => void;
  processing: boolean;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <UploadPanel
        title="PDF único com várias pranchas"
        description="O sistema separa as páginas e tenta extrair PRANCHA, ARQUIVO e CONTEÚDO."
        disabled={processing}
        onFilesSelected={onFilesSelected}
      />
      <UploadPanel
        title="Vários PDFs separados"
        description="Arquivos individuais processados em sequência e ordenados pelo campo PRANCHA."
        multiple
        disabled={processing}
        onFilesSelected={onFilesSelected}
      />
      <div className="md:col-span-2 rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
        A leitura usa apenas texto selecionável do PDF. Páginas sem campos completos entram na tabela para revisão manual.
      </div>
    </div>
  );
}

function UploadPanel({
  title,
  description,
  multiple = false,
  disabled = false,
  onFilesSelected,
}: {
  title: string;
  description: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesSelected: (files: FileList) => void;
}) {
  return (
    <label
      className={`flex min-h-56 flex-col items-center justify-center rounded-md border border-dashed border-border bg-background p-6 text-center transition ${
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-muted"
      }`}
    >
      {disabled ? (
        <Loader2 className="animate-spin text-accent" size={28} />
      ) : (
        <Upload className="text-accent" size={28} />
      )}
      <span className="mt-4 font-medium">{title}</span>
      <span className="mt-2 max-w-xs text-sm text-muted-foreground">{description}</span>
      <input
        type="file"
        accept="application/pdf,.pdf"
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => {
          if (event.target.files) {
            onFilesSelected(event.target.files);
            event.target.value = "";
          }
        }}
        className="sr-only"
      />
    </label>
  );
}

function PdfReadSummary({
  results,
  processing,
  error,
}: {
  results: PdfReadResult[];
  processing: boolean;
  error: string;
}) {
  if (!processing && !error && results.length === 0) {
    return null;
  }

  const reviewCount = results.filter((result) => result.row.lowConfidence).length;
  const visualSuccessCount = results.filter((result) => result.visualFallback === "success").length;
  const visualFailedCount = results.filter((result) => result.visualFallback === "failed").length;

  return (
    <div className="mt-4 rounded-md border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        {processing ? (
          <Loader2 size={16} className="animate-spin text-accent" />
        ) : (
          <FileSearch size={16} className="text-accent" />
        )}
        Leitura textual de PDF
      </div>
      {processing && (
        <p className="mt-2 text-sm text-muted-foreground">
          Processando páginas e procurando os campos fixos no texto selecionável.
        </p>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      {!processing && results.length > 0 && (
        <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-5">
          <Metric label="Páginas lidas" value={String(results.length)} />
          <Metric label="Para revisão" value={String(reviewCount)} />
          <Metric label="Preenchidas" value={String(results.length - reviewCount)} />
          <Metric label="Fallback visual" value={String(visualSuccessCount)} />
          <Metric label="Fallback falhou" value={String(visualFailedCount)} />
        </div>
      )}
      {!processing && results.some((result) => result.visualError) && (
        <div className="mt-3 space-y-1 text-sm text-muted-foreground">
          {results
            .filter((result) => result.visualError)
            .map((result) => (
              <p key={`${result.fileName}-${result.pageNumber}`}>
                {result.fileName}, página {result.pageNumber}: {result.visualError}
              </p>
            ))}
        </div>
      )}
    </div>
  );
}

function ReviewTable({
  rows,
  referenceTotal,
  manualTotal,
  validation,
  reviewedGlobalWarnings,
  onAdd,
  onRemove,
  onUpdate,
  onSort,
  onReset,
  onReferenceTotalChange,
  onManualTotalChange,
  onToggleReviewedAlert,
  onToggleGlobalWarning,
}: {
  rows: ReviewRow[];
  referenceTotal: number | null;
  manualTotal: string;
  validation: ValidationResult;
  reviewedGlobalWarnings: string[];
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, key: keyof ReviewRow, value: string | boolean) => void;
  onSort: () => void;
  onReset: () => void;
  onReferenceTotalChange: (value: number | null) => void;
  onManualTotalChange: (value: string) => void;
  onToggleReviewedAlert: (rowId: number, key: string, checked: boolean) => void;
  onToggleGlobalWarning: (key: string, checked: boolean) => void;
}) {
  const warningIssues = rows.flatMap((row) =>
    (validation.rowIssues[row.id] ?? []).filter((issue) => issue.severity === "warning"),
  );
  const reviewedRowWarnings = rows.reduce((total, row) => {
    const rowWarnings = (validation.rowIssues[row.id] ?? []).filter(
      (issue) => issue.severity === "warning",
    );
    return total + rowWarnings.filter((issue) => row.reviewedAlertKeys.includes(issue.key)).length;
  }, 0);
  const reviewedGlobalWarningCount = validation.globalWarnings.filter((warning) =>
    reviewedGlobalWarnings.includes(warning.key),
  ).length;
  const totalWarnings = warningIssues.length + validation.globalWarnings.length;
  const reviewedWarnings = reviewedRowWarnings + reviewedGlobalWarningCount;

  return (
    <div className="space-y-4">
      <ValidationPanel
        validation={validation}
        totalWarnings={totalWarnings}
        reviewedWarnings={reviewedWarnings}
      />

      {validation.totals.length > 1 && (
        <ReferenceTotalPanel
          totals={validation.totals}
          referenceTotal={referenceTotal}
          manualTotal={manualTotal}
          onReferenceTotalChange={onReferenceTotalChange}
          onManualTotalChange={onManualTotalChange}
        />
      )}

      {validation.globalWarnings.length > 0 && (
        <div className="space-y-2 rounded-md border border-border bg-background p-4">
          <h3 className="text-sm font-semibold">Alertas gerais para relatório futuro</h3>
          <div className="grid gap-2">
            {validation.globalWarnings.map((warning) => (
              <label key={warning.key} className="flex items-start gap-3 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4"
                  checked={reviewedGlobalWarnings.includes(warning.key)}
                  onChange={(event) => onToggleGlobalWarning(warning.key, event.target.checked)}
                />
                <span>{warning.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onSort}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-muted"
          >
            <ShieldCheck size={16} />
            Ordenar por folha
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-muted"
          >
            <RotateCcw size={16} />
            Restaurar mock
          </button>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm transition hover:bg-muted"
        >
          <Plus size={16} />
          Adicionar linha
        </button>
      </div>
      <div className="overflow-x-auto border border-border">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead className="bg-surface-strong text-left text-xs uppercase tracking-[0.08em] text-muted-foreground">
            <tr>
              <th className="w-28 border-b border-border px-3 py-3">Nº da folha</th>
              <th className="w-52 border-b border-border px-3 py-3">Arquivos</th>
              <th className="border-b border-border px-3 py-3">Descrição</th>
              <th className="w-40 border-b border-border px-3 py-3">Leitura</th>
              <th className="w-56 border-b border-border px-3 py-3">Status</th>
              <th className="w-24 border-b border-border px-3 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-border last:border-b-0">
                <td className="px-3 py-3 align-top">
                  <CellInput value={row.sheet} onChange={(value) => onUpdate(row.id, "sheet", value)} />
                </td>
                <td className="px-3 py-3 align-top">
                  <CellInput value={row.file} onChange={(value) => onUpdate(row.id, "file", value)} mono />
                </td>
                <td className="px-3 py-3 align-top">
                  <textarea
                    value={row.description}
                    onChange={(event) => onUpdate(row.id, "description", event.target.value)}
                    className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <div className="space-y-3">
                    <label className="grid gap-1.5">
                      <span className="text-xs text-muted-foreground">Disciplina lida</span>
                      <input
                        value={row.readDiscipline}
                        onChange={(event) => onUpdate(row.id, "readDiscipline", event.target.value)}
                        className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input
                        type="checkbox"
                        checked={row.lowConfidence}
                        onChange={(event) => onUpdate(row.id, "lowConfidence", event.target.checked)}
                        className="size-4"
                      />
                      Baixa confiança
                    </label>
                  </div>
                </td>
                <td className="px-3 py-3 align-top">
                  <RowStatus
                    issues={validation.rowIssues[row.id] ?? []}
                    reviewedKeys={row.reviewedAlertKeys}
                    onToggle={(key, checked) => onToggleReviewedAlert(row.id, key, checked)}
                  />
                </td>
                <td className="px-3 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => onRemove(row.id)}
                    className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:bg-muted hover:text-danger"
                    aria-label="Excluir linha"
                    title="Excluir linha"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CellInput({
  value,
  onChange,
  mono = false,
}: {
  value: string;
  onChange: (value: string) => void;
  mono?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-9 w-full rounded-md border border-border bg-background px-2 text-sm ${mono ? "font-mono" : ""}`}
    />
  );
}

function ValidationPanel({
  validation,
  totalWarnings,
  reviewedWarnings,
}: {
  validation: ValidationResult;
  totalWarnings: number;
  reviewedWarnings: number;
}) {
  const hasBlockingIssues = validation.blockingIssues.length > 0;
  const hasPendingWarnings = reviewedWarnings < totalWarnings;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div
        className={`rounded-md border p-4 ${
          hasBlockingIssues ? "border-danger bg-background" : "border-border bg-background"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          {hasBlockingIssues ? <CircleX size={16} className="text-danger" /> : <Check size={16} className="text-success" />}
          Erros bloqueantes
        </div>
        <p className="mt-2 text-2xl font-semibold">{validation.blockingIssues.length}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasBlockingIssues ? "Corrija antes de avançar." : "Nenhum bloqueio encontrado."}
        </p>
      </div>

      <div
        className={`rounded-md border p-4 ${
          hasPendingWarnings ? "border-warning bg-warning-soft" : "border-border bg-background"
        }`}
      >
        <div className="flex items-center gap-2 text-sm font-semibold">
          <CircleAlert size={16} />
          Alertas revisados
        </div>
        <p className="mt-2 text-2xl font-semibold">
          {reviewedWarnings}/{totalWarnings}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {totalWarnings === 0 ? "Nenhum alerta na tabela." : "Todos precisam ser marcados como revisados."}
        </p>
      </div>

      <div className="rounded-md border border-border bg-background p-4">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText size={16} className="text-accent" />
          Folhas faltantes
        </div>
        <p className="mt-2 text-2xl font-semibold">{validation.missingSheets.length}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          O buraco é mantido e registrado para o relatório MD futuro.
        </p>
      </div>
    </div>
  );
}

function ReferenceTotalPanel({
  totals,
  referenceTotal,
  manualTotal,
  onReferenceTotalChange,
  onManualTotalChange,
}: {
  totals: number[];
  referenceTotal: number | null;
  manualTotal: string;
  onReferenceTotalChange: (value: number | null) => void;
  onManualTotalChange: (value: string) => void;
}) {
  return (
    <div className="rounded-md border border-warning bg-warning-soft p-4">
      <h3 className="text-sm font-semibold">Total divergente</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Escolha qual total deve ser usado como referência. A tabela não será corrigida automaticamente.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {totals.map((total) => (
          <button
            key={total}
            type="button"
            onClick={() => {
              onReferenceTotalChange(total);
              onManualTotalChange(String(total));
            }}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
              referenceTotal === total
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-background hover:bg-muted"
            }`}
          >
            {total}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <span>Manual</span>
          <input
            value={manualTotal}
            onChange={(event) => {
              const nextValue = event.target.value;
              onManualTotalChange(nextValue);
              const parsed = Number(nextValue);
              onReferenceTotalChange(Number.isFinite(parsed) && parsed > 0 ? parsed : null);
            }}
            className="h-9 w-24 rounded-md border border-border bg-background px-2"
          />
        </label>
      </div>
    </div>
  );
}

function RowStatus({
  issues,
  reviewedKeys,
  onToggle,
}: {
  issues: RowIssue[];
  reviewedKeys: string[];
  onToggle: (key: string, checked: boolean) => void;
}) {
  if (issues.length === 0) {
    return (
      <span className="inline-flex items-center gap-2 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
        <Check size={14} />
        OK
      </span>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => (
        <div key={issue.key} className="space-y-1">
          <span
            className={`inline-flex items-center gap-2 rounded-md px-2 py-1 text-xs font-medium ${
              issue.severity === "blocker"
                ? "bg-background text-danger ring-1 ring-danger"
                : "bg-warning-soft text-foreground"
            }`}
          >
            {issue.severity === "blocker" ? <CircleX size={14} /> : <CircleAlert size={14} />}
            {issue.label}
          </span>
          {issue.severity === "warning" && (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={reviewedKeys.includes(issue.key)}
                onChange={(event) => onToggle(issue.key, event.target.checked)}
                className="size-4"
              />
              Marcar como revisado
            </label>
          )}
        </div>
      ))}
    </div>
  );
}

function TomosStep({
  tomos,
  onUpdate,
  sectionTitle,
}: {
  tomos: Tomo[];
  onUpdate: (id: number, key: keyof Tomo, value: string) => void;
  sectionTitle: string;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
        Título aplicado em múltiplos tomos: {sectionTitle} (TOMO N)
      </div>
      <div className="grid gap-3">
        {tomos.map((tomo) => (
          <div key={tomo.id} className="grid gap-3 border border-border bg-background p-4 md:grid-cols-[1fr_150px_150px]">
            <Field label="Tomo" value={tomo.title} onChange={(value) => onUpdate(tomo.id, "title", value)} />
            <Field label="Início" value={tomo.start} onChange={(value) => onUpdate(tomo.id, "start", value)} />
            <Field label="Fim" value={tomo.end} onChange={(value) => onUpdate(tomo.id, "end", value)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryStep({
  data,
  totalRows,
  tomoCount,
  reviewedWarnings,
  warningCount,
  blockingCount,
  missingSheets,
  files,
}: {
  data: LdData;
  totalRows: number;
  tomoCount: number;
  reviewedWarnings: number;
  warningCount: number;
  blockingCount: number;
  missingSheets: number[];
  files: string[];
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SummaryGroup
        title="Dados manuais"
        items={[
          ["Código do projeto", data.projectCode],
          ["Código formatado", data.formattedCode],
          ["Disciplina", data.discipline],
          ["Revisão", data.revision],
          ["Título da seção", data.sectionTitle],
          ["Órgão/cliente", data.client],
          ["Nome da obra", data.workName],
          ["Fase", data.phase],
        ]}
      />
      <SummaryGroup
        title="Geração"
        items={[
          ["Total de pranchas", String(totalRows)],
          ["Quantidade de tomos", String(tomoCount)],
          ["Alertas revisados", `${reviewedWarnings}/${warningCount}`],
          ["Erros bloqueantes", String(blockingCount)],
          ["Folhas faltantes", missingSheets.length ? missingSheets.join(", ") : "Nenhuma"],
          ["Template", data.templateMode === "padrao" ? "Padrão interno" : "Alternativo anexado"],
        ]}
      />
      <div className="lg:col-span-2">
        <h3 className="mb-3 font-semibold">Arquivos previstos</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {files.map((file) => (
            <div key={file} className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm">
              <FileText size={16} className="text-accent" />
              {file}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <dl className="divide-y divide-border border border-border bg-background">
        {items.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-3 py-2 sm:grid-cols-[170px_1fr]">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="text-sm font-medium">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FinalStep({
  files,
  generatedOdt,
  generating,
  error,
  onGenerateOdt,
}: {
  files: string[];
  generatedOdt: GeneratedOdt | null;
  generating: boolean;
  error: string;
  onGenerateOdt: () => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <button
          type="button"
          onClick={onGenerateOdt}
          disabled={generating}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-accent px-3 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {generating ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
          Gerar ODT
        </button>
        {error && <p className="rounded-md border border-danger bg-background p-3 text-sm text-danger">{error}</p>}
        {generatedOdt && (
          <a
            href={generatedOdt.url}
            download={generatedOdt.fileName}
            className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-3 text-left text-sm transition hover:bg-muted"
          >
            <span className="flex min-w-0 items-center gap-2">
              <Download size={16} />
              <span className="truncate font-mono">{generatedOdt.fileName}</span>
            </span>
            Baixar
          </a>
        )}
        {files
          .filter((file) => !file.endsWith(".odt"))
          .map((file) => (
            <button
              key={file}
              type="button"
              disabled
              className="flex w-full items-center justify-between rounded-md border border-border bg-background px-3 py-3 text-left text-sm opacity-70"
            >
              <span className="flex min-w-0 items-center gap-2">
                {file.endsWith(".zip") ? <FileArchive size={16} /> : <Download size={16} />}
                <span className="truncate font-mono">{file}</span>
              </span>
              Fase futura
            </button>
          ))}
      </div>
      <div>
        <h3 className="mb-3 font-semibold">Checklist final</h3>
        <div className="grid gap-2">
          {checklist.map((item) => (
            <label key={item} className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <input type="checkbox" className="mt-0.5 size-4" />
              <span>{item}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
