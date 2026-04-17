// Edge Function: tse-ingest-chunk
// Recebe lotes de registros do worker externo (GitHub Actions) e faz upsert.
// Autenticação via header X-Ingest-Token (compara com secret TSE_INGEST_TOKEN).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Tabela =
  | "tse_eleitorado"
  | "tse_locais_votacao"
  | "tse_candidatos"
  | "tse_resultados_secao"
  | "tse_prestacao_contas";

interface Payload {
  tabela: Tabela;
  registros: Record<string, unknown>[];
  truncate_filter?: { ano: number; uf: string }; // se enviado no 1º chunk, limpa antes
  job_id?: string;
}

const ALLOWED: Tabela[] = [
  "tse_eleitorado",
  "tse_locais_votacao",
  "tse_candidatos",
  "tse_resultados_secao",
  "tse_prestacao_contas",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const token = req.headers.get("x-ingest-token");
    const expected = Deno.env.get("TSE_INGEST_TOKEN");
    if (!expected || token !== expected) {
      return json({ error: "unauthorized" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = (await req.json()) as Payload;
    if (!ALLOWED.includes(body.tabela)) return json({ error: "tabela inválida" }, 400);
    if (!Array.isArray(body.registros)) return json({ error: "registros deve ser array" }, 400);

    // Limpeza opcional (apenas no primeiro chunk de uma importação)
    if (body.truncate_filter) {
      const { ano, uf } = body.truncate_filter;
      const { error: delErr } = await supabase
        .from(body.tabela)
        .delete()
        .eq("ano", ano)
        .eq("uf", uf);
      if (delErr) console.error("delete error:", delErr.message);
    }

    if (body.registros.length === 0) {
      return json({ ok: true, inserted: 0 });
    }

    // Insert em sub-lotes de 500
    const SUBLOTE = 500;
    let inserted = 0;
    for (let i = 0; i < body.registros.length; i += SUBLOTE) {
      const slice = body.registros.slice(i, i + SUBLOTE);
      const { error } = await supabase.from(body.tabela).insert(slice);
      if (error) {
        console.error("insert error:", error.message);
        return json({ error: error.message, inserted }, 500);
      }
      inserted += slice.length;
    }

    if (body.job_id) {
      await supabase.from("tse_import_logs").insert({
        job_id: body.job_id,
        level: "info",
        message: `Chunk recebido: ${inserted} registros em ${body.tabela}`,
      });
    }

    return json({ ok: true, inserted });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(msg);
    return json({ error: msg }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
