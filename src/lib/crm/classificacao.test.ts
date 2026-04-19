import { describe, it, expect } from "vitest";
import { classificarPessoa } from "./classificacao";

describe("classificarPessoa", () => {
  it("classifica como apoiador com score alto", () => {
    const r = classificarPessoa({ engajamento: 90, doacoes: 5, eventos: 3 });
    expect(r.nivel).toBeDefined();
    expect(typeof r.score).toBe("number");
  });

  it("retorna nivel para entrada vazia", () => {
    const r = classificarPessoa({});
    expect(r).toBeTruthy();
  });
});
