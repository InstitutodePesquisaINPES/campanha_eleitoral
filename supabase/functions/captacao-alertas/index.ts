// Envia notificações de SLA para doadores parados na pipeline de captação.
// Roda diariamente via pg_cron. Não requer autenticação (chamada interna).
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SLA_DIAS: Record<string, number> = {
  prospect: 5,
  contatado: 5,
  negociando: 10,
  confirmado: 15,
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { data: doadores, error } = await supabase
      .from("captacao_doadores")
      .select("id,nome,status,updated_at,responsavel_id,valor_estimado,valor_confirmado")
      .in("status", ["prospect", "contatado", "negociando", "confirmado"]);

    if (error) throw error;

    const agora = Date.now();
    const atrasados = (doadores || []).filter((d: any) => {
      const limite = SLA_DIAS[d.status] ?? 0;
      if (!limite) return false;
      const dias = (agora - new Date(d.updated_at).getTime()) / 86400000;
      return dias > limite;
    });

    // Agrupa por responsável
    const porResp = new Map<string, any[]>();
    for (const d of atrasados) {
      const key = d.responsavel_id || "gestores";
      if (!porResp.has(key)) porResp.set(key, []);
      porResp.get(key)!.push(d);
    }

    let notificados = 0;
    for (const [userId, lista] of porResp) {
      const titulo = `Captação: ${lista.length} doador(es) com SLA estourado`;
      const msg = lista.slice(0, 5).map((d) => `${d.nome} (${d.status})`).join(", ");

      if (userId === "gestores") {
        const { data } = await supabase.rpc("notificar_gestores", {
          _titulo: titulo,
          _mensagem: msg,
          _tipo: "alerta",
          _prioridade: "alta",
          _link: "/financeiro?tab=captacao",
          _entidade_tipo: "captacao",
          _entidade_id: null,
        });
        notificados += Number(data || 0);
      } else {
        await supabase.rpc("criar_notificacao", {
          _user_id: userId,
          _titulo: titulo,
          _mensagem: msg,
          _tipo: "alerta",
          _prioridade: "alta",
          _link: "/financeiro?tab=captacao",
          _entidade_tipo: "captacao",
          _entidade_id: null,
        });
        notificados += 1;
      }
    }

    return new Response(
      JSON.stringify({ ok: true, atrasados: atrasados.length, notificados }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("captacao-alertas error", e);
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
