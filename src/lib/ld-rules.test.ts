import { describe, expect, it } from "vitest";
import {
  buildBalancedTomos,
  compareBySheet,
  formatSheet,
  parseSheet,
  updateTomoQuantity,
  validateRows,
  type ReviewRow,
} from "./ld-rules";

function row(overrides: Partial<ReviewRow>): ReviewRow {
  return {
    id: 1,
    sheet: "01/03",
    file: "196_25_est_001_a",
    description: "Planta de formas",
    readDiscipline: "est",
    lowConfidence: false,
    reviewedAlertKeys: [],
    ...overrides,
  };
}

describe("sheet rules", () => {
  it("parses and formats sheet numbers with the expected padding", () => {
    expect(parseSheet(" 1 / 30 ")).toEqual({ number: 1, total: 30 });
    expect(formatSheet(1, 30)).toBe("01/30");
    expect(formatSheet(1, 120)).toBe("001/120");
  });

  it("orders valid sheets before invalid values", () => {
    const rows = [
      row({ id: 1, sheet: "sem folha" }),
      row({ id: 2, sheet: "05/30" }),
      row({ id: 3, sheet: "01/30" }),
    ].sort(compareBySheet);

    expect(rows.map((item) => item.id)).toEqual([3, 2, 1]);
  });
});

describe("tomo rules", () => {
  it("balances tomos and covers the full sheet interval", () => {
    expect(buildBalancedTomos(30, 3)).toEqual([
      { id: 1, title: "TOMO 1", start: "01/30", end: "10/30", quantity: 10 },
      { id: 2, title: "TOMO 2", start: "11/30", end: "20/30", quantity: 10 },
      { id: 3, title: "TOMO 3", start: "21/30", end: "30/30", quantity: 10 },
    ]);
  });

  it("clamps edited tomo quantity and redistributes remaining sheets", () => {
    const tomos = buildBalancedTomos(30, 3);

    expect(updateTomoQuantity(tomos, 30, 0, 28)).toEqual([
      { id: 1, title: "TOMO 1", start: "01/30", end: "28/30", quantity: 28 },
      { id: 2, title: "TOMO 2", start: "29/30", end: "29/30", quantity: 1 },
      { id: 3, title: "TOMO 3", start: "30/30", end: "30/30", quantity: 1 },
    ]);
  });
});

describe("validation rules", () => {
  it("blocks empty required fields and duplicate sheets", () => {
    const result = validateRows(
      [
        row({ id: 1, sheet: "01/03", file: "", description: "Fundacao" }),
        row({ id: 2, sheet: "01/03", file: "196_25_est_001_a", description: "" }),
      ],
      "est",
      3,
    );

    expect(result.blockingIssues).toEqual([
      "Linha 1: ARQUIVOS vazio.",
      "Folha 01/03 duplicada.",
      "Linha 2: DESCRIÇÃO vazia.",
    ]);
    expect(result.rowIssues[1].map((issue) => issue.key)).toEqual(["empty-file", "duplicate-1"]);
    expect(result.rowIssues[2].map((issue) => issue.key)).toEqual(["empty-description", "duplicate-1"]);
  });

  it("reports missing sheets and non-blocking warnings", () => {
    const result = validateRows(
      [
        row({ id: 1, sheet: "01/03" }),
        row({ id: 2, sheet: "03/04", readDiscipline: "fnd", lowConfidence: true }),
      ],
      "est",
      3,
    );

    expect(result.missingSheets).toEqual([2]);
    expect(result.totals).toEqual([3, 4]);
    expect(result.globalWarnings.map((warning) => warning.key)).toEqual([
      "total-reference",
      "missing-sheets",
    ]);
    expect(result.rowIssues[2].map((issue) => issue.key)).toEqual([
      "discipline-fnd",
      "low-confidence",
      "total-4",
    ]);
    expect(result.blockingIssues).toEqual([]);
  });
});
