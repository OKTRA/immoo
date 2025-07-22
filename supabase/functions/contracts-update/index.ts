import { serve } from "std/server";
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  const { id, content, status } = await req.json();
  const supabase = createClient();
  const { data, error } = await supabase
    .from("contracts")
    .update({ ...(content && { content }), ...(status && { status }) })
    .eq("id", id)
    .select();
  if (error) return new Response(JSON.stringify({ error }), { status: 500 });
  return new Response(JSON.stringify({ contract: data[0] }), { status: 200 });
}); 