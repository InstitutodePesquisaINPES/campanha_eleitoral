import { describe, it, expect } from "vitest";
import { PAPEL_LABEL, STATUS_LABEL } from "./useContratoAprovacoes";

describe("useContratoAprovacoes labels", () => {
  it("traduz todos os papéis", () => {
    expect(PAPEL_LABEL.tesoureiro).toBe("Tesoureiro");
    expect(PAPEL_LABEL.juridico).toBe("Jurídico");
    expect(PAPEL_LABEL.candidato).toBe("Candidato");
    expect(PAPEL_LABEL.admin).toBe("Admin");
  });

  it("traduz todos os status", () => {
    expect(STATUS_LABEL.pendente).toBe("Pendente");
    expect(STATUS_LABEL.aprovado).toBe("Aprovado");
    expect(STATUS_LABEL.rejeitado).toBe("Rejeitado");
    expect(STATUS_LABEL.revisao).toBe("Em revisão");
  });
});
