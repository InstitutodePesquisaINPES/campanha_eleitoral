import { describe, it, expect } from "vitest";
import { NIVEL_FUNIL, NIVEIS_ORDENADOS, PAPEL_INFO } from "./classificacao";

describe("classificacao funil eleitoral", () => {
  it("expõe 6 níveis ordenados do funil", () => {
    expect(NIVEIS_ORDENADOS).toHaveLength(6);
    expect(NIVEIS_ORDENADOS[0]).toBe("desconhecido");
    expect(NIVEIS_ORDENADOS[5]).toBe("lideranca");
  });

  it("cada nível tem label, etapa e estilo", () => {
    for (const n of NIVEIS_ORDENADOS) {
      const info = NIVEL_FUNIL[n];
      expect(info.label).toBeTruthy();
      expect(info.className).toMatch(/border/);
      expect(typeof info.etapa).toBe("number");
    }
  });

  it("etapas são monotônicas crescentes", () => {
    const etapas = NIVEIS_ORDENADOS.map((n) => NIVEL_FUNIL[n].etapa);
    for (let i = 1; i < etapas.length; i++) {
      expect(etapas[i]).toBeGreaterThan(etapas[i - 1]);
    }
  });

  it("agrupa papéis em eleitoral / operacional / externo", () => {
    const grupos = new Set(Object.values(PAPEL_INFO).map((p) => p.grupo));
    expect(grupos.has("eleitoral")).toBe(true);
    expect(grupos.has("operacional")).toBe(true);
    expect(grupos.has("externo")).toBe(true);
  });
});
